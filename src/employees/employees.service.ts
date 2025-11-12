import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadsService } from 'src/uploads/uploads.service';
import { buildResponse } from 'src/utils/build-response';
import { validateImportedField } from './utils/validateImportedField';
import { buildUpdateData } from './utils/buildUpdateData';
import { FilesService } from 'src/files/files.service';
import { UpdateEmployeeFormDto } from './dto/update-employee-form.dto';
import { UpdateEmployeePassportDto } from './dto/update-employee-passport.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly filesService: FilesService,
    private readonly uploadsService: UploadsService,
  ) {}

  async updateEmployeeForm(
    dto: Partial<UpdateEmployeeFormDto>,
    userId: string,
  ) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        token: true,
        employee: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }

    if (dto?.tradingСode) {
      const checkUnique = await this.prismaService.employees.findUnique({
        where: {
          tradingСode: dto.tradingСode,
        },
      });

      if (checkUnique) {
        throw new ConflictException('Код торгового занят');
      }
    }

    await this.prismaService.employees.update({
      where: {
        userId,
      },

      data: {
        ...buildUpdateData(dto),
      },
    });

    return buildResponse('Данные обновлены');
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
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        token: true,
        employee: {
          select: {
            id: true,

            citizenships: true,
          },
        },
      },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }

    if (citizenships?.length) {
      const existing = user.employee.citizenships.map((c) => c.id);
      await validateImportedField('citizen', {
        existing,
        incoming: citizenships,
      });

      const isExistCitizenshipsDb =
        await this.prismaService.citizenships.findMany({
          where: {
            id: {
              in: citizenships,
            },
          },
        });
      if (isExistCitizenshipsDb.length !== citizenships?.length) {
        throw new NotFoundException(
          'Некоторые указанные вами страны не найдены',
        );
      }
    }

    await this.prismaService.employees.update({
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

    return buildResponse('Данные обновлены');
  }

  async disconnectCitizenship(citizenshipId: string, userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        token: true,
        employee: {
          where: {
            citizenships: {
              some: {
                id: citizenshipId,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!user.employee || !user.token) {
      throw new ConflictException(
        'Аккаунт не владеет всеми необходимыми возможностями',
      );
    }

    await this.prismaService.employees.update({
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

    return buildResponse('Данные обновлены');
  }
}
