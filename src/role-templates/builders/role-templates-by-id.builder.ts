import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { createRolesData } from 'src/roles/helpers/create-roles-data.helper';

@Injectable()
export class RoleTemplatesBuilder {
  constructor(private readonly prismaService: PrismaService) {}

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

    const roles = createRolesData({ types, rolesData });

    return buildResponse('Данные', { data: { roles } });
  }
}
