import type { DashboardGateway } from '@/application/ports/dashboard.gateway';
import type { DashboardKpis } from '@/domain/dashboard/dashboard';

export class GetDashboardKpisUseCase {
  constructor(private readonly gateway: DashboardGateway) {}

  execute(): Promise<DashboardKpis> {
    return this.gateway.getKpis();
  }
}
