import type { DashboardGateway } from '@/application/ports/dashboard.gateway';
import type { DashboardKpis } from '@/domain/dashboard/dashboard';
import type { HttpClient } from './http-client';

export class DashboardHttpGateway implements DashboardGateway {
  constructor(private readonly http: HttpClient) {}

  getKpis(): Promise<DashboardKpis> {
    return this.http.get<DashboardKpis>('/dashboard');
  }
}
