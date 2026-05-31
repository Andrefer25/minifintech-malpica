import { describe, expect, it, vi } from 'vitest';
import { CreateTransactionUseCase } from './create-transaction.use-case';
import type { TransactionGateway } from '@/application/ports/transaction.gateway';

function makeGateway(): TransactionGateway {
  return {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn().mockResolvedValue({ id: 'tx-1', status: 'COMPLETED', message: 'ok' }),
    approve: vi.fn(),
    reject: vi.fn(),
  };
}

describe('CreateTransactionUseCase', () => {
  it('rechaza si origen y destino son iguales', async () => {
    const gw = makeGateway();
    const uc = new CreateTransactionUseCase(gw);
    await expect(
      uc.execute({ originUserId: 'a', destinationUserId: 'a', amount: 100 }),
    ).rejects.toThrow(/distintos/i);
    expect(gw.create).not.toHaveBeenCalled();
  });

  it('rechaza monto cero o negativo', async () => {
    const gw = makeGateway();
    const uc = new CreateTransactionUseCase(gw);
    await expect(
      uc.execute({ originUserId: 'a', destinationUserId: 'b', amount: 0 }),
    ).rejects.toThrow(/mayor a 0/);
  });

  it('delega al gateway cuando los datos son válidos', async () => {
    const gw = makeGateway();
    const uc = new CreateTransactionUseCase(gw);
    const result = await uc.execute({
      originUserId: 'a',
      destinationUserId: 'b',
      amount: 100,
    });
    expect(gw.create).toHaveBeenCalledWith({
      originUserId: 'a',
      destinationUserId: 'b',
      amount: 100,
    });
    expect(result.status).toBe('COMPLETED');
  });
});
