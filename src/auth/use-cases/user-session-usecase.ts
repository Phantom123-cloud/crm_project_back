import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import { buildResponse } from 'src/utils/build-response';
import type { Response, Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { CreateSessionBuilder } from '../builders/create-session.builder';
import { JwtService } from '@nestjs/jwt';
import { RolesDataBuilder } from 'src/roles/builders/roles-data.builder';
import { AppGateway } from 'src/gateway/app.gateway';

@Injectable()
export class UserSessionUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly createSessionBuilder: CreateSessionBuilder,
    private readonly rolesDataBuilder: RolesDataBuilder,
    private readonly jwtService: JwtService,
    private appGateway: AppGateway,
  ) {}

  async validate(id: string): Promise<JwtPayload> {
    const user = await this.usersRepository.findByUserId(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }
    if (!user.isActive)
      throw new BadRequestException('Пользователь заблокирован');

    return {
      id: user.id,
      email: user.email,
    };
  }

  async me(req: Request, res: Response) {
    const user = req.user as JwtPayload;
    await this.createSessionBuilder.validateToken(req, res);
    const roles = await this.rolesDataBuilder.getRolesNameByUserId(user.id);

    return buildResponse('Данные', { data: { roles, meData: user } });
  }

  async logoutMe(res: Response, req: Request) {
    const token = req.cookies['token'];
    const payload: JwtPayload = await this.jwtService.verifyAsync(token);
    await this.createSessionBuilder.deactivateTokens(payload.id);
    this.createSessionBuilder.setTokenCookie(res, '', 0);
    await this.appGateway.usersSystemStatusObserver();

    return buildResponse('Выполнен выход из системы');
  }

  async logoutById(id: string, req: Request) {
    const user = req.user as JwtPayload;
    if (user.id === id) {
      throw new ConflictException('Вы не можете вылогинить сами себя');
    }
    await this.createSessionBuilder.deactivateTokens(id);
    await this.appGateway.usersSystemStatusObserver(id, 'logoutById');
    return buildResponse('Выполнен выход из системы');
  }
}
