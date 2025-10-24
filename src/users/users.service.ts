import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import * as argon2 from 'argon2';
import type { Request, Response } from 'express';
import { JwtPayload } from 'src/token/interfaces/jwt-payload.interface';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateUserByIdDto } from './dto/update-user-by-id.dto';
import { TokenService } from 'src/token/token.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => TokenService))
    private readonly tokenService: TokenService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async findUser(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        password: true,
        isActive: true,

        token: {
          select: {
            id: true,
            isActive: true,
            hash: true,
          },
        },

        individualRules: {
          select: {
            type: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        roleTemplate: {
          select: {
            roles: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return user;
  }
}
