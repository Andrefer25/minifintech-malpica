import { UserRepository } from '../../domain/user/user.repository';
import { User } from '../../domain/user/user';
import { UserNotFoundError } from '../../domain/user/errors';

export interface GetUserParams {
  userId: string;
}

export class GetUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(params: GetUserParams): Promise<User> {
    const user = await this.userRepository.findById(params.userId);
    if (!user) throw new UserNotFoundError(params.userId);
    return user;
  }
}

export const GET_USER_USE_CASE = 'GetUserUseCase';
