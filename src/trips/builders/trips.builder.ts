import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { PaginationTripsDto } from '../dto/pagination-trips.dto';

@Injectable()
export class TripsBuilder {
  constructor(private readonly prismaService: PrismaService) {}

  async allTrip(dto: PaginationTripsDto) {
    const { page, limit, isActive } = dto;

    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;

    const [trips, total] = await this.prismaService.$transaction([
      this.prismaService.trip.findMany({
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          ...(typeof isActive === 'boolean' && { isActive }),
        },
        select: {
          id: true,
          name: true,
          dateFrom: true,
          dateTo: true,
          isActive: true,

          // tripTypes: {
          //   select: {
          //     name: true,
          //   },
          // },
          creator: {
            select: {
              id: true,
              email: true,
            },
          },
          createdAt: true,
          // city: {
          //   select: {
          //     id: true,
          //     localeRu: true,
          //   },
          // },
          warehouses: {
            select: {
              id: true,
            },
          },
        },
      }),
      this.prismaService.trip.count({
        where: {
          ...(typeof isActive === 'boolean' && { isActive }),
        },
      }),
    ]);

    const countPages = Math.ceil(total / limit);

    return buildResponse('Данные', {
      data: { trips, total, countPages, page, limit },
    });
  }

  async tripById(id: string) {
    const trip = await this.prismaService.trip.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        dateFrom: true,
        dateTo: true,
        isActive: true,
        // tripTypes: {
        //   select: {
        //     name: true,
        //   },
        // },
        baseTeamParticipants: {
          select: {
            id: true,
            jobTitle: true,
            user: {
              select: {
                id: true,
                email: true,
                employee: {
                  select: {
                    fullName: true,
                    tradingСode: true,
                  },
                },
              },
            },
          },
        },
        companies: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,

        warehouses: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Выезд не найден');
    }

    return buildResponse('Данные', { data: { trip } });
  }
}
