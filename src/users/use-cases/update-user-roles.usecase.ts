import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { UpdateUserRolesDto } from '../dto/update-user-roles.dto';
import { UsersRepository } from '../users.repository';

@Injectable()
export class UpdateUserRolesUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async updateUserRoles(userId: string, dto: UpdateUserRolesDto) {
    const user = await this.usersRepository.findByUserId(userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }

    const { unlock, removeIndividual, blockCurrent, addUnused } = dto;

    await this.prismaService.$transaction(async (tx) => {
      if (unlock?.length) {
        const isExistBlockRoles = await tx.individualRules.findMany({
          where: {
            roleId: {
              in: unlock,
            },
            userId,
            type: 'REMOVE',
          },
        });

        if (isExistBlockRoles.length !== unlock.length) {
          throw new ConflictException(
            'Преданный массив ролей не совпадает с данными из сервера',
          );
        }

        await tx.individualRules.deleteMany({
          where: {
            roleId: {
              in: unlock,
            },
            userId,
          },
        });
      }
      if (removeIndividual?.length) {
        const isExistCurrentIndivRoles = await tx.individualRules.findMany({
          where: {
            roleId: {
              in: removeIndividual,
            },
            userId,
            type: 'ADD',
          },
        });

        if (isExistCurrentIndivRoles.length !== removeIndividual.length) {
          throw new ConflictException(
            'Преданный массив ролей не совпадает с данными из сервера',
          );
        }
        await tx.individualRules.deleteMany({
          where: {
            roleId: {
              in: removeIndividual,
            },
            userId,
          },
        });
      }
      if (blockCurrent?.length) {
        const isExistCurrentTemplatesRoles = await tx.role.findMany({
          where: {
            id: {
              in: blockCurrent,
            },

            roleTemplates: {
              some: {
                id: user.roleTemplate?.id,
              },
            },
          },
        });

        if (isExistCurrentTemplatesRoles.length !== blockCurrent.length) {
          throw new ConflictException(
            'Преданный массив ролей не совпадает с данными из сервера',
          );
        }

        await tx.individualRules.createMany({
          data: blockCurrent.map((roleId) => ({
            roleId,
            userId,
            type: 'REMOVE',
            roleTemplatesId: user.roleTemplate?.id,
          })),
        });
      }
      if (addUnused?.length) {
        const isExistRoles = await tx.role.findMany({
          where: {
            id: {
              in: addUnused,
            },
          },
        });

        if (isExistRoles.length !== addUnused.length) {
          throw new ConflictException(
            'Преданный массив ролей не совпадает с данными из сервера',
          );
        }

        const userRoles = new Set([
          ...(user?.roleTemplate?.roles?.map((item) => item.id) ?? []),
          ...(user.individualRules?.map((item) => item.role.id) ?? []),
        ]);

        if (addUnused.some((role) => userRoles.has(role))) {
          throw new ConflictException(
            'Вы не можете добавлять в индивидуальные правила, роли которые уже там или в шаблоне присутствуют',
          );
        }

        await tx.individualRules.createMany({
          data: addUnused.map((roleId) => ({
            roleId,
            userId,
            type: 'ADD',
            roleTemplatesId: user.roleTemplate?.id,
          })),
        });
      }
      return;
    });

    return buildResponse('Правила доступа обновлены');
  }
}
