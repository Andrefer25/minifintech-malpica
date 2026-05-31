import { User } from './user';

describe('User Entity', () => {
  describe('credit', () => {
    it('should credit money to user balance', () => {
      const user = new User(
        '123',
        'John Doe',
        'john@example.com',
        1000,
        new Date(),
        new Date(),
      );

      user.credit(500);

      expect(user.balance).toBe(1500);
    });

    it('should throw error when amount is zero', () => {
      const user = new User(
        '123',
        'John Doe',
        'john@example.com',
        1000,
        new Date(),
        new Date(),
      );

      expect(() => user.credit(0)).toThrow('El monto debe ser mayor a cero');
    });

    it('should throw error when amount is negative', () => {
      const user = new User(
        '123',
        'John Doe',
        'john@example.com',
        1000,
        new Date(),
        new Date(),
      );

      expect(() => user.credit(-100)).toThrow('El monto debe ser mayor a cero');
    });

    it('should update updatedAt timestamp', () => {
      const user = new User(
        '123',
        'John Doe',
        'john@example.com',
        1000,
        new Date('2024-01-01'),
        new Date('2024-01-01'),
      );

      user.credit(500);

      expect(user.updatedAt.getTime()).toBeGreaterThan(new Date('2024-01-01').getTime());
    });
  });

  describe('debit', () => {
    it('should debit money from user balance', () => {
      const user = new User(
        '123',
        'John Doe',
        'john@example.com',
        1000,
        new Date(),
        new Date(),
      );

      user.debit(500);

      expect(user.balance).toBe(500);
    });

    it('should throw error when amount is zero', () => {
      const user = new User(
        '123',
        'John Doe',
        'john@example.com',
        1000,
        new Date(),
        new Date(),
      );

      expect(() => user.debit(0)).toThrow('El monto debe ser mayor a cero');
    });

    it('should throw error when amount is negative', () => {
      const user = new User(
        '123',
        'John Doe',
        'john@example.com',
        1000,
        new Date(),
        new Date(),
      );

      expect(() => user.debit(-100)).toThrow('El monto debe ser mayor a cero');
    });

    it('should throw error when balance is insufficient', () => {
      const user = new User(
        '123',
        'John Doe',
        'john@example.com',
        1000,
        new Date(),
        new Date(),
      );

      expect(() => user.debit(1500)).toThrow('Saldo insuficiente');
    });

    it('should not allow negative balance', () => {
      const user = new User(
        '123',
        'John Doe',
        'john@example.com',
        1000,
        new Date(),
        new Date(),
      );

      user.debit(1000);

      expect(user.balance).toBe(0);
      expect(() => user.debit(1)).toThrow('Saldo insuficiente');
    });

    it('should update updatedAt timestamp', () => {
      const user = new User(
        '123',
        'John Doe',
        'john@example.com',
        1000,
        new Date('2024-01-01'),
        new Date('2024-01-01'),
      );

      user.debit(500);

      expect(user.updatedAt.getTime()).toBeGreaterThan(new Date('2024-01-01').getTime());
    });
  });

  describe('create', () => {
    it('should create a new user with initial balance', () => {
      const user = User.create('John Doe', 'john@example.com', 1000);

      expect(user.id).toBeDefined();
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.balance).toBe(1000);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a new user with zero balance by default', () => {
      const user = User.create('John Doe', 'john@example.com');

      expect(user.balance).toBe(0);
    });

    it('should generate unique IDs for different users', () => {
      const user1 = User.create('John Doe', 'john@example.com');
      const user2 = User.create('Jane Doe', 'jane@example.com');

      expect(user1.id).not.toBe(user2.id);
    });
  });
});
