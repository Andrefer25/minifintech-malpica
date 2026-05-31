import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { GetUsersUseCase, GET_USERS_USE_CASE } from '../../../application/get-users/get-users.use-case';
import { GetUserUseCase, GET_USER_USE_CASE } from '../../../application/get-user/get-user.use-case';
import { GetUserBalanceHistoryUseCase, GET_USER_BALANCE_HISTORY_USE_CASE } from '../../../application/get-user-balance-history/get-user-balance-history.use-case';
import { authMiddleware } from '../middleware/auth.middleware';
import { authHeaderSchema, paginationQuerySchema, IdParams, PaginationQuery } from '../dto/common.dto';

export async function userRoutes(fastify: FastifyInstance) {
  const getUsersUseCase = fastify.container.resolve<GetUsersUseCase>(GET_USERS_USE_CASE);
  const getUserUseCase = fastify.container.resolve<GetUserUseCase>(GET_USER_USE_CASE);
  const getUserBalanceHistoryUseCase = fastify.container.resolve<GetUserBalanceHistoryUseCase>(GET_USER_BALANCE_HISTORY_USE_CASE);

  fastify.get<{ Querystring: PaginationQuery }>('/users', {
    preHandler: authMiddleware,
    schema: {
      tags: ['users'],
      headers: authHeaderSchema,
      querystring: paginationQuerySchema,
    },
  }, async (request, reply: FastifyReply) => {
    const { page, limit } = request.query;
    const result = await getUsersUseCase.execute({
      page: page !== undefined ? Number(page) : undefined,
      limit: limit !== undefined ? Number(limit) : undefined,
    });
    return reply.send(result);
  });

  fastify.get<{ Params: IdParams }>('/users/:id', {
    preHandler: authMiddleware,
    schema: { tags: ['users'], headers: authHeaderSchema },
  }, async (request, reply: FastifyReply) => {
    const user = await getUserUseCase.execute({ userId: request.params.id });
    return reply.send(user);
  });

  // GET /users/:id/balance-history
  fastify.get<{ Params: IdParams }>('/users/:id/balance-history', {
    preHandler: authMiddleware,
    schema: { tags: ['users'], headers: authHeaderSchema },
  }, async (request, reply: FastifyReply) => {
    const history = await getUserBalanceHistoryUseCase.execute({ userId: request.params.id });
    return reply.send(history);
  });
}
