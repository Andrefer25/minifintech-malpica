import { GetTransactionsUseCase } from './get-transactions.use-case';
import { TransactionRepository } from '../../domain/transaction/transaction.repository';
import { TransactionStatus } from '../../domain/transaction/transaction-status.enum';

describe('GetTransactionsUseCase', () => {
  let useCase: GetTransactionsUseCase;
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;

  beforeEach(() => {
    mockTransactionRepository = {
      findById: jest.fn(),
      findPaginated: jest.fn().mockResolvedValue({ data: [], total: 0 }),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countByStatus: jest.fn(),
      countCreatedToday: jest.fn(),
      sumApprovedVolumeToday: jest.fn(),
    } as any;

    useCase = new GetTransactionsUseCase(mockTransactionRepository);
  });

  it('forwards all filters to the repository', async () => {
    const from = new Date('2026-01-01T00:00:00Z');
    const to = new Date('2026-01-31T23:59:59Z');

    await useCase.execute({
      userId: 'u1',
      originUserId: 'u2',
      destinationUserId: 'u3',
      status: TransactionStatus.APPROVED,
      fromDate: from,
      toDate: to,
      minAmount: 100,
      maxAmount: 5000,
      page: 2,
      limit: 20,
    });

    expect(mockTransactionRepository.findPaginated).toHaveBeenCalledWith(
      {
        userId: 'u1',
        originUserId: 'u2',
        destinationUserId: 'u3',
        status: TransactionStatus.APPROVED,
        fromDate: from,
        toDate: to,
        minAmount: 100,
        maxAmount: 5000,
      },
      2,
      20,
    );
  });

  it('applies default pagination when not provided', async () => {
    await useCase.execute({});
    expect(mockTransactionRepository.findPaginated).toHaveBeenCalledWith(
      expect.anything(),
      1,
      10,
    );
  });

  it('clamps page and limit to safe bounds', async () => {
    await useCase.execute({ page: -3, limit: 999 });
    expect(mockTransactionRepository.findPaginated).toHaveBeenCalledWith(
      expect.anything(),
      1,
      100,
    );
  });

  it('throws InvalidDateRangeError when fromDate > toDate', async () => {
    await expect(
      useCase.execute({
        fromDate: new Date('2026-02-01T00:00:00Z'),
        toDate: new Date('2026-01-01T00:00:00Z'),
      }),
    ).rejects.toThrow('La fecha de inicio debe ser menor o igual a la fecha de fin');
  });

  it('throws InvalidAmountRangeError when minAmount > maxAmount', async () => {
    await expect(
      useCase.execute({ minAmount: 5000, maxAmount: 100 }),
    ).rejects.toThrow('El monto mínimo debe ser menor o igual al monto máximo');
  });

  it('returns paginated result with metadata', async () => {
    mockTransactionRepository.findPaginated.mockResolvedValue({ data: [], total: 42 });
    const result = await useCase.execute({ page: 3, limit: 5 });
    expect(result).toEqual({ data: [], pagination: { page: 3, limit: 5, total: 42 } });
  });
});
