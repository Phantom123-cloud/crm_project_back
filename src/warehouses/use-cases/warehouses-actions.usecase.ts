import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { AddStockItems } from '../dto/add-stock-items.dto';

@Injectable()
export class WarehousesActionsUseCase {
  constructor(private readonly prismaService: PrismaService) {}
  async isActive(id: string) {
    const isExist = await this.prismaService.warehouses.findUnique({
      where: {
        id,
      },

      select: {
        stockItems: true,
        type: true,
        isActive: true,
      },
    });

    if (!isExist) {
      throw new ConflictException('Склад не обнаружен');
    }

    if (isExist.type === 'CENTRAL') {
      throw new ConflictException('Центральный склад не блокируется');
    }

    if (isExist.stockItems.some((item) => item.quantity > 0)) {
      throw new ConflictException(
        'Заблокировать склад можно после перемещения всех остатков товара в другое место',
      );
    }
    await this.prismaService.warehouses.update({
      where: {
        id,
      },

      data: {
        isActive: !isExist.isActive,
      },
    });

    return buildResponse(
      `Cклад ${isExist.isActive ? 'заблокирован' : 'разблокирован'}`,
    );
  }
  async addStockItem(
    dto: AddStockItems,
    productId: string,
    warehouseId: string,
  ) {
    const { quantity } = dto;
    const isExistWarehouse = await this.prismaService.warehouses.findUnique({
      where: {
        id: warehouseId,
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
    });

    if (!isExistWarehouse) {
      throw new NotFoundException('Склад не найден');
    }

    const isExistProduct = await this.prismaService.products.findUnique({
      where: {
        id: productId,
      },
    });

    if (!isExistProduct) {
      throw new NotFoundException('Товар не найден');
    }

    const findStockId = isExistWarehouse.stockItems.find(
      (item) => item.product.id === productId,
    );

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
  ) {
    const { quantity } = dto;

    const [fromWarehouse, toWarehouse] = await this.prismaService.$transaction([
      this.prismaService.warehouses.findUnique({
        where: {
          id: fromWarehouseId,
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

  async acceptProduct(stockMovementsId: string, warehouseId: string) {
    const isExist = await this.prismaService.stockMovements.findUnique({
      where: {
        id: stockMovementsId,
      },
    });

    if (!isExist) {
      throw new NotFoundException('Данные не найдены');
    }

    if (!isExist.fromWarehouseId) {
      throw new ConflictException(
        'К товару попавшему на склад не через перемещение, операция не применима',
      );
    }

    const warehouse = await this.prismaService.warehouses.findUnique({
      where: {
        id: warehouseId,
      },

      select: {
        id: true,
        stockItems: true,
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Склад не найдены');
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
              ? isExist.toWarehouseId
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
}
