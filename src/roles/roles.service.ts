import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleTemplatesService } from 'src/role-templates/role-templates.service';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { Roles } from './interfaces';
import { ensureAllExist, ensureNoDuplicates } from 'src/utils/is-exists.utils';

@Injectable()
export class RolesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly roleTemplatesService: RoleTemplatesService,
  ) {}

  async createRole(dto: CreateRoleDto, roleTypeId: string) {
    const isExist = await this.prismaService.role.findUnique({
      where: {
        name: dto.name,
      },
    });

    if (isExist) {
      throw new ConflictException('Такая роль уже существует');
    }

    const isExistType = await this.prismaService.roleTypes.findUnique({
      where: { id: roleTypeId },
    });

    if (!isExistType) {
      throw new NotFoundException('Роль не найдена');
    }

    await this.prismaService.role.create({
      data: { ...dto, roleTypeId },
    });

    return buildResponse('Новая роль создана');
  }
  async deleteRole(id: string) {
    const role = await this.prismaService.role.findUnique({
      where: {
        id,
      },

      select: {
        roleTemplates: true,
        individualRules: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Роль не найдена');
    }

    if (role.individualRules?.length || role.roleTemplates?.length) {
      throw new ConflictException(
        'Невозможно удалить: роль связан с другими данными',
      );
    }
    await this.prismaService.role.delete({
      where: { id },
    });

    return buildResponse('Роль удалена');
  }
  async updateRole(id: string, dto: UpdateRoleDto) {
    const { roleTypeId, name, descriptions } = dto;
    const role = await this.prismaService.role.findUnique({
      where: {
        id,
      },

      select: {
        roleTemplates: true,
        individualRules: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Роль не найдена');
    }

    if (
      (role.individualRules?.length || role.roleTemplates?.length) &&
      (name || roleTypeId)
    ) {
      throw new ConflictException(
        descriptions
          ? 'Вы можете отредактировать только описание '
          : 'Невозможно редактировать: роль связана с другими данными',
      );
    }

    if (name) {
      const isExistName = await this.prismaService.role.findUnique({
        where: {
          name,
        },
      });

      if (isExistName) {
        throw new ConflictException('Роль с таким именем уже существует');
      }
    }

    await this.prismaService.role.update({
      where: { id },
      data: {
        roleTypeId,
        name,
        descriptions,
      },
    });

    return buildResponse('Роль изменена');
  }
  async allRoles(page: number, limit: number) {
    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;
    const [rolesData, total] = await this.prismaService.$transaction([
      this.prismaService.role.findMany({
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        orderBy: {
          type: {
            name: 'asc',
          },
        },
        select: {
          id: true,
          name: true,
          descriptions: true,
          type: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      }),
      this.prismaService.role.count(),
    ]);

    const roles = rolesData.reduce(
      (acc, val) => {
        const { id, name, descriptions, type } = val;

        acc.push({
          id,
          name,
          descriptions,
          typeName: type.name,
          typeId: type.id,
        });

        return acc;
      },
      [] as {
        id: string;
        name: string;
        descriptions: string;
        typeName: string;
        typeId: string;
      }[],
    );

    const countPages = Math.ceil(total / limit);

    return buildResponse('Данные', {
      data: { roles, total, countPages, page, limit },
    });
  }
  async getRolesByUserId(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        individualRules: {
          select: {
            type: true,
            role: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не обнаружен');
    }

    const templateRoles = await this.prismaService.role.findMany({
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
        id: true,
      },
    });

    const individualRoles = user.individualRules
      .filter((rule) => rule.type === 'ADD')
      .map((rule) => rule.role.id);

    const allRoles = [...templateRoles.map((r) => r.id), ...individualRoles];
    const data = [...new Set(allRoles)];
    return data;
  }
  async fullInformationOnRoles(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        roleTemplate: true,
        individualRules: {
          select: {
            type: true,
            role: {
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
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не обнаружен');
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

    const templateAvailableRoles = this.roleTemplatesService.roleData({
      types,
      rolesData,
    });

    const blockedTemplateRoles = this.roleTemplatesService.roleData({
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

    const individualAvailableRoles = this.roleTemplatesService.roleData({
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

    const unusedRoles = this.roleTemplatesService.roleData({
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

  async updateUserRoles(userId: string, dto: UpdateUserRolesDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        roleTemplate: {
          select: {
            id: true,
            roles: true,
          },
        },

        individualRules: {
          select: {
            role: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не обнаружен');
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
          })),
        });
      }

      return;
    });

    return buildResponse('Правила доступа обновлены');
  }
}
