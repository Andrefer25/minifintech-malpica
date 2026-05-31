import type { UserGateway } from '@/application/ports/user.gateway';
import type { User } from '@/domain/user/user';

export class ListUsersUseCase {
  constructor(private readonly gateway: UserGateway) {}

  execute(): Promise<User[]> {
    return this.gateway.list();
  }
}
