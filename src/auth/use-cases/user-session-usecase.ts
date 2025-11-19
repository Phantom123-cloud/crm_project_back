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
import { CreateSessionBuilder } from '../domain/create-session.builder';
import { RolesByUserIdBuilder } from 'src/roles/domain/roles-by-user-id.builder';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserSessionUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly createSessionBuilder: CreateSessionBuilder,
    private readonly rolesByUserIdBuilder: RolesByUserIdBuilder,
    private readonly jwtService: JwtService,
  ) {}

  async validate(id: string): Promise<JwtPayload> {
    const user = await this.usersRepository.findByUserId(id);
    if (!user) throw new NotFoundException('Пользователь не найден');
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
    const roles = await this.rolesByUserIdBuilder.userRoleIds(user.id);

    return buildResponse('Данные', { data: { roles, meData: user } });
  }

  async logoutMe(res: Response, req: Request) {
    const token = req.cookies['token'];
    const payload: JwtPayload = await this.jwtService.verifyAsync(token);
    await this.createSessionBuilder.deactivateTokens(payload.id);
    this.createSessionBuilder.setTokenCookie(res, '', 0);

    return buildResponse('Выполнен выход из системы');
  }

  async logoutById(id: string, req: Request) {
    const { id: meId } = req.user as JwtPayload;
    if (meId === id) {
      throw new ConflictException('Вы не можете вылогинить сами себя');
    }
    await this.createSessionBuilder.deactivateTokens(id);
    return buildResponse('Выполнен выход из системы');
  }
}
