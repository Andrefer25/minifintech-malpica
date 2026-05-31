import { GetDashboardStatsUseCase } from './get-dashboard-stats.use-case';
import { UserRepository } from '../../domain/user/user.repository';
import { TransactionRepository } from '../../domain/transaction/transaction.repository';
import { TransactionStatus } from '../../domain/transaction/transaction-status.enum';

describe('GetDashboardStatsUseCase', () => {
  let useCase: GetDashboardStatsUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;

  beforeEach(() => {
    mockUserRepository = {
      countAll: jest.fn().mockResolvedValue(10),
      sumBalances: jest.fn().mockResolvedValue(123456.78),
    } as any;

    mockTransactionRepository = {
      countCreatedToday: jest.fn().mockResolvedValue(5),
      sumApprovedVolumeToday: jest.fn().mockResolvedValue(98765.43),
      countByStatus: jest.fn().mockImplementation((status: TransactionStatus) => {
        switch (status) {
          case TransactionStatus.PENDING:
            return Promise.resolve(2);
          case TransactionStatus.APPROVED:
            return Promise.resolve(20);
          case TransactionStatus.REJECTED:
            return Promise.resolve(1);
        }
      }),
    } as any;

    useCase = new GetDashboardStatsUseCase(mockUserRepository, mockTransactionRepository);
  });

  it('returns aggregated KPIs from both repositories', async () => {
    const result = await useCase.execute();

    expect(result).toEqual({
      totalUsers: 10,
      totalBalance: 123456.78,
      transactionsToday: 5,
      volumeToday: 98765.43,
      pendingCount: 2,
      approvedCount: 20,
      rejectedCount: 1,
    });
  });

  it('queries each status separately', async () => {
    await useCase.execute();
    expect(mockTransactionRepository.countByStatus).toHaveBeenCalledWith(TransactionStatus.PENDING);
    expect(mockTransactionRepository.countByStatus).toHaveBeenCalledWith(TransactionStatus.APPROVED);
    expect(mockTransactionRepository.countByStatus).toHaveBeenCalledWith(TransactionStatus.REJECTED);
  });
});
