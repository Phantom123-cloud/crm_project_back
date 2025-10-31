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
      throw new ConflictException('Даное имя уже присвоенно');
    }

    const isExistsRoleAll = await this.prismaService.role.findMany({
      where: {
        id: { in: array },
      },
    });

    if (isExistsRoleAll.length !== array.length) {
      throw new NotFoundException(
        'Некоторые роли не обнаружены на сервере, проверьте правильность данных и попробуйте ещё раз',
      );
    }

    await this.prismaService.roleTemplates.create({
      data: {
        name,
        roles: {
          connect: array.map((id) => ({ id })),
        },
      },
    });
    return buildResponse('Шаблон создан');
  }
  // получение списка всех типов роли
  async allRoleTemplates() {
    const [templates, rolesData, types] = await this.prismaService.$transaction(
      [
        this.prismaService.roleTemplates.findMany({
          select: {
            name: true,
            id: true,
            roles: {
              select: {
                id: true,
                name: true,
                descriptions: true,
              },
            },
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

    const roles = this.roleData(types, rolesData);
    return buildResponse('Список шаблонов', { data: { templates, roles } });
  }
  async allRoleTemplatesById(id: string) {
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

    const roles = this.roleData(types, rolesData);

    return buildResponse('Список шаблонов', { data: { roles } });
  }

  private roleData(
    types: {
      name: string;
      id: string;
      descriptions: string;
    }[],
    rolesData: {
      name: string;
      id: string;
      descriptions: string;
      type: {
        name: string;
        id: string;
      };
    }[],
  ) {
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

    return roles;
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
      throw new ConflictException('Такого шаблона не существует');
    }

    if (isExistTemplate.users.length > 0) {
      throw new ConflictException('Данный шаблон используется пользователями');
    }

    await this.prismaService.roleTemplates.delete({
      where: {
        id,
      },
    });

    return buildResponse('Успешно удалено');
  }
  async updateRoleTemplate(id: string, dto: UpdateRoleTemplateDto) {
    const isExistTemplate = await this.prismaService.roleTemplates.findUnique({
      where: { id },
      select: { roles: { select: { id: true } } },
    });

    if (!isExistTemplate) {
      throw new ConflictException('Такого шаблона не существует');
    }

    const { arrayConnect, arrayDisconnect, name } = dto;

    if (arrayConnect?.length) {
      const alreadyExists = isExistTemplate.roles.some((r) =>
        arrayConnect.includes(r.id),
      );
      if (alreadyExists) {
        throw new BadRequestException(
          'Вы пытаетесь добавить уже существующую роль',
        );
      }
    }

    if (arrayDisconnect?.length) {
      const missingRole = arrayDisconnect.some(
        (id) => !isExistTemplate.roles.some((r) => r.id === id),
      );
      if (missingRole) {
        throw new BadRequestException(
          'Вы пытаетесь удалить роль, отсутствующую в шаблоне',
        );
      }
    }

    await this.prismaService.roleTemplates.update({
      where: { id },
      data: {
        name,
        roles: {
          ...(arrayDisconnect?.length
            ? { disconnect: arrayDisconnect.map((id) => ({ id })) }
            : {}),
          ...(arrayConnect?.length
            ? { connect: arrayConnect.map((id) => ({ id })) }
            : {}),
        },
      },
    });

    return buildResponse('Роли обновлены');
  }

  // назначить шаблон юзеру
  async assignRoleTemplate(userId: string, roleTemplatesId: string) {
    if (!userId || !roleTemplatesId) {
      throw new BadRequestException('Ошибка получения данных');
    }

    const user = await this.usersService.findUser(userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user?.roleTemplate?.id === roleTemplatesId) {
      throw new ConflictException('Пользователь уже владеет данными ролями');
    }

    const isExistTemplate = this.prismaService.roleTemplates.findUnique({
      where: {
        id: roleTemplatesId,
      },
    });

    if (!isExistTemplate) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        roleTemplatesId,
      },
    });

    return buildResponse('Шаблон добавлен');
  }
  // удалить шаблон у юзера
  async revokeRoleTemplate(userId: string, roleTemplatesId: string) {
    if (!userId || !roleTemplatesId) {
      throw new BadRequestException('Ошибка получения данных');
    }

    const user = await this.usersService.findUser(userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user?.roleTemplate?.id !== roleTemplatesId) {
      throw new ConflictException('Пользователь не владеет данными ролями');
    }

    const isExistTemplate = this.prismaService.roleTemplates.findUnique({
      where: {
        id: roleTemplatesId,
      },
    });

    if (!isExistTemplate) {
      throw new NotFoundException('Пользователь не найден');
    }

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        roleTemplatesId: null,
      },
    });

    return buildResponse('Шаблон откреплён');
  }
}
