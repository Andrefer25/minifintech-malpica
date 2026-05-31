import { FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  // Get header case-insensitively
  const userId = request.headers['x-user-id'] as string || request.headers['X-User-Id'] as string;

  if (!userId || userId === '') {
    return reply.status(401).send({ message: 'Encabezado x-user-id requerido' });
  }

  // Validate UUID format (basic validation)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return reply.status(401).send({ message: 'Formato de x-user-id inválido' });
  }

  // Attach userId to request for use in handlers
  (request as any).userId = userId;
}
