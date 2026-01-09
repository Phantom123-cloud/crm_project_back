import { Injectable } from '@nestjs/common';
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
          tripTypes: {
            select: {
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
}
