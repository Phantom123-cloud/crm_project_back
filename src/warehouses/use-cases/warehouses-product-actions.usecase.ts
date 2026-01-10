import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { AddStockItems } from '../dto/add-stock-items.dto';
import { SaleProductDto } from '../dto/sele-product.dto';
import type { Request } from 'express';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { WarehousesActionsUseCase } from './warehouses-actions.usecase';

@Injectable()
export class WarehousesProductActionsUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly warehousesActionsUseCase: WarehousesActionsUseCase,
  ) {}
  async saleProduct(
    req: Request,
    dto: SaleProductDto,
    productId: string,
    warehouseId: string,
  ) {
    const user = req.user as JwtPayload;
    const isWarehousesAdmin =
      await this.warehousesActionsUseCase.isWarehousesAdmin(user);

    const { quantity, reason, stockMovementType } = dto;
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

    if (!isExistWarehouse || !findStockId) {
      throw new NotFoundException(
        !isExistWarehouse ? 'Склад не найден' : 'Товар не обнаружен на складе',
      );
    }

    if (!isWarehousesAdmin && isExistWarehouse.ownerUserId !== user.id) {
      throw new ForbiddenException('У вас нет права на это действие');
    }

    if (quantity > findStockId.quantity) {
      throw new ConflictException(
        'К-во для списания не может быть больше чем общее к-во позиции на складе',
      );
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.stockItems.update({
        where: { id: findStockId.id },

        data: {
          quantity: findStockId.quantity - quantity,
        },
      });

      await tx.stockMovements.create({
        data: {
          productId,
          reason,
          fromWarehouseId: warehouseId,
          toWhomOrFromWhere: 'CLIENT',
          quantity,
          status: 'RECEIVED',
          stockMovementType,
        },
      });

      return;
    });

    return buildResponse('Перемещение выполнено');
  }
  async acceptProduct(
    req: Request,
    stockMovementsId: string,
    warehouseId: string,
  ) {
    const isExist = await this.prismaService.stockMovements.findUnique({
      where: {
        id: stockMovementsId,
      },
    });

    const user = req.user as JwtPayload;
    const isWarehousesAdmin =
      await this.warehousesActionsUseCase.isWarehousesAdmin(user);

    if (!isExist) {
      throw new NotFoundException('Данные не найдены');
    }

    const warehouse = await this.prismaService.warehouses.findUnique({
      where: {
        id: warehouseId,
      },

      select: {
        id: true,
        stockItems: true,
        ownerUserId: true,
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Склад не найдены');
    }

    if (!isWarehousesAdmin && warehouse.ownerUserId !== user.id) {
      throw new ForbiddenException('У вас нет права на это действие');
    }

    if (!isExist.fromWarehouseId) {
      throw new ConflictException(
        'К товару попавшему на склад не через перемещение, операция не применима',
      );
    }

    if (['RECEIVED', 'CANCELLED'].includes(isExist.status)) {
      throw new ConflictException(
        'Операция была выполнена, возможно необходимо обновить страницу',
      );
    }

    const isAccept = isExist.toWarehouseId === warehouse.id;

    const stockItemId = warehouse.stockItems.find(
      (item) => item.productId === isExist.productId,
    );

    await this.prismaService.$transaction(async (tx) => {
      if (!stockItemId) {
        await tx.stockItems.create({
          data: {
            productId: isExist.productId,
            warehouseId: isAccept
              ? (isExist.toWarehouseId as string)
              : (isExist.fromWarehouseId as string),
            quantity: isExist.quantity,
          },
        });
      } else {
        await tx.stockItems.update({
          where: { id: stockItemId.id },

          data: {
            quantity: isExist.quantity + stockItemId.quantity,
          },
        });
      }

      await tx.stockMovements.update({
        where: {
          id: stockMovementsId,
        },

        data: {
          status: isAccept ? 'RECEIVED' : 'CANCELLED',
        },
      });

      return;
    });

    return buildResponse('Перемещение товара подтверждено');
  }
  async scrapProduct(
    req: Request,
    warehouseId: string,
    productId: string,
    dto: AddStockItems,
  ) {
    const { quantity } = dto;
    const user = req.user as JwtPayload;
    const isWarehousesAdmin =
      await this.warehousesActionsUseCase.isWarehousesAdmin(user);

    const [isExistWarehouse, isExistStockItems] =
      await this.prismaService.$transaction([
        this.prismaService.warehouses.findUnique({
          where: {
            id: warehouseId,
          },

          select: {
            type: true,
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

    if (!isExistWarehouse || !isExistStockItems) {
      throw new NotFoundException(
        !isExistWarehouse ? 'Склад не найден' : 'Товар не обнаружен на складе',
      );
    }

    if (!isWarehousesAdmin && isExistWarehouse.ownerUserId !== user.id) {
      throw new ForbiddenException('У вас нет права на это действие');
    }

    if (isExistWarehouse.type !== 'CENTRAL') {
      throw new ConflictException(
        'Операция возвожна только с центрального склада',
      );
    }

    if (quantity > isExistStockItems.quantity) {
      throw new ConflictException(
        'К-во для списания не может быть больше чем общее к-во позиции на складе',
      );
    }
    await this.prismaService.$transaction(async (tx) => {
      await tx.stockItems.update({
        where: { id: isExistStockItems.id },
        data: {
          quantity: isExistStockItems.quantity - quantity,
        },
      });

      await tx.stockMovements.create({
        data: {
          productId,
          fromWarehouseId: warehouseId,
          quantity,
          status: 'SCRAP',
          stockMovementType: 'SCRAP',
        },
      });

      return;
    });

    return buildResponse('К-во обновлено');
  }
}
