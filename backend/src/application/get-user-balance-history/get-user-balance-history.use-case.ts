import { UserBalanceHistory } from '../../domain/user/user-balance-history';
import { UserBalanceHistoryRepository } from '../../domain/user/user-balance-history.repository';
import { UserRepository } from '../../domain/user/user.repository';
import { UserNotFoundError } from '../../domain/user/errors';

export interface GetUserBalanceHistoryParams {
  userId: string;
}

export class GetUserBalanceHistoryUseCase {
  constructor(
    private readonly userBalanceHistoryRepository: UserBalanceHistoryRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(params: GetUserBalanceHistoryParams): Promise<UserBalanceHistory[]> {
    const user = await this.userRepository.findById(params.userId);
    if (!user) throw new UserNotFoundError(params.userId);

    return this.userBalanceHistoryRepository.findByUserId(params.userId);
  }
}

export const GET_USER_BALANCE_HISTORY_USE_CASE = 'GetUserBalanceHistoryUseCase';
