import { RejectTransactionUseCase } from './reject-transaction.use-case';
import { UnitOfWork } from '../../domain/shared/unit-of-work';
import { TransactionRepository } from '../../domain/transaction/transaction.repository';
import { TransactionStatusHistoryRepository } from '../../domain/transaction/transaction-status-history.repository';
import { Transaction } from '../../domain/transaction/transaction';
import { TransactionStatus } from '../../domain/transaction/transaction-status.enum';

describe('RejectTransactionUseCase', () => {
  let useCase: RejectTransactionUseCase;
  let mockUnitOfWork: jest.Mocked<UnitOfWork>;
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;
  let mockTransactionStatusHistoryRepository: jest.Mocked<TransactionStatusHistoryRepository>;

  beforeEach(() => {
    mockTransactionRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as any;

    mockTransactionStatusHistoryRepository = {
      save: jest.fn(),
      findByTransactionId: jest.fn(),
    } as any;

    mockUnitOfWork = {
      run: jest.fn().mockImplementation((work) => work({
        transactions: mockTransactionRepository,
        transactionStatusHistory: mockTransactionStatusHistoryRepository,
        users: {} as any,
        userBalanceHistory: {} as any,
        lockUser: jest.fn(),
      })),
    } as any;

    useCase = new RejectTransactionUseCase(mockUnitOfWork);
  });

  describe('execute', () => {
    it('should reject pending transaction with reason', async () => {
      const transaction = new Transaction(
        'tx1',
        'user1',
        'user2',
        60000,
        TransactionStatus.PENDING,
        null,
        new Date(),
        new Date(),
        null,
        null,
        null,
      );

      mockTransactionRepository.findById.mockResolvedValue(transaction);
      mockTransactionRepository.update.mockResolvedValue(transaction);

      await useCase.execute({
        transactionId: 'tx1',
        reason: 'Insufficient funds',
      });

      expect(transaction.status).toBe(TransactionStatus.REJECTED);
      expect(transaction.rejectionReason).toBe('Insufficient funds');
      expect(transaction.rejectedAt).not.toBeNull();
      expect(mockTransactionRepository.update).toHaveBeenCalledWith(transaction);
      expect(mockTransactionStatusHistoryRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should reject pending transaction without reason', async () => {
      const transaction = new Transaction(
        'tx1',
        'user1',
        'user2',
        60000,
        TransactionStatus.PENDING,
        null,
        new Date(),
        new Date(),
        null,
        null,
        null,
      );

      mockTransactionRepository.findById.mockResolvedValue(transaction);
      mockTransactionRepository.update.mockResolvedValue(transaction);

      await useCase.execute({ transactionId: 'tx1' });

      expect(transaction.status).toBe(TransactionStatus.REJECTED);
      expect(transaction.rejectionReason).toBeNull();
      expect(transaction.rejectedAt).not.toBeNull();
    });

    it('should throw error when transaction not found', async () => {
      mockTransactionRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({ transactionId: 'tx1' }),
      ).rejects.toThrow('Transacción no encontrada');
    });

    it('should throw error when transaction is not pending', async () => {
      const transaction = new Transaction(
        'tx1',
        'user1',
        'user2',
        60000,
        TransactionStatus.COMPLETED,
        null,
        new Date(),
        new Date(),
        null,
        null,
        new Date(),
      );

      mockTransactionRepository.findById.mockResolvedValue(transaction);

      await expect(
        useCase.execute({ transactionId: 'tx1' }),
      ).rejects.toThrow('La transacción no está pendiente');
    });

    it('should throw error when transaction is already rejected', async () => {
      const transaction = new Transaction(
        'tx1',
        'user1',
        'user2',
        60000,
        TransactionStatus.REJECTED,
        'Already rejected',
        new Date(),
        new Date(),
        null,
        new Date(),
        null,
      );

      mockTransactionRepository.findById.mockResolvedValue(transaction);

      await expect(
        useCase.execute({ transactionId: 'tx1' }),
      ).rejects.toThrow('La transacción no está pendiente');
    });
  });
});
