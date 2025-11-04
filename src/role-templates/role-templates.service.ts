import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { RoleTemplatesDto } from './dto/role-templates.dto';
import { UpdateRoleTemplateDto } from './dto/update-role-template.dto';
import { UsersService } from 'src/users/users.service';
import { RolesData } from './interfaces/roles-data.interface';
import { ensureAllExist, ensureNoDuplicates } from 'src/utils/is-exists.utils';

@Injectable()
export class RoleTemplatesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  // создать шаблог
  async createRoleTemplate(dto: RoleTemplatesDto) {
    const { array, name } = dto;

    const isExistTemplate = await this.prismaService.roleTemplates.findUnique({
      where: { name },
    });

    if (isExistTemplate) {
      throw new ConflictException('Такой шаблон уже существует');
    }

    const isExistsRoleAll = await this.prismaService.role.findMany({
      where: {
        id: { in: array },
      },
    });

    if (isExistsRoleAll.length !== array.length) {
      throw new NotFoundException('Некоторые указанные роли не найдены');
    }

    await this.prismaService.roleTemplates.create({
      data: {
        name,
        roles: {
          connect: array.map((id) => ({ id })),
        },
      },
    });
    return buildResponse('Новый шаблон создан');
  }
  // получение списка всех типов роли
  async allRoleTemplates() {
    const [templates, rolesData, types] = await this.prismaService.$transaction(
      [
        this.prismaService.roleTemplates.findMany({
          select: {
            name: true,
            id: true,
          },
        }),
        this.prismaService.role.findMany({
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
        this.prismaService.roleTypes.findMany({
          select: {
            name: true,
            descriptions: true,
            id: true,
          },

          orderBy: {
            name: 'asc',
          },
        }),
      ],
    );

    const roles = this.roleData({ types, rolesData });
    return buildResponse('Данные', { data: { templates, roles } });
  }

  async getSelectTeamplates() {
    const data = await this.prismaService.roleTemplates.findMany({
      select: {
        name: true,
        id: true,
      },
    });

    return buildResponse('Данные', { data });
  }

  async roleTemplatesById(id: string) {
    const [rolesData, types] = await this.prismaService.$transaction([
      this.prismaService.role.findMany({
        where: {
          roleTemplates: {
            some: {
              id,
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
      this.prismaService.roleTypes.findMany({
        where: {
          roles: {
            some: {
              roleTemplates: {
                some: { id },
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
    ]);

    const roles = this.roleData({ types, rolesData });

    return buildResponse('Данные', { data: { roles } });
  }

  async getRolesNotInTemplate(id: string) {
    const isExistTemplate = await this.prismaService.roleTemplates.findUnique({
      where: { id },
      select: {
        roles: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!isExistTemplate) {
      throw new NotFoundException('Шаблон не найден');
    }
    const transaction = await this.prismaService.$transaction(async (tx) => {
      const idsDelete = isExistTemplate.roles.map(({ id }) => id);

      const rolesData = await this.prismaService.role.findMany({
        where: {
          id: { notIn: idsDelete },
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
      const types = await this.prismaService.roleTypes.findMany({
        select: {
          name: true,
          descriptions: true,
          id: true,
        },

        orderBy: {
          name: 'asc',
        },
      });

      return { rolesData, types };
    });

    const { types, rolesData } = transaction;
    const roles = this.roleData({ types, rolesData });

    return buildResponse('Данные', { data: { roles } });
  }

  private roleData(props: RolesData) {
    const { types, rolesData } = props;
    const roles = types.reduce(
      (acc, val) => {
        acc.push({
          id: val.id,
          type: val.name,
          roles: [],
          descriptions: val.descriptions,
        });
        return acc;
      },
      [] as {
        id: string;
        type: string;
        roles: { name: string; descriptions: string; id: string }[];
        descriptions: string;
      }[],
    );

    for (const role of rolesData) {
      const index = roles.findIndex((t) => t.id === role.type.id);

      if (index < 0) {
        throw new BadRequestException('Что то пошло не так при сборе данных');
      }

      roles[index].roles.push({
        name: role.name,
        id: role.id,
        descriptions: role.descriptions,
      });
    }

    const filteredData = roles.filter((item) => item.roles.length);

    return filteredData
  }
  // удалить шабуло
  async deleteRoleTemplate(id: string) {
    const isExistTemplate = await this.prismaService.roleTemplates.findUnique({
      where: { id },

      select: {
        users: true,
      },
    });

    if (!isExistTemplate) {
      throw new ConflictException('Шаблон не найден');
    }

    if (isExistTemplate.users?.length) {
      throw new ConflictException(
        'Невозможно удалить: шаблон связан с другими данными',
      );
    }

    await this.prismaService.roleTemplates.delete({
      where: {
        id,
      },
    });

    return buildResponse('Шаблон удалён');
  }
  async updateRoleTemplate(id: string, dto: UpdateRoleTemplateDto) {
    const isExistTemplate = await this.prismaService.roleTemplates.findUnique({
      where: { id },
      select: { roles: { select: { id: true, name: true } } },
    });

    if (!isExistTemplate) {
      throw new ConflictException('Шаблон не найден');
    }

    const { arrayConnect, arrayDisconnect, name } = dto;

    if (name) {
      const isExistName = await this.prismaService.roleTemplates.findUnique({
        where: { name },
      });

      if (isExistName) {
        throw new ConflictException('Шаблон с таким именем уже существует');
      }
    }

    const roleIds = new Set(isExistTemplate.roles.map((r) => r.id));
    if (arrayConnect?.length) {
      ensureNoDuplicates(
        arrayConnect,
        roleIds,
        'Некоторые роли из переданного списка, уже добавлены в шаблон',
      );
    }

    if (arrayDisconnect?.length) {
      ensureAllExist(
        arrayDisconnect,
        roleIds,
        'Вы пытаетесь удалить роль, отсутствующую в шаблоне',
      );
    }

    await this.prismaService.roleTemplates.update({
      where: { id },
      data: {
        name,
        roles: {
          ...(arrayDisconnect?.length && {
            disconnect: arrayDisconnect.map((id) => ({ id })),
          }),
          ...(arrayConnect?.length && {
            connect: arrayConnect.map((id) => ({ id })),
          }),
        },

        ...(arrayDisconnect?.length && {
          individualRules: {
            deleteMany: { roleTemplatesId: id, type: 'REMOVE' },
          },
        }),
      },
    });

    return buildResponse('Роли обновлены');
  }

  // // назначить шаблон юзеру
  // async assignRoleTemplate(userId: string, roleTemplatesId: string) {
  //   if (!userId || !roleTemplatesId) {
  //     throw new BadRequestException('Все данные обязательны');
  //   }

  //   const user = await this.usersService.findUser(userId);

  //   if (!user) {
  //     throw new NotFoundException('Пользователь не найден');
  //   }

  //   if (user?.roleTemplate?.id === roleTemplatesId) {
  //     throw new ConflictException('Пользователь уже владеет данными ролями');
  //   }

  //   const isExistTemplate = this.prismaService.roleTemplates.findUnique({
  //     where: {
  //       id: roleTemplatesId,
  //     },
  //   });

  //   if (!isExistTemplate) {
  //     throw new NotFoundException('Пользователь не найден');
  //   }

  //   await this.prismaService.user.update({
  //     where: {
  //       id: userId,
  //     },
  //     data: {
  //       roleTemplatesId,
  //     },
  //   });

  //   return buildResponse('Шаблон добавлен');
  // }
  // // удалить шаблон у юзера
  // async revokeRoleTemplate(userId: string, roleTemplatesId: string) {
  //   if (!userId || !roleTemplatesId) {
  //     throw new BadRequestException('Все данные обязательны');
  //   }

  //   const user = await this.usersService.findUser(userId);

  //   if (!user) {
  //     throw new NotFoundException('Пользователь не найден');
  //   }

  //   if (user?.roleTemplate?.id !== roleTemplatesId) {
  //     throw new ConflictException('Пользователь не владеет данными ролями');
  //   }

  //   const isExistTemplate = this.prismaService.roleTemplates.findUnique({
  //     where: {
  //       id: roleTemplatesId,
  //     },
  //   });

  //   if (!isExistTemplate) {
  //     throw new NotFoundException('Пользователь не найден');
  //   }

  //   await this.prismaService.user.update({
  //     where: {
  //       id: userId,
  //     },
  //     data: {
  //       roleTemplatesId: null,
  //     },
  //   });

  //   return buildResponse('Шаблон откреплён');
  // }
}
