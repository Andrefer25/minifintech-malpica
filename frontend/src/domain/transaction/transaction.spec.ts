import { describe, expect, it } from 'vitest';
import { buildTimeline } from '@/ui/components/Timeline/timeline-builder';
import type { Transaction } from './transaction';

const base: Transaction = {
  id: '1',
  originUserId: 'a',
  destinationUserId: 'b',
  amount: 100,
  status: 'PENDING',
  createdAt: '2026-01-01T10:00:00Z',
};

describe('buildTimeline', () => {
  it('PENDING incluye CREATED y PENDING', () => {
    const t = buildTimeline(base);
    expect(t.map((e) => e.type)).toEqual(['CREATED', 'PENDING']);
  });

  it('APPROVED incluye CREATED, PENDING (si hay approvedAt distinto) y APPROVED', () => {
    const t = buildTimeline({
      ...base,
      status: 'APPROVED',
      approvedAt: '2026-01-01T10:05:00Z',
    });
    expect(t.map((e) => e.type)).toEqual(['CREATED', 'PENDING', 'APPROVED']);
  });

  it('COMPLETED incluye CREATED, PENDING (si hay completedAt distinto) y COMPLETED', () => {
    const t = buildTimeline({
      ...base,
      status: 'COMPLETED',
      completedAt: '2026-01-01T10:05:00Z',
    });
    expect(t.map((e) => e.type)).toEqual(['CREATED', 'PENDING', 'COMPLETED']);
  });

  it('REJECTED incluye motivo si existe', () => {
    const t = buildTimeline({
      ...base,
      status: 'REJECTED',
      rejectedAt: '2026-01-01T10:10:00Z',
      rejectionReason: 'datos inválidos',
    });
    const rejected = t.find((e) => e.type === 'REJECTED');
    expect(rejected?.reason).toBe('datos inválidos');
  });
});
