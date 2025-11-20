import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import { LoginDto } from '../dto/login.dto';
import { RolesByUserIdBuilder } from 'src/roles/builders/roles-by-user-id.builder';
import * as argon2 from 'argon2';
import { CreateSessionBuilder } from '../builders/create-session.builder';
import type { Response } from 'express';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesByUserIdBuilder: RolesByUserIdBuilder,
    private readonly createSessionBuilder: CreateSessionBuilder,
  ) {}

  async login(res: Response, dto: LoginDto) {
    const { email, password, remember } = dto;

    if (!email || !password) {
      throw new BadRequestException('Все данные обязательны');
    }

    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Не верный логин или пароль');
    }

    const userData = await this.rolesByUserIdBuilder.userRoleIds(user.id);

    if (!userData.length) {
      throw new ForbiddenException(
        'Данный аккаунт не обладает правами доступа. Обратитесь к администратору',
      );
    }

    const verifyPassword = await argon2.verify(user.password, password);

    if (!verifyPassword) {
      throw new UnauthorizedException('Не верный логин или пароль');
    }

    if (!user.isActive) {
      throw new ConflictException(
        'Ваш аккаунт заблокирован, обратитесь к администратору',
      );
    }
    const now = Math.floor(Date.now() / 1000);
    if (user.token?.hash && now < user.token?.exp) {
      throw new ConflictException(
        'Ваша сессия активна, что бы выполнить вход заново, выйдите из системы',
      );
    }

    const payload = {
      id: user.id,
      email: user.email,
    };
    return this.createSessionBuilder.tokenAuth(res, payload, remember);
  }
}
