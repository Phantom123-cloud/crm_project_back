import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadsService } from 'src/uploads/uploads.service';
import { EmployeeUpdateDto } from './dto/employee-update-dto';
import { buildResponse } from 'src/utils/build-response';
import { validateImportedField } from './utils/validateImportedField';
import { buildUpdateData } from './utils/buildUpdateData';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly filesService: FilesService,
    private readonly uploadsService: UploadsService,
  ) {}

  async updateEmployees(
    dto: Partial<EmployeeUpdateDto>,
    userId: string,
    files?: Array<Express.Multer.File>,
  ) {
    const { citizenships, phones, foreignLanguages } = dto;
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        token: true,
        employee: {
          select: {
            id: true,
            phones: {
              select: {
                option: true,
                number: true,
              },
            },
            foreignLanguages: {
              select: {
                languageId: true,
                level: true,
              },
            },
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

    if (dto.tradingСode) {
      const checkUnique = await this.prismaService.employees.findUnique({
        where: {
          tradingСode: dto.tradingСode,
        },
      });

      if (checkUnique) {
        throw new ConflictException('Код торгового занят');
      }
    }
    const employeesId = user.employee.id;
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
    if (phones?.length) {
      const existing = user.employee.phones.map(({ option, number }) => {
        return { option, number };
      });

      await validateImportedField('phone', { existing, incoming: phones });
    }
    if (foreignLanguages?.length) {
      const existing = user.employee.foreignLanguages.map(
        ({ languageId, level }) => ({ languageId, level }),
      );
      await validateImportedField('language', {
        existing,
        incoming: foreignLanguages,
      });

      const isExistLanguages = await this.prismaService.languages.findMany({
        where: {
          id: {
            in: foreignLanguages.map((e) => e.languageId),
          },
        },
      });
      if (isExistLanguages.length !== foreignLanguages?.length) {
        throw new NotFoundException(
          'Некоторые указанные вами языки не найдены ',
        );
      }
    }
    await this.prismaService.$transaction(async (tx) => {
      if (phones?.length) {
        await tx.phones.createMany({
          data: phones.map(({ number, option }) => ({
            employeesId,
            number,
            option,
          })),
        });
      }

      if (foreignLanguages?.length) {
        await tx.foreignLanguages.createMany({
          data: foreignLanguages.map(({ languageId, level }) => ({
            employeesId,
            languageId,
            level,
          })),
        });
      }

      if (files?.length) {
        const filePathTask = this.uploadsService.seveFiles(files);
        await this.filesService.createFileItemInDb(
          filePathTask,
          employeesId,
          'PASSPORT',
        );
      }

      await tx.user.update({
        where: {
          id: userId,
        },

        data: {
          email: dto.email || undefined,
          fullName: dto.fullName || undefined,
          employee: {
            update: {
              data: {
                ...buildUpdateData(dto),
                ...(citizenships?.length && {
                  citizenships: {
                    connect: citizenships?.map((id) => ({ id })),
                  },
                }),
              },
            },
          },
        },
      });

      return;
    });

    return buildResponse('Данные обновлены');
  }
}
