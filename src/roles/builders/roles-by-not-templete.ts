import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { createRolesData } from '../helpers/create-roles-data.helper';

@Injectable()
export class RolesByNotTemplateBuilder {
  constructor(private readonly prismaService: PrismaService) {}

  async rolesData(id: string) {
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

      const rolesData = await tx.role.findMany({
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
      const types = await tx.roleTypes.findMany({
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
    const roles = createRolesData({ types, rolesData });

    return buildResponse('Данные', { data: { roles } });
  }
}
