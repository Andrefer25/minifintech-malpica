import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddBalanceAndStatusHistory1780195744321 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add COMPLETED to the existing enum type
    await queryRunner.query(`
      ALTER TYPE "transactions_status_enum" ADD VALUE IF NOT EXISTS 'COMPLETED'
    `);

    // Create user_balance_history table
    await queryRunner.createTable(
      new Table({
        name: 'user_balance_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'transactionId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'balanceBefore',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'balanceAfter',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['DEBIT', 'CREDIT'],
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create transaction_status_history table
    await queryRunner.createTable(
      new Table({
        name: 'transaction_status_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'transactionId',
            type: 'uuid',
          },
          {
            name: 'previousStatus',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'newStatus',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'changedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'changedBy',
            type: 'varchar',
            length: '100',
            default: "'system'",
          },
        ],
      }),
      true,
    );

    // Create foreign keys for user_balance_history
    await queryRunner.createForeignKey(
      'user_balance_history',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'user_balance_history',
      new TableForeignKey({
        columnNames: ['transactionId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'transactions',
        onDelete: 'SET NULL',
      }),
    );

    // Create foreign key for transaction_status_history
    await queryRunner.createForeignKey(
      'transaction_status_history',
      new TableForeignKey({
        columnNames: ['transactionId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'transactions',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for user_balance_history
    await queryRunner.createIndex('user_balance_history', new TableIndex({
      columnNames: ['userId'],
    }));
    await queryRunner.createIndex('user_balance_history', new TableIndex({
      columnNames: ['transactionId'],
    }));
    await queryRunner.createIndex('user_balance_history', new TableIndex({
      columnNames: ['createdAt'],
    }));

    // Create indexes for transaction_status_history
    await queryRunner.createIndex('transaction_status_history', new TableIndex({
      columnNames: ['transactionId'],
    }));
    await queryRunner.createIndex('transaction_status_history', new TableIndex({
      columnNames: ['changedAt'],
    }));

    // Seed transaction_status_history
    const transactions = await queryRunner.query(`
      SELECT id, status, "createdAt", "approvedAt", "rejectedAt"
      FROM transactions
    `);

    for (const tx of transactions) {
      // Initial PENDING state
      await queryRunner.query(`
        INSERT INTO transaction_status_history ("transactionId", "previousStatus", "newStatus", "changedAt", "changedBy")
        VALUES ($1, NULL, 'PENDING', $2, 'system')
      `, [tx.id, tx.createdAt]);

      if (tx.status === 'APPROVED') {
        // APPROVED state
        await queryRunner.query(`
          INSERT INTO transaction_status_history ("transactionId", "previousStatus", "newStatus", "changedAt", "changedBy")
          VALUES ($1, 'PENDING', 'APPROVED', $2, 'system')
        `, [tx.id, tx.approvedAt]);

        // COMPLETED state (1 second after APPROVED)
        const completedAt = new Date(new Date(tx.approvedAt).getTime() + 1000);
        await queryRunner.query(`
          INSERT INTO transaction_status_history ("transactionId", "previousStatus", "newStatus", "changedAt", "changedBy")
          VALUES ($1, 'APPROVED', 'COMPLETED', $2, 'system')
        `, [tx.id, completedAt]);
      } else if (tx.status === 'REJECTED') {
        // REJECTED state
        await queryRunner.query(`
          INSERT INTO transaction_status_history ("transactionId", "previousStatus", "newStatus", "changedAt", "changedBy")
          VALUES ($1, 'PENDING', 'REJECTED', $2, 'system')
        `, [tx.id, tx.rejectedAt]);
      }
      // PENDING transactions only have the initial state
    }

    // Seed user_balance_history (max 3 records per user)
    const users = await queryRunner.query(`
      SELECT id, balance
      FROM users
    `);

    for (const user of users) {
      // Get approved transactions for this user (origin or destination), ordered by most recent
      const userTransactions = await queryRunner.query(`
        SELECT id, "originUserId", "destinationUserId", amount, "createdAt"
        FROM transactions
        WHERE status = 'APPROVED'
          AND ("originUserId" = $1 OR "destinationUserId" = $1)
        ORDER BY "createdAt" DESC
        LIMIT 3
      `, [user.id]);

      if (userTransactions.length === 0) continue;

      // Calculate balances in reverse (from current balance backwards)
      let currentBalance = Number(user.balance);
      const historyRecords = [];

      for (const tx of userTransactions.reverse()) {
        const amount = Number(tx.amount);
        let balanceBefore, balanceAfter, type;

        if (tx.originUserId === user.id) {
          // User was origin: DEBIT
          balanceAfter = currentBalance;
          balanceBefore = currentBalance + amount;
          type = 'DEBIT';
        } else {
          // User was destination: CREDIT
          balanceAfter = currentBalance;
          balanceBefore = currentBalance - amount;
          type = 'CREDIT';
        }

        historyRecords.push({
          userId: user.id,
          transactionId: tx.id,
          balanceBefore,
          balanceAfter,
          type,
          createdAt: tx.createdAt,
        });

        // Update current balance for next iteration (going backwards in time)
        currentBalance = balanceBefore;
      }

      // Insert records in chronological order (reverse of the reverse)
      for (const record of historyRecords.reverse()) {
        await queryRunner.query(`
          INSERT INTO user_balance_history ("userId", "transactionId", "balanceBefore", "balanceAfter", "type", "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [record.userId, record.transactionId, record.balanceBefore, record.balanceAfter, record.type, record.createdAt]);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Clean up seed data
    await queryRunner.query(`DELETE FROM user_balance_history`);
    await queryRunner.query(`DELETE FROM transaction_status_history`);

    // Drop indexes
    await queryRunner.dropIndex('transaction_status_history', 'IDX_transaction_status_history_transactionId');
    await queryRunner.dropIndex('transaction_status_history', 'IDX_transaction_status_history_changedAt');
    await queryRunner.dropIndex('user_balance_history', 'IDX_user_balance_history_userId');
    await queryRunner.dropIndex('user_balance_history', 'IDX_user_balance_history_transactionId');
    await queryRunner.dropIndex('user_balance_history', 'IDX_user_balance_history_createdAt');

    // Drop foreign keys
    const statusHistoryTable = await queryRunner.getTable('transaction_status_history');
    const statusFk = statusHistoryTable?.foreignKeys.find(fk => fk.columnNames.includes('transactionId'));
    if (statusFk) {
      await queryRunner.dropForeignKey('transaction_status_history', statusFk);
    }

    const balanceHistoryTable = await queryRunner.getTable('user_balance_history');
    const balanceUserFk = balanceHistoryTable?.foreignKeys.find(fk => fk.columnNames.includes('userId'));
    const balanceTxFk = balanceHistoryTable?.foreignKeys.find(fk => fk.columnNames.includes('transactionId'));
    if (balanceUserFk) {
      await queryRunner.dropForeignKey('user_balance_history', balanceUserFk);
    }
    if (balanceTxFk) {
      await queryRunner.dropForeignKey('user_balance_history', balanceTxFk);
    }

    // Drop tables
    await queryRunner.dropTable('transaction_status_history');
    await queryRunner.dropTable('user_balance_history');

  }
}
