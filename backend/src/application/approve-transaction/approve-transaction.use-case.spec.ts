import { ApproveTransactionUseCase } from './approve-transaction.use-case';
import { UserRepository } from '../../domain/user/user.repository';
import { TransactionRepository } from '../../domain/transaction/transaction.repository';
import { User } from '../../domain/user/user';
import { Transaction } from '../../domain/transaction/transaction';
import { TransactionStatus } from '../../domain/transaction/transaction-status.enum';
import { createFakeUnitOfWork } from '../__test-helpers/fake-unit-of-work';

describe('ApproveTransactionUseCase', () => {
  let useCase: ApproveTransactionUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockTransactionRepository: jest.Mocked<TransactionRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    mockTransactionRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdPaginated: jest.fn(),
      findByStatus: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    const uow = createFakeUnitOfWork(mockUserRepository, mockTransactionRepository);
    useCase = new ApproveTransactionUseCase(uow);
  });

  describe('execute', () => {
    it('should approve pending transaction and transfer funds', async () => {
      const originUser = new User('user1', 'John', 'john@example.com', 100000, new Date(), new Date());
      const destinationUser = new User('user2', 'Jane', 'jane@example.com', 50000, new Date(), new Date());
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
      );

      mockTransactionRepository.findById.mockResolvedValue(transaction);
      mockUserRepository.findById.mockResolvedValueOnce(originUser).mockResolvedValueOnce(destinationUser);
      mockUserRepository.update.mockResolvedValue(originUser).mockResolvedValue(destinationUser);
      mockTransactionRepository.update.mockResolvedValue(transaction);

      const result = await useCase.execute({ transactionId: 'tx1' });

      expect(originUser.balance).toBe(40000);
      expect(destinationUser.balance).toBe(110000);
      expect(transaction.status).toBe(TransactionStatus.COMPLETED);
      expect(transaction.approvedAt).not.toBeNull();
      expect(transaction.completedAt).not.toBeNull();
      expect(mockUserRepository.update).toHaveBeenCalledTimes(2);
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
        TransactionStatus.APPROVED,
        null,
        new Date(),
        new Date(),
        new Date(),
        null,
      );

      mockTransactionRepository.findById.mockResolvedValue(transaction);

      await expect(
        useCase.execute({ transactionId: 'tx1' }),
      ).rejects.toThrow('La transacción no está pendiente');
    });

    it('should throw error when origin user not found', async () => {
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
      );

      mockTransactionRepository.findById.mockResolvedValue(transaction);
      mockUserRepository.findById.mockResolvedValueOnce(null);

      await expect(
        useCase.execute({ transactionId: 'tx1' }),
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('should reject transaction and throw when insufficient balance at approval time', async () => {
      const originUser = new User('user1', 'John', 'john@example.com', 1000, new Date(), new Date());
      const destinationUser = new User('user2', 'Jane', 'jane@example.com', 50000, new Date(), new Date());
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
      );

      mockTransactionRepository.findById.mockResolvedValue(transaction);
      mockUserRepository.findById.mockResolvedValueOnce(originUser).mockResolvedValueOnce(destinationUser);
      mockTransactionRepository.update.mockResolvedValue(transaction);

      await expect(
        useCase.execute({ transactionId: 'tx1' }),
      ).rejects.toThrow('Saldo insuficiente');

      expect(transaction.status).toBe(TransactionStatus.REJECTED);
      expect(transaction.rejectionReason).toBe('Saldo insuficiente');
      expect(mockTransactionRepository.update).toHaveBeenCalledWith(transaction);
    });
  });
});
