import { UserRepository } from '../../domain/user/user.repository';
import { TransactionRepository } from '../../domain/transaction/transaction.repository';
import { TransactionStatus } from '../../domain/transaction/transaction-status.enum';

export interface DashboardStats {
  totalUsers: number;
  totalBalance: number;
  transactionsToday: number;
  volumeToday: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export class GetDashboardStatsUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(): Promise<DashboardStats> {
    const [
      totalUsers,
      totalBalance,
      transactionsToday,
      volumeToday,
      pendingCount,
      approvedCount,
      rejectedCount,
    ] = await Promise.all([
      this.userRepository.countAll(),
      this.userRepository.sumBalances(),
      this.transactionRepository.countCreatedToday(),
      this.transactionRepository.sumApprovedVolumeToday(),
      this.transactionRepository.countByStatus(TransactionStatus.PENDING),
      this.transactionRepository.countByStatus(TransactionStatus.APPROVED),
      this.transactionRepository.countByStatus(TransactionStatus.REJECTED),
    ]);

    return {
      totalUsers,
      totalBalance,
      transactionsToday,
      volumeToday,
      pendingCount,
      approvedCount,
      rejectedCount,
    };
  }
}

export const GET_DASHBOARD_STATS_USE_CASE = 'GetDashboardStatsUseCase';
