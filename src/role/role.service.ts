import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { RoleDto } from './dto/role.dto';
import { IndividualRulesDto } from './dto/individual-rules.dto';
import { UsersService } from 'src/users/users.service';
import { RoleTemplatesDto } from './dto/role-templates.dto';

@Injectable()
export class RoleService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createRole(dto: RoleDto, roleTypeId: string) {
    const { name } = dto;

    const isExist = await this.prismaService.role.findUnique({
      where: {
        name,
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
      data: { name, roleTypeId },
    });

    return buildResponse('Новая роль создана');
  }
  async createRoleType(dto: RoleDto) {
    const { name } = dto;

    const isExist = await this.prismaService.roleTypes.findUnique({
      where: {
        name,
      },
    });

    if (isExist) {
      throw new ConflictException('Данная тип роли уже существует');
    }

    await this.prismaService.roleTypes.create({
      data: { name },
    });

    return buildResponse('Новый тип роли создан');
  }
  async allRoles() {
    const data = await this.prismaService.role.findMany();
    return buildResponse('Список ролей', { data });
  }
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
  async deleteRoleTemplate(id: string) {
    const isExistTemplate = await this.prismaService.roleTemplates.findUnique({
      where: { id },
    });

    if (!isExistTemplate) {
      throw new ConflictException('Такого шаблона не существует');
    }

    await this.prismaService.roleTemplates.delete({
      where: {
        id,
      },
    });

    return buildResponse('Успешно удалено');
  }
  async roleTemplatesAll() {
    const data = await this.prismaService.roleTemplates.findMany();
    return buildResponse('Список шаблонов', { data });
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

    return [...new Set(allRoles)];
  }
}
