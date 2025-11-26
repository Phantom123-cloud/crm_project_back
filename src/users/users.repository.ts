import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByUserId(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        password: true,
        isActive: true,
        isOnline: true,
        token: true,
        individualRules: {
          select: {
            id: true,
            type: true,
            role: {
              select: {
                name: true,
                id: true,
                descriptions: true,
                type: true,
              },
            },
          },
        },
        employee: {
          select: {
            id: true,
            citizenships: true,
            foreignLanguages: true,
            phones: true,
          },
        },
        roleTemplate: {
          select: {
            id: true,
            name: true,
            roles: {
              select: {
                id: true,
                name: true,
                descriptions: true,
              },
            },
          },
        },
      },
    });
  }
  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },

      select: {
        isOnline: true,
        token: true,
        password: true,
        isActive: true,
        id: true,
        email: true,
      },
    });
  }
  async updateUserAccount(id: string, email?: string, password?: string) {
    return this.prismaService.user.update({
      where: { id },

      data: {
        email,
        password,
      },
    });
  }
  async findUserWithEmployeeAndCitizenship(
    userId: string,
    citizenshipId: string,
  ) {
    return this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        token: true,
        employee: {
          where: {
            citizenships: {
              some: { id: citizenshipId },
            },
          },
          select: {
            id: true,
          },
        },
      },
    });
  }
  async blockUser(id: string) {
    return this.prismaService.user.update({
      where: { id },
      data: {
        isActive: false,
        isOnline: false,

        token: {
          update: {
            hash: null,
            exp: 0,
          },
        },
      },
    });
  }
  async unlockUser(id: string) {
    return this.prismaService.user.update({
      where: { id },
      data: {
        isActive: true,
      },
    });
  }

  async changeRoleTemplate(
    userId: string,
    roleTemplatesId: string,
    currentIndivIds: string[],
  ) {
    return this.prismaService.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: userId,
        },

        data: {
          roleTemplatesId,
        },
      });

      await tx.individualRules.deleteMany({
        where: {
          id: {
            in: currentIndivIds,
          },
        },
      });
    });

    return;
  }
}
