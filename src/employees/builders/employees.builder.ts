import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';

@Injectable()
export class EmployeeBuilder {
  constructor(private readonly prismaService: PrismaService) {}

  async allEmployeeTradings(isNotAll: boolean) {
    const data = await this.prismaService.employees.findMany({
      where: {
        ...(isNotAll && {
          tradingСode: {
            not: null,
          },
        }),

        user: {
          isActive: true,
        },
      },

      select: {
        fullName: true,
        userId: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    return buildResponse('Данные', {
      data,
    });
  }
}
