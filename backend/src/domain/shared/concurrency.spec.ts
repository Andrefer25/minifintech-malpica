import { User } from '../user/user';
import { Transaction } from '../transaction/transaction';
import { TransactionStatus } from '../transaction/transaction-status.enum';

describe('Concurrency and Atomicity Tests', () => {
  describe('User balance atomicity', () => {
    it('should prevent negative balance with concurrent debits', async () => {
      const user = new User('user1', 'John', 'john@example.com', 1000, new Date(), new Date());
      
      const debitPromises = [
        Promise.resolve().then(() => user.debit(600)),
        Promise.resolve().then(() => user.debit(600)),
      ];

      await expect(Promise.all(debitPromises)).rejects.toThrow('Saldo insuficiente');
      
      // Balance should remain consistent
      expect(user.balance).toBeGreaterThanOrEqual(0);
    });

    it('should handle concurrent credits correctly', async () => {
      const user = new User('user1', 'John', 'john@example.com', 1000, new Date(), new Date());
      
      const creditPromises = [
        Promise.resolve().then(() => user.credit(500)),
        Promise.resolve().then(() => user.credit(300)),
        Promise.resolve().then(() => user.credit(200)),
      ];

      await Promise.all(creditPromises);
      
      expect(user.balance).toBe(2000);
    });
  });

  describe('Transaction state transitions', () => {
    it('should prevent state transitions from non-pending to approved', () => {
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

      expect(() => transaction.approve()).toThrow('Solo las transacciones pendientes pueden ser aprobadas');
    });

    it('should prevent state transitions from approved to rejected', () => {
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

      expect(() => transaction.reject()).toThrow('Solo las transacciones pendientes pueden ser rechazadas');
    });

    it('should prevent state transitions from rejected to approved', () => {
      const transaction = new Transaction(
        'tx1',
        'user1',
        'user2',
        60000,
        TransactionStatus.REJECTED,
        'Test',
        new Date(),
        new Date(),
        null,
        new Date(),
      );

      expect(() => transaction.approve()).toThrow('Solo las transacciones pendientes pueden ser aprobadas');
    });
  });

  describe('Business rule enforcement', () => {
    it('should enforce minimum amount validation', () => {
      expect(() => Transaction.create('user1', 'user2', 0)).toThrow('El monto debe ser mayor a cero');
      expect(() => Transaction.create('user1', 'user2', -100)).toThrow('El monto debe ser mayor a cero');
    });

    it('should enforce same user prevention', () => {
      expect(() => Transaction.create('user1', 'user1', 1000)).toThrow('El usuario origen y destino no pueden ser el mismo');
    });

    it('should enforce balance cannot go negative', () => {
      const user = new User('user1', 'John', 'john@example.com', 1000, new Date(), new Date());
      
      user.debit(1000);
      expect(user.balance).toBe(0);
      
      expect(() => user.debit(1)).toThrow('Saldo insuficiente');
      expect(user.balance).toBe(0); // Balance should remain 0
    });

    it('should enforce auto-approval threshold', () => {
      const autoApproved = Transaction.create('user1', 'user2', 50000);
      const pending = Transaction.create('user1', 'user2', 50001);

      expect(autoApproved.status).toBe(TransactionStatus.COMPLETED);
      expect(pending.status).toBe(TransactionStatus.PENDING);
    });
  });
});
