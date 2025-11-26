import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { buildResponse } from 'src/utils/build-response';
import type { Request } from 'express';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { UsersRepository } from '../users.repository';
import { AppGateway } from 'src/gateway/app.gateway';

@Injectable()
export class IsActiveUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private appGateway: AppGateway,
  ) {}
  async isActiveUser(id: string, req: Request) {
    const { id: meId } = req.user as JwtPayload;
    if (meId === id) {
      throw new ConflictException('Вы не можете заблокировать сами себя');
    }
    const user = await this.usersRepository.findByUserId(id);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }

    user.isActive
      ? await this.usersRepository.blockUser(id)
      : await this.usersRepository.unlockUser(id);

    await this.appGateway.usersSystemStatusObserver(user.id, 'isActive');

    return buildResponse(
      `Пользователь - ${user.isActive ? 'заблокирован' : 'разблокирован'}`,
    );
  }
}
