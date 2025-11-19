import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async existingRoles(roleIdsList: string[]) {
    return this.prismaService.role.findMany({
      where: {
        id: {
          in: roleIdsList,
        },
      },
    });
  }

  async effectiveRoles(userId: string) {
    return this.prismaService.role.findMany({
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
  }
}
