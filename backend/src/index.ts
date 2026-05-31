import 'reflect-metadata';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { AppDataSource } from './infrastructure/persistence/data-source';
import { createDIContainer } from './infrastructure/di/container';
import { transactionRoutes } from './infrastructure/http/routes/transaction.routes';
import { userRoutes } from './infrastructure/http/routes/user.routes';
import { dashboardRoutes } from './infrastructure/http/routes/dashboard.routes';
import { DomainError } from './domain/shared/domain-error';

const fastify = Fastify({
  logger: true,
});

function parseCorsOrigin(value: string | undefined): boolean | string | string[] {
  if (!value || value === '*') return true;
  if (value.includes(',')) return value.split(',').map((v) => v.trim()).filter(Boolean);
  return value;
}

async function start() {
  try {
    // Register CORS (configurable vía env)
    await fastify.register(cors, {
      origin: parseCorsOrigin(process.env.CORS_ORIGIN),
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'x-user-id'],
    });

    // Register Swagger
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'Malpica - Belo Challenge API',
          description: 'API para gestión de transacciones financieras',
          version: '1.0.0',
        },
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Development server',
          },
        ],
        tags: [
          { name: 'health', description: 'Health check' },
          { name: 'transactions', description: 'Operaciones de transacciones' },
          { name: 'users', description: 'Operaciones de usuarios' },
          { name: 'dashboard', description: 'KPIs agregados para el dashboard' },
        ],
        components: {
          schemas: {
            User: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                balance: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
            Transaction: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                originUserId: { type: 'string', format: 'uuid' },
                destinationUserId: { type: 'string', format: 'uuid' },
                amount: { type: 'number' },
                status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] },
                rejectionReason: { type: 'string', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                approvedAt: { type: 'string', format: 'date-time', nullable: true },
                rejectedAt: { type: 'string', format: 'date-time', nullable: true },
              },
            },
            CreateTransaction: {
              type: 'object',
              required: ['originUserId', 'destinationUserId', 'amount'],
              properties: {
                originUserId: { type: 'string', format: 'uuid' },
                destinationUserId: { type: 'string', format: 'uuid' },
                amount: { type: 'number', minimum: 0.01 },
              },
            },
            RejectTransaction: {
              type: 'object',
              required: ['transactionId'],
              properties: {
                transactionId: { type: 'string', format: 'uuid' },
                reason: { type: 'string' },
              },
            },
            Error: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
          securitySchemes: {
            xUserId: {
              type: 'apiKey',
              in: 'header',
              name: 'x-user-id',
              description: 'User ID for simulated authentication',
            },
          },
        },
        security: [
          {
            xUserId: [],
          },
        ],
      },
    });

    // Register Swagger UI
    await fastify.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false,
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject, request, reply) => {
        return swaggerObject;
      },
      transformSpecificationClone: true,
    });

    // Inicializar DataSource y crear container DI
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const container = createDIContainer(AppDataSource);
    fastify.container = container;

    // Error handler centralizado: mapea errores de dominio a HTTP
    fastify.setErrorHandler((error, request, reply) => {
      if (error instanceof DomainError) {
        return reply.status(error.httpStatus).send({ message: error.message });
      }
      // Errores de validación de Fastify (schema)
      const err = error as { validation?: unknown; message?: string };
      if (err.validation) {
        return reply.status(400).send({ message: err.message ?? 'Error de validación' });
      }
      request.log.error(error);
      return reply.status(500).send({ message: 'Error interno del servidor' });
    });

    // Register routes
    await fastify.register(transactionRoutes);
    await fastify.register(userRoutes);
    await fastify.register(dashboardRoutes);

    // Health check
    fastify.get('/health', {
      schema: {
        tags: ['health'],
        description: 'Health check endpoint',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    }, async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Start server
    const port = parseInt(process.env.PORT || '3000');
    await fastify.listen({ port, host: '0.0.0.0' });

    console.log(`🚀 Server is running on http://localhost:${port}`);
    console.log(`📚 Swagger documentation available at http://localhost:${port}/docs`);

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      fastify.log.info({ signal }, 'Shutting down...');
      try {
        await fastify.close();
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
        }
        process.exit(0);
      } catch (err) {
        fastify.log.error(err);
        process.exit(1);
      }
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
