import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { ArrayCompaniesDto } from '../dto/array-companies.dto copy';

@Injectable()
export class TripCompaniecUsecase {
  constructor(private readonly prismaService: PrismaService) {}

  async addCompanies(dto: ArrayCompaniesDto, tripId: string) {
    const { companies } = dto;

    const [isExistTrip, isExistCompanies] =
      await this.prismaService.$transaction([
        this.prismaService.trip.findUnique({
          where: {
            id: tripId,
          },

          select: {
            companies: {
              select: {
                id: true,
              },
            },
          },
        }),
        this.prismaService.company.findMany({
          where: {
            id: {
              in: companies,
            },
          },
        }),
      ]);

    if (!isExistTrip || isExistCompanies.length !== companies.length) {
      throw new NotFoundException(
        !isExistTrip ? 'Выезд не найден' : 'Компания не найдена',
      );
    }

    const isExistCompaniesInTrips = isExistTrip.companies.some((ct) =>
      companies.some((c) => c === ct.id),
    );

    if (isExistCompaniesInTrips) {
      throw new ConflictException(
        'Вы не можете прикрепить к выезду 2 раза одну компанию',
      );
    }

    await this.prismaService.trip.update({
      where: {
        id: tripId,
      },

      data: {
        companies: {
          connect: companies.map((id) => ({ id })),
        },
      },
    });

    return buildResponse('Компании добавлены');
  }
  async disconnectCompany(companyId: string, tripId: string) {
    const [isExistTrip, isExistCompany] = await this.prismaService.$transaction(
      [
        this.prismaService.trip.findUnique({
          where: {
            id: tripId,
          },

          select: {
            companies: {
              select: {
                id: true,
              },
            },
          },
        }),
        this.prismaService.company.findUnique({
          where: {
            id: companyId,
          },
        }),
      ],
    );

    if (!isExistTrip || !isExistCompany) {
      throw new NotFoundException(
        !isExistTrip ? 'Выезд не найден' : 'Компания не найдена',
      );
    }

    const isExistCompaniesInTrips = isExistTrip.companies.some(
      (ct) => ct.id === companyId,
    );

    if (!isExistCompaniesInTrips) {
      throw new ConflictException('Компания отсутствует в выезде');
    }

    await this.prismaService.trip.update({
      where: {
        id: tripId,
      },

      data: {
        companies: {
          disconnect: {
            id: companyId,
          },
        },
      },
    });

    return buildResponse('Компания удалена');
  }
}
