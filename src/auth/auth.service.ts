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
import { buildResponse } from 'src/utils/build-response';
import { UsersService } from 'src/users/users.service';
import { JwtPayload } from 'src/token/interfaces/jwt-payload.interface';
import { ensureAllExist, ensureNoDuplicates } from 'src/utils/is-exists.utils';
import { RolesService } from 'src/roles/roles.service';
import { UpdateAccountCredentialsDto } from './dto/update-account-credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
  ) {}

  async register(dto: RegisterDto) {
    const {
      email,
      password,
      arrayBlockedRoles,
      arrayAddRoles,
      roleTemplatesId,
    } = dto;

    const isUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (isUser) {
      throw new ConflictException('Эта почта уже используется');
    }

    const template = await this.prismaService.roleTemplates.findUnique({
      where: { id: roleTemplatesId },
      select: {
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Шаблон не найден');
    }

    const templateRoleIds = new Set(template.roles.map((r) => r.id));

    if (arrayBlockedRoles?.length) {
      ensureAllExist(
        arrayBlockedRoles,
        templateRoleIds,
        'Не все роли для блокировки переданные вами соответствуют текущим ролям шаблона',
      );
    }
    if (arrayAddRoles?.length) {
      const existingRoles = await this.prismaService.role.findMany({
        where: {
          id: {
            in: arrayAddRoles,
          },
        },
      });

      if (!existingRoles.length) {
        throw new NotFoundException('Некоторые указанные роли не найдены');
      }

      ensureNoDuplicates(
        arrayAddRoles,
        templateRoleIds,
        'Некоторые роли переданные вами для добавления дополнительных прав, уже присутствуют в текущем шаблоне',
      );
    }

    const hashPassword = await argon2.hash(password);
    await this.prismaService.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashPassword,
          roleTemplatesId,
          token: {
            create: {},
          },

          employee: {
            create: {},
          },
        },
      });

      if (arrayBlockedRoles?.length && roleTemplatesId) {
        await tx.individualRules.createMany({
          data: arrayBlockedRoles.map((roleId) => ({
            roleId,
            userId: user.id,
            type: 'REMOVE',
            roleTemplatesId,
          })),
        });
      }

      if (arrayAddRoles?.length) {
        await tx.individualRules.createMany({
          data: arrayAddRoles.map((roleId) => ({
            roleId,
            userId: user.id,
            type: 'ADD',
          })),
        });
      }

      return user;
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
        token: true,
        password: true,
        isActive: true,
        id: true,
        email: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Не верный логин или пароль');
    }

    const userData = await this.rolesService.getRolesByUserId(user.id);

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
    return this.tokenService.auth(res, payload, remember);
  }
  async updateAccountCredentials(
    dto: Partial<UpdateAccountCredentialsDto>,
    userId: string,
  ) {
    const user = await this.userService.findUser(userId);
    if (!user) throw new NotFoundException('Пользователь не найден');
    const { oldPassword, newPassword, email } = dto;
    if ((oldPassword && !newPassword) || (!oldPassword && newPassword)) {
      throw new BadRequestException(
        'Некорректно переданные данные для смены пароля',
      );
    }

    let hashNewPassword: string | undefined = undefined;
    if (oldPassword && newPassword) {
      const isMatch = await argon2.verify(user.password, oldPassword);

      if (!isMatch) {
        throw new ConflictException('Не верный пароль');
      }

      hashNewPassword = await argon2.hash(newPassword);
    }

    await this.prismaService.user.update({
      where: { id: userId },

      data: {
        email,
        password: hashNewPassword,
      },
    });

    return buildResponse('Данные обновлены');
  }
  async validate(id: string): Promise<JwtPayload> {
    const user = await this.userService.findUser(id);
    if (!user) throw new NotFoundException('Пользователь не найден');
    if (!user.isActive)
      throw new BadRequestException('Пользователь заблокирован');
    return {
      id: user.id,
      email: user.email,
    };
  }
}
