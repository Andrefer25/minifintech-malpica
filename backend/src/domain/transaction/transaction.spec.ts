import { Transaction } from './transaction';
import { TransactionStatus } from './transaction-status.enum';

describe('Transaction Entity', () => {
  describe('create', () => {
    it('should create a transaction with auto-completion for amount <= 50000', () => {
      const transaction = Transaction.create('user1', 'user2', 50000);

      expect(transaction.status).toBe(TransactionStatus.COMPLETED);
      expect(transaction.completedAt).not.toBeNull();
    });

    it('should create a transaction with pending status for amount > 50000', () => {
      const transaction = Transaction.create('user1', 'user2', 50001);

      expect(transaction.status).toBe(TransactionStatus.PENDING);
      expect(transaction.completedAt).toBeNull();
    });

    it('should throw error when amount is zero', () => {
      expect(() => Transaction.create('user1', 'user2', 0)).toThrow('El monto debe ser mayor a cero');
    });

    it('should throw error when amount is negative', () => {
      expect(() => Transaction.create('user1', 'user2', -100)).toThrow('El monto debe ser mayor a cero');
    });

    it('should throw error when origin and destination users are the same', () => {
      expect(() => Transaction.create('user1', 'user1', 1000)).toThrow('El usuario origen y destino no pueden ser el mismo');
    });

    it('should generate unique IDs for different transactions', () => {
      const transaction1 = Transaction.create('user1', 'user2', 1000);
      const transaction2 = Transaction.create('user1', 'user3', 2000);

      expect(transaction1.id).not.toBe(transaction2.id);
    });
  });

  describe('approve', () => {
    it('should approve a pending transaction and set approvedAt', () => {
      const transaction = new Transaction(
        '123',
        'user1',
        'user2',
        50001,
        TransactionStatus.PENDING,
        null,
        new Date(),
        new Date(),
        null,
        null,
        null,
      );

      transaction.approve();

      expect(transaction.status).toBe(TransactionStatus.APPROVED);
      expect(transaction.approvedAt).not.toBeNull();
      expect(transaction.completedAt).toBeNull();
    });

    it('should complete an approved transaction and set completedAt', () => {
      const transaction = new Transaction(
        '123',
        'user1',
        'user2',
        50001,
        TransactionStatus.APPROVED,
        null,
        new Date(),
        new Date(),
        new Date(),
        null,
        null,
      );

      transaction.complete();

      expect(transaction.status).toBe(TransactionStatus.COMPLETED);
      expect(transaction.completedAt).not.toBeNull();
    });

    it('should throw error when completing a non-approved transaction', () => {
      const transaction = new Transaction(
        '123',
        'user1',
        'user2',
        50001,
        TransactionStatus.PENDING,
        null,
        new Date(),
        new Date(),
        null,
        null,
        null,
      );

      expect(() => transaction.complete()).toThrow('Solo las transacciones aprobadas pueden completarse');
    });

    it('should throw error when transaction is already completed', () => {
      const transaction = new Transaction(
        '123',
        'user1',
        'user2',
        50000,
        TransactionStatus.COMPLETED,
        null,
        new Date(),
        new Date(),
        null,
        null,
        new Date(),
      );

      expect(() => transaction.approve()).toThrow('Solo las transacciones pendientes pueden ser aprobadas');
    });

    it('should throw error when transaction is rejected', () => {
      const transaction = new Transaction(
        '123',
        'user1',
        'user2',
        50001,
        TransactionStatus.REJECTED,
        null,
        new Date(),
        new Date(),
        null,
        new Date(),
        null,
      );

      expect(() => transaction.approve()).toThrow('Solo las transacciones pendientes pueden ser aprobadas');
    });

    it('should update updatedAt timestamp', () => {
      const transaction = new Transaction(
        '123',
        'user1',
        'user2',
        50001,
        TransactionStatus.PENDING,
        null,
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        null,
        null,
        null,
      );

      transaction.approve();

      expect(transaction.updatedAt.getTime()).toBeGreaterThan(new Date('2024-01-01').getTime());
    });
  });

  describe('reject', () => {
    it('should reject a pending transaction with reason', () => {
      const transaction = new Transaction(
        '123',
        'user1',
        'user2',
        50001,
        TransactionStatus.PENDING,
        null,
        new Date(),
        new Date(),
        null,
        null,
        null,
      );

      transaction.reject('Insufficient funds');

      expect(transaction.status).toBe(TransactionStatus.REJECTED);
      expect(transaction.rejectionReason).toBe('Insufficient funds');
      expect(transaction.rejectedAt).not.toBeNull();
    });

    it('should reject a pending transaction without reason', () => {
      const transaction = new Transaction(
        '123',
        'user1',
        'user2',
        50001,
        TransactionStatus.PENDING,
        null,
        new Date(),
        new Date(),
        null,
        null,
        null,
      );

      transaction.reject();

      expect(transaction.status).toBe(TransactionStatus.REJECTED);
      expect(transaction.rejectionReason).toBeNull();
      expect(transaction.rejectedAt).not.toBeNull();
    });

    it('should throw error when transaction is already completed', () => {
      const transaction = new Transaction(
        '123',
        'user1',
        'user2',
        50000,
        TransactionStatus.COMPLETED,
        null,
        new Date(),
        new Date(),
        null,
        null,
        new Date(),
      );

      expect(() => transaction.reject()).toThrow('Solo las transacciones pendientes pueden ser rechazadas');
    });

    it('should throw error when transaction is already rejected', () => {
      const transaction = new Transaction(
        '123',
        'user1',
        'user2',
        50001,
        TransactionStatus.REJECTED,
        null,
        new Date(),
        new Date(),
        null,
        new Date(),
        null,
      );

      expect(() => transaction.reject()).toThrow('Solo las transacciones pendientes pueden ser rechazadas');
    });

    it('should update updatedAt timestamp', () => {
      const transaction = new Transaction(
        '123',
        'user1',
        'user2',
        50001,
        TransactionStatus.PENDING,
        null,
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        null,
        null,
        null,
      );

      transaction.reject('Test reason');

      expect(transaction.updatedAt.getTime()).toBeGreaterThan(new Date('2024-01-01').getTime());
    });
  });
});
