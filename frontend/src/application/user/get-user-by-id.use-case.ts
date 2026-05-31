import type { UserGateway } from '@/application/ports/user.gateway';
import type { User } from '@/domain/user/user';

export class GetUserByIdUseCase {
  constructor(private readonly gateway: UserGateway) {}

  execute(id: string): Promise<User> {
    return this.gateway.getById(id);
  }
}
