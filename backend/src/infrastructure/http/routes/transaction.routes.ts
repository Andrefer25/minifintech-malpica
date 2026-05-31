import { FastifyInstance, FastifyReply } from 'fastify';
import { CreateTransactionUseCase, CREATE_TRANSACTION_USE_CASE } from '../../../application/create-transaction/create-transaction.use-case';
import { GetTransactionsUseCase, GET_TRANSACTIONS_USE_CASE } from '../../../application/get-transactions/get-transactions.use-case';
import { ApproveTransactionUseCase, APPROVE_TRANSACTION_USE_CASE } from '../../../application/approve-transaction/approve-transaction.use-case';
import { RejectTransactionUseCase, REJECT_TRANSACTION_USE_CASE } from '../../../application/reject-transaction/reject-transaction.use-case';
import { GetTransactionUseCase, GET_TRANSACTION_USE_CASE } from '../../../application/get-transaction/get-transaction.use-case';
import { GetTransactionStatusHistoryUseCase, GET_TRANSACTION_STATUS_HISTORY_USE_CASE } from '../../../application/get-transaction-status-history/get-transaction-status-history.use-case';
import { authMiddleware } from '../middleware/auth.middleware';
import { authHeaderSchema, IdParams } from '../dto/common.dto';
import {
  createTransactionSchema,
  rejectTransactionSchema,
  listTransactionsQuerySchema,
  CreateTransactionBody,
  RejectTransactionBody,
  ListTransactionsQuery,
} from '../dto/transaction.dto';

export async function transactionRoutes(fastify: FastifyInstance) {
  const createTransactionUseCase = fastify.container.resolve<CreateTransactionUseCase>(CREATE_TRANSACTION_USE_CASE);
  const getTransactionsUseCase = fastify.container.resolve<GetTransactionsUseCase>(GET_TRANSACTIONS_USE_CASE);
  const getTransactionUseCase = fastify.container.resolve<GetTransactionUseCase>(GET_TRANSACTION_USE_CASE);
  const approveTransactionUseCase = fastify.container.resolve<ApproveTransactionUseCase>(APPROVE_TRANSACTION_USE_CASE);
  const rejectTransactionUseCase = fastify.container.resolve<RejectTransactionUseCase>(REJECT_TRANSACTION_USE_CASE);
  const getTransactionStatusHistoryUseCase = fastify.container.resolve<GetTransactionStatusHistoryUseCase>(GET_TRANSACTION_STATUS_HISTORY_USE_CASE);

  // POST /transactions - Create transaction
  fastify.post<{ Body: CreateTransactionBody }>('/transactions', {
    preHandler: authMiddleware,
    schema: { tags: ['transactions'], body: createTransactionSchema, headers: authHeaderSchema },
  }, async (request, reply: FastifyReply) => {
    const result = await createTransactionUseCase.execute(request.body);
    const message = result.transaction.status === 'COMPLETED'
      ? 'Transacción completada automáticamente'
      : 'Transacción pendiente de aprobación manual';
    return reply.status(201).send({
      id: result.transaction.id,
      status: result.transaction.status,
      message,
    });
  });

  // GET /transactions - paginated with optional filters
  fastify.get<{ Querystring: ListTransactionsQuery }>('/transactions', {
    preHandler: authMiddleware,
    schema: {
      tags: ['transactions'],
      headers: authHeaderSchema,
      querystring: listTransactionsQuerySchema,
    },
  }, async (request, reply: FastifyReply) => {
    const {
      userId,
      originUserId,
      destinationUserId,
      status,
      fromDate,
      toDate,
      minAmount,
      maxAmount,
      page,
      limit,
    } = request.query;
    const result = await getTransactionsUseCase.execute({
      userId,
      originUserId,
      destinationUserId,
      status,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
      minAmount: minAmount !== undefined ? Number(minAmount) : undefined,
      maxAmount: maxAmount !== undefined ? Number(maxAmount) : undefined,
      page: page !== undefined ? Number(page) : undefined,
      limit: limit !== undefined ? Number(limit) : undefined,
    });
    return reply.send(result);
  });

  // GET /transactions/:id
  fastify.get<{ Params: IdParams }>('/transactions/:id', {
    preHandler: authMiddleware,
    schema: { tags: ['transactions'], headers: authHeaderSchema },
  }, async (request, reply: FastifyReply) => {
    const transaction = await getTransactionUseCase.execute({ transactionId: request.params.id });
    return reply.send(transaction);
  });

  // PATCH /transactions/:id/approve
  fastify.patch<{ Params: IdParams }>('/transactions/:id/approve', {
    preHandler: authMiddleware,
    schema: { tags: ['transactions'], headers: authHeaderSchema },
  }, async (request, reply: FastifyReply) => {
    const transaction = await approveTransactionUseCase.execute({ transactionId: request.params.id });
    return reply.send({
      id: transaction.id,
      status: transaction.status,
      message: 'Transacción aprobada y completada',
    });
  });

  // PATCH /transactions/:id/reject
  fastify.patch<{ Params: IdParams; Body: RejectTransactionBody }>('/transactions/:id/reject', {
    preHandler: authMiddleware,
    schema: { tags: ['transactions'], body: rejectTransactionSchema, headers: authHeaderSchema },
  }, async (request, reply: FastifyReply) => {
    const transaction = await rejectTransactionUseCase.execute({
      transactionId: request.params.id,
      reason: request.body?.reason,
    });
    return reply.send({
      id: transaction.id,
      status: transaction.status,
      message: 'Transacción rechazada exitosamente',
    });
  });

  // GET /transactions/:id/status-history
  fastify.get<{ Params: IdParams }>('/transactions/:id/status-history', {
    preHandler: authMiddleware,
    schema: { tags: ['transactions'], headers: authHeaderSchema },
  }, async (request, reply: FastifyReply) => {
    const history = await getTransactionStatusHistoryUseCase.execute({ transactionId: request.params.id });
    return reply.send(history);
  });
}
