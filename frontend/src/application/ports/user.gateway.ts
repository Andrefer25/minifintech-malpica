import type { User } from '@/domain/user/user';

export interface UserPagedResult {
  data: User[];
  pagination: { page: number; limit: number; total: number };
}

export interface UserGateway {
  list(): Promise<User[]>;
  listPaginated(page: number, limit: number): Promise<UserPagedResult>;
  getById(id: string): Promise<User>;
}
