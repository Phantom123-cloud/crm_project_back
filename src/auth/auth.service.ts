import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { Response } from 'express';
import * as argon2 from 'argon2';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenService } from 'src/token/token.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { buildResponse } from 'src/utils/build-response';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from 'src/token/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

  async register(dto: RegisterDto, roleTemplatesId: string) {
    const { email, password, full_name } = dto;

    if (!email || !password || !full_name) {
      throw new BadRequestException('Все данные обязательны');
    }

    const isUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (isUser) {
      throw new ConflictException('Эта почта уже используется');
    }

    const hashPassword = await argon2.hash(password);
    await this.prismaService.user.create({
      data: {
        email,
        full_name,
        password: hashPassword,
        roleTemplatesId,
        token: {
          create: {},
        },
      },
    });

    return buildResponse('Новый пользователь добавлен');
  }
  async login(res: Response, dto: LoginDto) {
    const { email, password, remember } = dto;

    if (!email || !password) {
      throw new BadRequestException('Все данные обязательны');
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },

      select: {
        id: true,
        password: true,
        isActive: true,
        email: true,
        full_name: true,
        token: true,

        roleTemplate: {
          select: {
            roles: true,
          },
        },
        individualRules: {
          select: {
            type: true,
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Не верный логин или пароль');
    }

    if (
      !user.roleTemplate?.roles.length ||
      !user.individualRules.some((r) => r.type === 'ADD')
    ) {
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
      full_name: user.full_name,
    };
    return this.tokenService.auth(res, payload, remember);
  }
  async validate(id: string): Promise<JwtPayload> {
    const user = await this.userService.findUser(id);
    if (!user) throw new NotFoundException('Пользователь не найден');
    if (!user.isActive)
      throw new BadRequestException('Пользователь заблокирован');
    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
    };
  }
}
