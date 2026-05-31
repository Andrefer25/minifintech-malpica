import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Required for uuid_generate_v4() default
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'balance',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create transactions table
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'originUserId',
            type: 'uuid',
          },
          {
            name: 'destinationUserId',
            type: 'uuid',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: "'PENDING'",
          },
          {
            name: 'rejectionReason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'approvedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'rejectedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'completedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['originUserId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['destinationUserId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'RESTRICT',
      }),
    );

    // Create indexes
    await queryRunner.createIndex('transactions', new TableIndex({
      columnNames: ['status'],
    }));
    await queryRunner.createIndex('transactions', new TableIndex({
      columnNames: ['originUserId'],
    }));
    await queryRunner.createIndex('transactions', new TableIndex({
      columnNames: ['destinationUserId'],
    }));
    await queryRunner.createIndex('transactions', new TableIndex({
      columnNames: ['createdAt'],
    }));

    const usersResult = await queryRunner.query(`
      INSERT INTO users ("name", "email", "balance") VALUES
      ('André Malpica', 'andre.malpica@example.com', 145000.00),
      ('María García', 'maria.garcia@example.com', 98000.00),
      ('Juan Pérez', 'juan.perez@example.com', 120000.00),
      ('Ana López', 'ana.lopez@example.com', 65750.00),
      ('Carlos Ruiz', 'carlos.ruiz@example.com', 18300.00),
      ('Laura Martínez', 'lara.martinez@example.com', 87900.00),
      ('Pedro Sánchez', 'pedro.sanchez@example.com', 156000.00),
      ('Sofía Rodríguez', 'sofia.rodriguez@example.com', 12500.00),
      ('Miguel Fernández', 'miguel.fernandez@example.com', 54300.00),
      ('Lucía González', 'lucia.gonzalez@example.com', 41200.00)
      RETURNING id
    `);

    const userIds: string[] = usersResult.map((row: any) => row.id);

    // Seed transactions: [originIdx, destIdx, amount, status, rejectionReason]
    const transactionData: Array<[number, number, number, 'APPROVED' | 'PENDING' | 'REJECTED', string | null]> = [
      [0, 1, 15000.00, 'APPROVED', null],
      [0, 2, 7500.00, 'APPROVED', null],
      [0, 3, 85000.00, 'PENDING', null],
      [0, 4, 65000.00, 'REJECTED', 'Manual verification failed'],

      [1, 0, 12000.00, 'APPROVED', null],
      [1, 5, 45000.00, 'APPROVED', null],

      [2, 0, 60000.00, 'PENDING', null],
      [2, 3, 18000.00, 'APPROVED', null],

      [3, 4, 70000.00, 'REJECTED', 'Invalid recipient'],
      [3, 5, 9500.00, 'APPROVED', null],

      [4, 0, 4500.00, 'APPROVED', null],
      [4, 6, 70000.00, 'PENDING', null],

      [5, 1, 22000.00, 'APPROVED', null],
      [5, 7, 90000.00, 'REJECTED', 'Daily limit exceeded'],

      [6, 0, 35000.00, 'APPROVED', null],
      [6, 2, 95000.00, 'PENDING', null],

      [7, 0, 2500.00, 'APPROVED', null],

      [8, 0, 30000.00, 'APPROVED', null],
      [8, 1, 12500.00, 'APPROVED', null],

      [9, 0, 65000.00, 'PENDING', null],
      [9, 2, 11000.00, 'APPROVED', null],

      [0, 8, 5000.00, 'APPROVED', null],
      [1, 9, 55000.00, 'PENDING', null],

      [2, 4, 70000.00, 'REJECTED', 'Security check'],

      [4, 8, 6500.00, 'APPROVED', null],
    ];

    for (const [originIdx, destIdx, amount, status, rejectionReason] of transactionData) {
      const approvedAt = status === 'APPROVED' ? 'CURRENT_TIMESTAMP' : 'NULL';
      const rejectedAt = status === 'REJECTED' ? 'CURRENT_TIMESTAMP' : 'NULL';
      await queryRunner.query(
        `INSERT INTO transactions ("originUserId", "destinationUserId", "amount", "status", "rejectionReason", "approvedAt", "rejectedAt")
         VALUES ($1, $2, $3, $4, $5, ${approvedAt}, ${rejectedAt})`,
        [userIds[originIdx], userIds[destIdx], amount, status, rejectionReason],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Clean up seed data
    await queryRunner.query(`DELETE FROM transactions`);
    await queryRunner.query(`DELETE FROM users`);

    await queryRunner.dropTable('transactions');
    await queryRunner.dropTable('users');
  }
}

