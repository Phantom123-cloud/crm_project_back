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
        token: true,
        individualRules: {
          select: {
            id: true,
            type: true,
            role: true,
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
        roleTemplate: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email },

      select: {
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
}
