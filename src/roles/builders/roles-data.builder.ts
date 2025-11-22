import {
  ConflictException,
  Global,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersRepository } from 'src/users/users.repository';
import { buildResponse } from 'src/utils/build-response';

@Injectable()
export class RolesDataBuilder {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersRepository: UsersRepository,
  ) {}

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
  // async getRolesIdsByUserId(userId: string) {
  //   const user = await this.usersRepository.findByUserId(userId);

  //   if (!user) {
  //     throw new NotFoundException('Пользователь не найден');
  //   }
  //   if (!user.employee || !user.token) {
  //     throw new ConflictException(
  //       'Аккаунт не владеет всеми необходимыми возможностями',
  //     );
  //   }

  //   const templateRoles = await this.prismaService.role.findMany({
  //     where: {
  //       roleTemplates: {
  //         some: {
  //           users: {
  //             some: {
  //               id: userId,
  //             },
  //           },
  //         },
  //       },

  //       NOT: {
  //         individualRules: {
  //           some: {
  //             userId,
  //             type: 'REMOVE',
  //           },
  //         },
  //       },
  //     },
  //     select: {
  //       id: true,
  //     },
  //   });

  //   const individualRoles = user.individualRules
  //     .filter((rule) => rule.type === 'ADD')
  //     .map((rule) => rule.role.id);

  //   const allRoles = [...templateRoles.map((r) => r.id), ...individualRoles];
  //   const data = [...new Set(allRoles)];
  //   return data;
  // }
  async getRolesNameByUserId(userId: string) {
    const user = await this.usersRepository.findByUserId(userId);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
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
        name: true,
      },
    });

    const individualRoles = user.individualRules
      .filter((rule) => rule.type === 'ADD')
      .map((rule) => rule.role.name);

    const allRoles = [...templateRoles.map((r) => r.name), ...individualRoles];
    const data = [...new Set(allRoles)];
    return data;
  }
}
