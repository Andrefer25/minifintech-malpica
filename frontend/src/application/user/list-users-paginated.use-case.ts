import type { UserGateway, UserPagedResult } from '@/application/ports/user.gateway';

export class ListUsersPaginatedUseCase {
  constructor(private readonly gateway: UserGateway) {}

  execute(page: number, limit: number): Promise<UserPagedResult> {
    return this.gateway.listPaginated(page, limit);
  }
}
