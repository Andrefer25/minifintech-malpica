import { User } from './user';

export interface PaginatedUsers {
  data: User[];
  total: number;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  findAllPaginated(page: number, limit: number): Promise<PaginatedUsers>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  countAll(): Promise<number>;
  sumBalances(): Promise<number>;
}

export const USER_REPOSITORY = Symbol('UserRepository');

