import { CreateTransactionUseCase } from './create-transaction.use-case';
import { UserRepository } from '../../domain/user/user.repository';
import { TransactionRepository } from '../../domain/transaction/transaction.repository';
import { User } from '../../domain/user/user';
import { createFakeUnitOfWork } from '../__test-helpers/fake-unit-of-work';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
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
    useCase = new CreateTransactionUseCase(uow);
  });

  describe('execute', () => {
    it('should create and auto-approve transaction for amount <= 50000', async () => {
      const originUser = new User('user1', 'John', 'john@example.com', 100000, new Date(), new Date());
      const destinationUser = new User('user2', 'Jane', 'jane@example.com', 50000, new Date(), new Date());

      mockUserRepository.findById
        .mockResolvedValueOnce(originUser)
        .mockResolvedValueOnce(destinationUser)
        .mockResolvedValueOnce(originUser);
      mockTransactionRepository.save.mockResolvedValue({} as any);
      mockUserRepository.update.mockResolvedValue(originUser).mockResolvedValue(destinationUser);

      const result = await useCase.execute({
        originUserId: 'user1',
        destinationUserId: 'user2',
        amount: 45000,
      });

      expect(originUser.balance).toBe(55000);
      expect(destinationUser.balance).toBe(95000);
      expect(mockUserRepository.update).toHaveBeenCalledTimes(2);
    });

    it('should create pending transaction for amount > 50000', async () => {
      const originUser = new User('user1', 'John', 'john@example.com', 100000, new Date(), new Date());
      const destinationUser = new User('user2', 'Jane', 'jane@example.com', 50000, new Date(), new Date());

      mockUserRepository.findById.mockResolvedValueOnce(originUser).mockResolvedValueOnce(destinationUser);
      mockTransactionRepository.save.mockResolvedValue({} as any);

      const result = await useCase.execute({
        originUserId: 'user1',
        destinationUserId: 'user2',
        amount: 60000,
      });

      expect(originUser.balance).toBe(100000);
      expect(destinationUser.balance).toBe(50000);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw error when origin user not found', async () => {
      mockUserRepository.findById.mockResolvedValueOnce(null);

      await expect(
        useCase.execute({
          originUserId: 'user1',
          destinationUserId: 'user2',
          amount: 1000,
        }),
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('should throw error when destination user not found', async () => {
      const originUser = new User('user1', 'John', 'john@example.com', 100000, new Date(), new Date());
      mockUserRepository.findById.mockResolvedValueOnce(originUser).mockResolvedValueOnce(null);

      await expect(
        useCase.execute({
          originUserId: 'user1',
          destinationUserId: 'user2',
          amount: 1000,
        }),
      ).rejects.toThrow('Usuario no encontrado');
    });

    it('should throw error when origin user has insufficient balance', async () => {
      const originUser = new User('user1', 'John', 'john@example.com', 1000, new Date(), new Date());
      const destinationUser = new User('user2', 'Jane', 'jane@example.com', 50000, new Date(), new Date());

      mockUserRepository.findById
        .mockResolvedValueOnce(originUser)
        .mockResolvedValueOnce(destinationUser)
        .mockResolvedValueOnce(originUser);

      await expect(
        useCase.execute({
          originUserId: 'user1',
          destinationUserId: 'user2',
          amount: 45000,
        }),
      ).rejects.toThrow('Saldo insuficiente');
    });
  });
});
