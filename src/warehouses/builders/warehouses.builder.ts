import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StockMovementsStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/users/dto/pagination.dto';
import { buildResponse } from 'src/utils/build-response';

@Injectable()
export class WarehousesBuilder {
  constructor(private readonly prismaService: PrismaService) {}
  async allWarehouses(dto: PaginationDto) {
    const { page, limit, isActive } = dto;

    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;

    const [warehouses, total] = await this.prismaService.$transaction([
      this.prismaService.warehouses.findMany({
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
          user: {
            select: {
              employee: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          isActive: true,
          type: true,
          createdAt: true,
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
      data: { warehouses, total, countPages, page, limit },
    });
  }
  async warehouseById(id: string, page: number, limit: number) {
    const isExistWarehouse = await this.prismaService.warehouses.findUnique({
      where: {
        id,
      },
    });

    if (!isExistWarehouse) {
      throw new NotFoundException('Склад не найден');
    }

    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;
    const [warehouse, countTransitProduct, stockItems, total] =
      await this.prismaService.$transaction([
        this.prismaService.warehouses.findUnique({
          where: {
            id,
          },
          select: {
            id: true,
            name: true,
            user: {
              select: {
                employee: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
            isActive: true,
            type: true,
            createdAt: true,
            stockItems: {
              orderBy: {
                quantity: 'desc',
              },
              select: {
                quantity: true,
                id: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),
        this.prismaService.stockMovements.count({
          where: {
            toWarehouseId: id,
            status: 'TRANSIT',
          },
        }),

        this.prismaService.stockItems.findMany({
          where: {
            warehouseId: id,
          },
          skip: (currentPage - 1) * pageSize,
          take: pageSize,
          orderBy: {
            quantity: 'desc',
          },
          select: {
            quantity: true,
            id: true,
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        this.prismaService.stockItems.count({
          where: {
            warehouseId: id,
          },
        }),
      ]);

    const countPages = Math.ceil(total / limit);

    return buildResponse('Данные', {
      data: {
        warehouse,
        countTransitProduct,
        stockItems,
        total,
        countPages,
        page,
        limit,
      },
    });
  }
  async allStockMovements(
    warehouseId: string,
    page: number,
    limit: number,
    status?: StockMovementsStatus,
  ) {
    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;

    const [stockMovements, total] = await this.prismaService.$transaction([
      this.prismaService.stockMovements.findMany({
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          OR: [
            {
              toWarehouseId: warehouseId,
            },
            {
              fromWarehouseId: warehouseId,
            },
          ],
          ...(status && { status }),
        },

        select: {
          id: true,
          product: {
            select: {
              id: true,
              name: true,
            },
          },
          quantity: true,
          warehouseFrom: {
            select: {
              id: true,
              name: true,
            },
          },
          warehouseTo: {
            select: {
              id: true,
              name: true,
            },
          },

          status: true,
          stockMovementType: true,
          createdAt: true,
        },
      }),
      this.prismaService.stockMovements.count({
        where: {
          OR: [
            {
              toWarehouseId: warehouseId,
            },
            {
              fromWarehouseId: warehouseId,
            },
          ],
          ...(status && { status }),
        },
      }),
    ]);

    const countPages = Math.ceil(total / limit);

    return buildResponse('Данные', {
      data: { stockMovements, total, countPages, page, limit },
    });
  }

  async allWarehousesSelect(notId: string) {
    const data = await this.prismaService.warehouses.findMany({
      where: {
        isActive: true,
        id: {
          not: notId,
        },
      },

      select: {
        id: true,
        name: true,
      },
    });
    return buildResponse('Данные', {
      data,
    });
  }
}
