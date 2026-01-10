import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { AddStockItems } from '../dto/add-stock-items.dto';
import type { Request } from 'express';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { WarehousesActionsUseCase } from './warehouses-actions.usecase';

@Injectable()
export class WarehousesStockMoveUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly warehousesActionsUseCase: WarehousesActionsUseCase,
  ) {}

  async addStockItem(
    req: Request,
    dto: AddStockItems,
    productId: string,
    warehouseId: string,
  ) {
    const user = req.user as JwtPayload;
    const isWarehousesAdmin =
      await this.warehousesActionsUseCase.isWarehousesAdmin(user);

    const { quantity, fromOrTo } = dto;
    const [isExistWarehouse, findStockId] =
      await this.prismaService.$transaction([
        this.prismaService.warehouses.findUnique({
          where: {
            id: warehouseId,
          },

          select: {
            ownerUserId: true,
            stockItems: {
              select: {
                id: true,
                quantity: true,
                product: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        }),
        this.prismaService.stockItems.findFirst({
          where: {
            productId,
            warehouseId,
          },

          select: {
            id: true,
            quantity: true,
          },
        }),
      ]);

    if (!isExistWarehouse) {
      throw new NotFoundException('Склад не найден');
    }

    if (!isWarehousesAdmin && isExistWarehouse.ownerUserId !== user.id) {
      throw new ForbiddenException('У вас нет права на это действие');
    }

    await this.prismaService.$transaction(async (tx) => {
      if (!findStockId) {
        await tx.stockItems.create({
          data: {
            productId,
            warehouseId,
            quantity,
          },
        });
      } else {
        await tx.stockItems.update({
          where: { id: findStockId.id },

          data: {
            quantity: quantity + findStockId.quantity,
          },
        });
      }

      await tx.stockMovements.create({
        data: {
          productId,
          toWarehouseId: warehouseId,
          toWhomOrFromWhere: fromOrTo,
          quantity,
          status: 'RECEIVED',
          stockMovementType: 'GOODS_RECEIPT',
        },
      });

      return;
    });

    return buildResponse('К-во обновлено');
  }
  async stockMovements(
    productId: string,
    fromWarehouseId: string,
    toWarehouseId: string,
    dto: AddStockItems,
    req: Request,
  ) {
    const { quantity } = dto;
    const user = req.user as JwtPayload;
    const isWarehousesAdmin =
      await this.warehousesActionsUseCase.isWarehousesAdmin(user);

    const [fromWarehouse, toWarehouse] = await this.prismaService.$transaction([
      this.prismaService.warehouses.findUnique({
        where: {
          id: fromWarehouseId,
        },

        select: {
          ownerUserId: true,
          stockItems: {
            select: {
              id: true,
              quantity: true,
              product: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      }),
      this.prismaService.warehouses.findUnique({
        where: {
          id: toWarehouseId,
        },

        select: {
          stockItems: {
            select: {
              id: true,
              quantity: true,
              product: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      }),
    ]);

    if (!fromWarehouse || !toWarehouse) {
      throw new NotFoundException('Склад не найден');
    }

    if (!isWarehousesAdmin && fromWarehouse.ownerUserId !== user.id) {
      throw new ForbiddenException('У вас нет права на это действие');
    }

    const stockItemsForReduce = fromWarehouse.stockItems.find(
      (item) => item.product.id === productId,
    );

    if (!stockItemsForReduce) {
      throw new NotFoundException('Товар не найден');
    }

    if (stockItemsForReduce.quantity < quantity) {
      throw new ConflictException(
        'Вы не можете совершить перемещение в большем к-ве чем общее на складе',
      );
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.stockItems.update({
        where: { id: stockItemsForReduce.id },

        data: {
          quantity: stockItemsForReduce.quantity - quantity,
        },
      });

      await tx.stockMovements.create({
        data: {
          productId,
          toWarehouseId,
          fromWarehouseId,
          quantity,
          status: 'TRANSIT',
          stockMovementType: 'STOCK_TRANSFER',
        },
      });

      return;
    });

    return buildResponse('Перемещение выполнено');
  }
}
