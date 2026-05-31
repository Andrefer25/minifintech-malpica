import { UserRepository } from '../../domain/user/user.repository';
import { User } from '../../domain/user/user';

export interface GetUsersParams {
  page?: number;
  limit?: number;
}

export interface GetUsersResult {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export class GetUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(params?: GetUsersParams): Promise<GetUsersResult> {
    const page = Math.max(1, Math.floor(params?.page ?? 1));
    const limit = Math.min(100, Math.max(1, Math.floor(params?.limit ?? 10)));

    const { data, total } = await this.userRepository.findAllPaginated(page, limit);

    return {
      data,
      pagination: { page, limit, total },
    };
  }
}

export const GET_USERS_USE_CASE = 'GetUsersUseCase';
