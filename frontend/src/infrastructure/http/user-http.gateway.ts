import type { UserGateway, UserPagedResult } from '@/application/ports/user.gateway';
import type { User } from '@/domain/user/user';
import type { HttpClient } from './http-client';

interface UserDto {
  id: string;
  name: string;
  email: string;
  balance: number | string;
  createdAt?: string;
}

function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    balance: typeof dto.balance === 'string' ? Number(dto.balance) : dto.balance,
    createdAt: dto.createdAt,
  };
}

export class UserHttpGateway implements UserGateway {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<User[]> {
    const res = await this.http.get<{ data: UserDto[]; pagination: unknown }>('/users', {
      query: { limit: 100 },
    });
    return res.data.map(toUser);
  }

  async listPaginated(page: number, limit: number): Promise<UserPagedResult> {
    const res = await this.http.get<{ data: UserDto[]; pagination: { page: number; limit: number; total: number } }>(
      '/users',
      { query: { page, limit } },
    );
    return {
      data: res.data.map(toUser),
      pagination: res.pagination,
    };
  }

  async getById(id: string): Promise<User> {
    const dto = await this.http.get<UserDto>(`/users/${id}`);
    return toUser(dto);
  }
}
