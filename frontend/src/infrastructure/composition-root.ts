import { GetDashboardKpisUseCase } from '@/application/dashboard/get-dashboard-kpis.use-case';
import { ApproveTransactionUseCase } from '@/application/transaction/approve-transaction.use-case';
import { CreateTransactionUseCase } from '@/application/transaction/create-transaction.use-case';
import { GetTransactionByIdUseCase } from '@/application/transaction/get-transaction-by-id.use-case';
import { ListPendingTransactionsUseCase } from '@/application/transaction/list-pending-transactions.use-case';
import { ListTransactionsUseCase } from '@/application/transaction/list-transactions.use-case';
import { RejectTransactionUseCase } from '@/application/transaction/reject-transaction.use-case';
import { GetUserByIdUseCase } from '@/application/user/get-user-by-id.use-case';
import { ListUsersUseCase } from '@/application/user/list-users.use-case';
import { ListUsersPaginatedUseCase } from '@/application/user/list-users-paginated.use-case';
import { getUserId } from './auth/user-id.storage';
import { DashboardHttpGateway } from './http/dashboard-http.gateway';
import { HttpClient } from './http/http-client';
import { TransactionHttpGateway } from './http/transaction-http.gateway';
import { UserHttpGateway } from './http/user-http.gateway';

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const httpClient = new HttpClient(baseUrl, getUserId);

const userGateway = new UserHttpGateway(httpClient);
const transactionGateway = new TransactionHttpGateway(httpClient);
const dashboardGateway = new DashboardHttpGateway(httpClient);

export const useCases = {
  listUsers: new ListUsersUseCase(userGateway),
  listUsersPaginated: new ListUsersPaginatedUseCase(userGateway),
  getUserById: new GetUserByIdUseCase(userGateway),
  listTransactions: new ListTransactionsUseCase(transactionGateway),
  listPendingTransactions: new ListPendingTransactionsUseCase(transactionGateway),
  getTransactionById: new GetTransactionByIdUseCase(transactionGateway),
  createTransaction: new CreateTransactionUseCase(transactionGateway),
  approveTransaction: new ApproveTransactionUseCase(transactionGateway),
  rejectTransaction: new RejectTransactionUseCase(transactionGateway),
  getDashboardKpis: new GetDashboardKpisUseCase(dashboardGateway),
};

export type UseCases = typeof useCases;
