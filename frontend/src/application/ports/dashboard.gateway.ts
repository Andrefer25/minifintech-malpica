import type { DashboardKpis } from '@/domain/dashboard/dashboard';

export interface DashboardGateway {
  getKpis(): Promise<DashboardKpis>;
}
