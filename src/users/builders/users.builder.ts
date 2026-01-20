import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationUsersDto } from '../dto/pagination-users.dto';
import { buildResponse } from 'src/utils/build-response';

@Injectable()
export class AllUsersBuilder {
  constructor(private readonly prismaService: PrismaService) {}

  async allUsers(dto: PaginationUsersDto) {
    const { page, limit, isActive, isOnline, isFullData } = dto;

    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;
    const [users, total, online, offline, blocked] =
      await this.prismaService.$transaction([
        this.prismaService.user.findMany({
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          orderBy: {
            createdAt: 'desc',
          },

          where: {
            ...(typeof isActive === 'boolean' && { isActive }),
            ...(typeof isOnline === 'boolean' && { isOnline }),
          },
          select: {
            id: true,
            email: true,
            createdAt: true,
            isActive: true,
            isOnline: true,
            ...(isFullData && {
              employee: {
                select: {
                  coordinator: {
                    select: {
                      email: true,
                      id: true,
                    },
                  },
                  isCoordinator: true,
                  fullName: true,
                  passportNumber: true,
                  tradingСode: true,
                  citizenships: {
                    select: {
                      localeRu: true,
                      localeEn: true,
                    },
                  },
                  registrationAddress: true,
                  actualAddress: true,
                  birthDate: true,
                  phones: {
                    select: {
                      number: true,
                      option: true,
                    },
                  },
                  dateFirstTrip: true,
                  isInMarriage: true,
                  isHaveChildren: true,
                  isHaveDriverLicense: true,
                  drivingExperience: true,
                  isHaveInterPassport: true,
                  foreignLanguages: {
                    select: {
                      level: true,
                      language: {
                        select: {
                          localeRu: true,
                          localeEn: true,
                        },
                      },
                    },
                  },
                },
              },
            }),
          },
        }),
        this.prismaService.user.count({
          where: {
            ...(typeof isActive === 'boolean' && { isActive }),
            ...(typeof isOnline === 'boolean' && { isOnline }),
          },
        }),

        this.prismaService.user.count({
          where: {
            isOnline: true,
          },
        }),
        this.prismaService.user.count({
          where: {
            isOnline: false,
          },
        }),
        this.prismaService.user.count({
          where: {
            isActive: false,
          },
        }),
      ]);

    const countPages = Math.ceil(total / limit);

    return buildResponse('Данные', {
      data: { users, total, countPages, page, limit, online, offline, blocked },
    });
  }
  async userById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        isActive: true,
        isOnline: true,
        roleTemplatesId: true,
        employee: {
          select: {
            coordinator: {
              select: {
                email: true,
                id: true,
              },
            },
            isCoordinator: true,
            id: true,
            fullName: true,
            tradingСode: true,
            passportNumber: true,
            notes: true,
            registrationAddress: true,
            actualAddress: true,
            citizenships: {
              select: {
                id: true,
                localeRu: true,
                localeEn: true,
              },
            },
            birthDate: true,
            phones: {
              select: {
                id: true,
                number: true,
                option: true,
              },
            },
            dateFirstTrip: true,
            isInMarriage: true,
            isHaveChildren: true,
            isHaveDriverLicense: true,
            drivingExperience: true,
            isHaveInterPassport: true,
            foreignLanguages: {
              select: {
                id: true,
                level: true,
                language: {
                  select: { id: true, localeRu: true, localeEn: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    const filesName = await this.prismaService.files.findMany({
      where: {
        employeesId: user?.employee?.id,
        type: 'PASSPORT',
      },

      select: {
        fileName: true,
      },
    });

    const passports = filesName.map((file) => file.fileName);

    return buildResponse('Данные', {
      data: { user, passports },
    });
  }
}
