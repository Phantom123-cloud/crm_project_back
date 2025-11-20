import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { Roles } from '../interfaces';
import { createRolesData } from '../helpers/create-roles-data.helper';
import { UsersRepository } from 'src/users/users.repository';

@Injectable()
export class FullInformationOnRolesBuilder {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async fullInformationOnRoles(userId: string) {
    const user = await this.usersRepository.findByUserId(userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }

    const [types, rolesData] = await this.prismaService.$transaction([
      this.prismaService.roleTypes.findMany({
        where: {
          roles: {
            some: {
              roleTemplates: {
                some: { id: user.roleTemplate?.id },
              },
            },
          },
        },
        select: {
          name: true,
          descriptions: true,
          id: true,
        },

        orderBy: {
          name: 'asc',
        },
      }),
      this.prismaService.role.findMany({
        where: {
          roleTemplates: {
            some: {
              users: {
                some: {
                  id: userId,
                },
              },
            },
          },

          NOT: {
            individualRules: {
              some: {
                userId,
                type: 'REMOVE',
              },
            },
          },
        },
        select: {
          name: true,
          id: true,
          descriptions: true,
          type: {
            select: {
              id: true,
              name: true,
            },
          },
        },

        orderBy: {
          type: {
            name: 'asc',
          },
        },
      }),
    ]);

    const { indivRolesAdd, indivRolesRemove } = user.individualRules.reduce(
      (acc, val) => {
        if (val.type === 'REMOVE') {
          acc.indivRolesRemove.push(val.role);
        } else {
          acc.indivRolesAdd.push(val.role);
        }
        return acc;
      },
      { indivRolesAdd: [], indivRolesRemove: [] } as {
        indivRolesAdd: Array<Roles>;
        indivRolesRemove: Array<Roles>;
      },
    );

    const templateAvailableRoles = createRolesData({
      types,
      rolesData,
    });

    const blockedTemplateRoles = createRolesData({
      types,
      rolesData: indivRolesRemove,
    });

    const indivRolesAddTypes = await this.prismaService.roleTypes.findMany({
      where: {
        roles: {
          some: {
            id: {
              in: indivRolesAdd.map((role) => role.id),
            },
          },
        },
      },
    });

    const individualAvailableRoles = createRolesData({
      types: indivRolesAddTypes,
      rolesData: indivRolesAdd,
    });

    const notIn = new Set([
      ...rolesData.map((item) => item.id),
      ...indivRolesAdd.map((item) => item.id),
      ...indivRolesRemove.map((item) => item.id),
    ]);

    const unusedRolesData = await this.prismaService.role.findMany({
      where: {
        id: { notIn: [...notIn] },
      },
      select: {
        name: true,
        id: true,
        descriptions: true,
        type: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: {
        type: {
          name: 'asc',
        },
      },
    });

    const unusedIds = unusedRolesData.map((u) => u.id);
    const typesForUnusedRoles = await this.prismaService.roleTypes.findMany({
      where: {
        roles: {
          some: {
            id: {
              in: unusedIds,
            },
          },
        },
      },
      select: {
        name: true,
        descriptions: true,
        id: true,
      },

      orderBy: {
        name: 'asc',
      },
    });

    const unusedRoles = createRolesData({
      types: typesForUnusedRoles,
      rolesData: unusedRolesData,
    });

    return buildResponse('Данные', {
      data: {
        templateAvailableRoles,
        blockedTemplateRoles,
        individualAvailableRoles,
        unusedRoles,
        roleTemplate: user.roleTemplate?.name,
      },
    });
  }
}
