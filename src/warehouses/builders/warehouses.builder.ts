import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import type { Request } from 'express';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { RolesDataBuilder } from 'src/roles/builders/roles-data.builder';
import { PaginationWarehousesDto } from '../dto/pagination-warehouses.dto';
import { PaginationStockMovementsDto } from '../dto/pagination-stock-movements.dto';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';

@Injectable()
export class WarehousesBuilder {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly rolesDataBuilder: RolesDataBuilder,
  ) {}
  async allWarehouses(dto: PaginationWarehousesDto, req: Request) {
    const { page, limit, isActive } = dto;
    const user = req.user as JwtPayload;
    const userRoles = await this.rolesDataBuilder.getRolesNameByUserId(user.id);

    const isWarehousesAdmin = userRoles.some(
      (roleName) => roleName === 'warehouses_admin',
    );

    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;

    const [warehousesData, total] = await this.prismaService.$transaction([
      this.prismaService.warehouses.findMany({
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          ...(typeof isActive === 'boolean' && { isActive }),
          ...(!isWarehousesAdmin && { ownerUserId: user.id }),
        },
        select: {
          id: true,
          name: true,
          user: {
            select: {
              email: true,
              id: true,
            },
          },
          isActive: true,
          type: true,
          createdAt: true,
          stockMovementsTo: {
            select: {
              status: true,
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

    const warehouses = warehousesData.map((warehouse) => ({
      ...warehouse,
      countTransit: warehouse.stockMovementsTo.filter(
        (item) => item.status === 'TRANSIT',
      ).length,
    }));

    return buildResponse('Данные', {
      data: { warehouses, total, countPages, page, limit },
    });
  }
  async warehouseById(id: string, dto: PaginationBasic) {
    const { page, limit } = dto;
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

            quantity: {
              gte: 1,
            },
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
  async allStockMovements(dto: PaginationStockMovementsDto) {
    const { page, limit, warehouseId, status } = dto;
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
          reason: true,
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
          toWhomOrFromWhere: true,
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
  async getReportRemainderWarehouses() {
    const [products, warehouses, statusProducts] =
      await this.prismaService.$transaction([
        this.prismaService.products.findMany({
          where: {
            stockItems: {
              some: {
                quantity: {
                  gte: 0,
                },
              },
            },
          },

          select: {
            id: true,
            name: true,
          },
        }),

        this.prismaService.warehouses.findMany({
          where: {
            isActive: true,
            OR: [
              {
                stockItems: {
                  some: {
                    quantity: {
                      gte: 1,
                    },
                  },
                },
              },

              {
                stockMovementsTo: {
                  some: {
                    quantity: {
                      gte: 1,
                    },
                  },
                },
              },
            ],
          },

          select: {
            name: true,
            id: true,
            stockItems: {
              select: {
                quantity: true,
                product: {
                  select: {
                    name: true,
                    id: true,
                  },
                },
              },
            },
          },
        }),
        this.prismaService.stockMovements.findMany({
          where: {
            status: {
              in: ['TRANSIT', 'SCRAP'],
            },
          },

          select: {
            product: {
              select: {
                name: true,
                id: true,
              },
            },

            warehouseTo: {
              select: {
                id: true,
                name: true,
              },
            },

            warehouseFrom: {
              select: {
                id: true,
                name: true,
              },
            },
            quantity: true,
            status: true,
          },
        }),
      ]);

    const body = products.map(({ id, name }) => ({
      id,
      name,
      remainder: 0,
      scrapTotal: 0,
      warehouses: warehouses.map((item) => ({
        name: item.name,
        countProduct: 0,
        warehouseId: item.id,
        transit: 0,
      })),
    }));

    const header = warehouses.map(({ name }) => name);
    const warehousesMap = new Map<string, number>();

    body.forEach((item) =>
      item.warehouses.forEach((item, index) =>
        warehousesMap.set(item.warehouseId, index),
      ),
    );

    const statusMap = new Map<string, { transit: number; scrap: number }>();

    for (const m of statusProducts) {
      const whId =
        m.status === 'TRANSIT'
          ? m.warehouseTo?.id
          : m.status === 'SCRAP'
            ? m.warehouseFrom?.id
            : undefined;

      if (!whId) continue;

      const key = `${whId}:${m.product.id}`;
      const cur = statusMap.get(key) ?? { transit: 0, scrap: 0 };

      if (m.status === 'TRANSIT') cur.transit += m.quantity;
      else cur.scrap += m.quantity;

      statusMap.set(key, cur);
    }

    const productIndexes = new Map(body.map((p, i) => [p.id, i]));
    warehouses.forEach((warehouse) => {
      warehouse.stockItems.forEach((item) => {
        const productIndex = productIndexes.get(item.product.id);

        if (typeof productIndex !== 'number') {
          throw new ConflictException(
            'При создании отчета возникла ошибка. Обратитесь к администратору',
          );
        }

        const key = `${warehouse.id}:${item.product.id}`;
        const statuses = statusMap.get(key) ?? { transit: 0, scrap: 0 };

        const wId = warehousesMap.get(warehouse.id);

        if (typeof wId !== 'number') {
          throw new ConflictException(
            'Что то пошло не так, обратитесь к администратору',
          );
        }

        body[productIndex].warehouses[wId].transit = statuses.transit;
        body[productIndex].warehouses[wId].countProduct = item.quantity;

        body[productIndex].remainder += item.quantity + statuses.transit;
        body[productIndex].scrapTotal += statuses.scrap;
      });
    });

    body.sort((a, b) => {
      return b.remainder - a.remainder;
    });
    return buildResponse('Данные', {
      data: {
        body,
        header,
      },
    });
  }
}
