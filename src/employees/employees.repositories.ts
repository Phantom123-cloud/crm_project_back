import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateEmployeeFormDto } from './dto/update-employee-form.dto';
import { UpdateEmployeePassportDto } from './dto/update-employee-passport.dto';
import { buildUpdateData } from './helpers/build-update-data.helper';

@Injectable()
export class EmployeesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByTradingCode(tradingСode: string) {
    return this.prismaService.employees.findUnique({
      where: {
        tradingСode,
      },
    });
  }
  async updateEmployeeForm(
    dto: Partial<UpdateEmployeeFormDto>,
    userId: string,
  ) {
    return this.prismaService.employees.update({
      where: {
        userId,
      },

      data: {
        ...buildUpdateData(dto),
      },
    });
  }
  async updateEmployeePassport(
    dto: Partial<UpdateEmployeePassportDto>,
    userId: string,
  ) {
    const {
      citizenships,
      fullName,
      birthDate,
      registrationAddress,
      actualAddress,
    } = dto;

    return this.prismaService.employees.update({
      where: {
        userId,
      },

      data: {
        fullName,
        birthDate,
        citizenships: {
          connect: citizenships?.map((id) => ({ id })),
        },
        registrationAddress,
        actualAddress,
      },
    });
  }

  async updateEmployeeCitizenship(citizenshipId: string, userId: string) {
    return this.prismaService.employees.update({
      where: {
        userId,
      },

      data: {
        citizenships: {
          disconnect: {
            id: citizenshipId,
          },
        },
      },
    });
  }
}
