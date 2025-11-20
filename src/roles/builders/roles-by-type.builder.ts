import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { createRolesData } from '../helpers/create-roles-data.helper';

@Injectable()
export class RolesByTypeBuilder {
  constructor(private readonly prismaService: PrismaService) {}

  async rolesData() {
    const [rolesData, types] = await this.prismaService.$transaction([
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
    ]);

    const roles = createRolesData({ types, rolesData });
    return buildResponse('Данные', { data: { roles } });
  }
}
