import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from '../dto/register.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(dto: RegisterDto) {
    const {
      email,
      password,
      arrayBlockedRoles,
      arrayAddRoles,
      roleTemplatesId,
    } = dto;

    const hashPassword = await argon2.hash(password);
    return this.prismaService.$transaction(async (tx) => {
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
  }
}
