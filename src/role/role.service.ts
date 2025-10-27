import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { RoleDto } from './dto/role.dto';
import { IndividualRulesDto } from './dto/individual-rules.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RoleService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  // создание роли
  async createRole(dto: Required<RoleDto>, roleTypeId: string) {
    const isExist = await this.prismaService.role.findUnique({
      where: {
        name: dto.name,
      },
    });

    if (isExist) {
      throw new ConflictException('Данная роль уже существует');
    }

    const isExistType = await this.prismaService.roleTypes.findUnique({
      where: { id: roleTypeId },
    });

    if (!isExistType) {
      throw new NotFoundException('Такого типа роли не существует');
    }

    await this.prismaService.role.create({
      data: { ...dto, roleTypeId },
    });

    return buildResponse('Новая роль создана');
  }
  // удаление роли, если не используется
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
      throw new NotFoundException('Переданный тип роли не найден');
    }

    if (role.individualRules.length > 0 || role.roleTemplates.length > 0) {
      throw new ConflictException(
        'Удаление роли невозможно, она используется для других пользователей',
      );
    }
    await this.prismaService.role.delete({
      where: { id },
    });

    return buildResponse('Роль была удалена');
  }
  // редактирование имени роли
  async updateRole(id: string, dto: RoleDto) {
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
      throw new NotFoundException('Переданный тип роли не найден');
    }

    if (
      (role.individualRules.length > 0 || role.roleTemplates.length > 0) &&
      !dto.descriptions
    ) {
      throw new ConflictException(
        'Редактирование роли невозможно, она используется для других пользователей',
      );
    }

    await this.prismaService.role.update({
      where: { id },
      data: {
        name: dto.name || undefined,
        descriptions: dto.descriptions || undefined,
      },
    });

    return buildResponse('Имя роли было изменено');
  }
  // список ролей
  async allRoles(page: number, limit: number) {
    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;
    const [rolesData, total] = await this.prismaService.$transaction([
      this.prismaService.role.findMany({
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
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

    const roles = rolesData
      .reduce(
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
      )
      .sort((a, b) => {
        return String(a).localeCompare(String(b));
      });

    const countPages = Math.ceil(total / limit);

    return buildResponse('Список ролей', {
      data: { roles, total, countPages, page, limit },
    });
  }
  // добавить индивидуал права
  async createIndividualRules(dto: IndividualRulesDto, userId: string) {
    const { array, type } = dto;
    const user = await this.usersService.findUser(userId);

    if (!user) {
      throw new NotFoundException('Пользователь не обнаружен');
    }

    if (user.roleTemplate?.roles.length) {
      const findRoles = user.roleTemplate.roles.filter(({ id }) => {
        array.includes(id);
      });

      switch (type) {
        case 'ADD':
          if (findRoles.length !== 0) {
            throw new ConflictException(
              'В шаблоне уже присутствует роль которую вы пытаетесь присвоить как индивидуальную',
            );
          }
          break;
        case 'REMOVE':
          if (findRoles.length !== array.length) {
            throw new ConflictException(
              'Роль которую вы пытаетесь ограничить должна быть в шаблоне',
            );
          }
          break;

        default:
          break;
      }
    }

    if (user.individualRules.length) {
      const isExistCurrentIndovRules = user.individualRules.some(({ role }) => {
        array.includes(role.id);
      });

      if (isExistCurrentIndovRules) {
        throw new ConflictException(
          'Вы не можете переприсваивать права доступа в такой способ',
        );
      }
    }

    await this.prismaService.individualRules.createMany({
      data: array.map((roleId) => ({ roleId, type, userId })),
    });

    return buildResponse('Индивидуальные ролевые связи добавлены');
  }
  // ограничить права из шаблонных прав
  async deleteIndividualRule(id: string) {
    const isExistRule = await this.prismaService.individualRules.findUnique({
      where: { id },
    });

    if (!isExistRule) {
      throw new NotFoundException('Не найдено');
    }

    await this.prismaService.individualRules.delete({
      where: {
        id,
      },
    });

    return buildResponse('Успешно удалено');
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
                name: true,
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
      select: { name: true },
    });

    const individualRoles = user.individualRules
      .filter((rule) => rule.type === 'ADD')
      .map((rule) => rule.role.name);

    const allRoles = [...templateRoles.map((r) => r.name), ...individualRoles];
    const data = [...new Set(allRoles)];
    return data;
  }
}
