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
import { RolesDataBuilder } from 'src/roles/builders/roles-data.builder';

@Injectable()
export class WarehousesActionsUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly rolesDataBuilder: RolesDataBuilder,
  ) {}

  async isWarehousesAdmin(user: JwtPayload) {
    const userRoles = await this.rolesDataBuilder.getRolesNameByUserId(user.id);
    return userRoles.some((roleName) => roleName === 'warehouses_admin');
  }
  async isActive(id: string) {
    const [isExistWarehouse, isExistEmptyStockItems, isEmptyStockMovements] =
      await this.prismaService.$transaction([
        this.prismaService.warehouses.findUnique({
          where: {
            id,
          },

          select: {
            stockItems: true,
            type: true,
            isActive: true,
            ownerUserId: true,
          },
        }),

        this.prismaService.stockItems.count({
          where: {
            warehouseId: id,
            quantity: {
              gte: 1,
            },
          },
        }),
        this.prismaService.stockMovements.count({
          where: {
            OR: [
              {
                toWarehouseId: id,
              },
              {
                fromWarehouseId: id,
              },
            ],

            status: 'TRANSIT',
          },
        }),
      ]);

    if (!isExistWarehouse) {
      throw new ConflictException('Склад не обнаружен');
    }

    if (isExistWarehouse.type === 'CENTRAL') {
      throw new ConflictException('Центральный склад не блокируется');
    }

    if (isExistEmptyStockItems > 0 || isEmptyStockMovements > 0) {
      throw new ConflictException(
        'Заблокировать склад можно после перемещения всех остатков товара в другое место',
      );
    }

    await this.prismaService.warehouses.update({
      where: {
        id,
      },

      data: {
        isActive: !isExistWarehouse.isActive,
      },
    });

    return buildResponse(
      `Cклад ${isExistWarehouse.isActive ? 'заблокирован' : 'разблокирован'}`,
    );
  }
  async addStockItem(
    req: Request,
    dto: AddStockItems,
    productId: string,
    warehouseId: string,
  ) {
    const user = req.user as JwtPayload;
    const isWarehousesAdmin = await this.isWarehousesAdmin(user);

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
  async saleProduct(
    req: Request,
    dto: SaleProductDto,
    productId: string,
    warehouseId: string,
  ) {
    const user = req.user as JwtPayload;
    const isWarehousesAdmin = await this.isWarehousesAdmin(user);

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
  async stockMovements(
    productId: string,
    fromWarehouseId: string,
    toWarehouseId: string,
    dto: AddStockItems,
    req: Request,
  ) {
    const { quantity } = dto;
    const user = req.user as JwtPayload;
    const isWarehousesAdmin = await this.isWarehousesAdmin(user);

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
    const isWarehousesAdmin = await this.isWarehousesAdmin(user);

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
    const isWarehousesAdmin = await this.isWarehousesAdmin(user);

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

  async changeOwnerWarehouse(
    warehouseId: string,
    ownerUserId: string,
    req: Request,
  ) {
    const user = req.user as JwtPayload;
    const [isExistWarehouse, isExistUser] =
      await this.prismaService.$transaction([
        this.prismaService.warehouses.findUnique({
          where: {
            id: warehouseId,
          },

          select: {
            ownerUserId: true,
          },
        }),
        this.prismaService.user.findUnique({
          where: {
            id: ownerUserId,
          },
        }),
      ]);

    if (!isExistWarehouse || !isExistUser) {
      throw new NotFoundException(
        !isExistWarehouse ? 'Склад не найден' : 'Пользователь не найден',
      );
    }

    await this.prismaService.warehouses.update({
      where: {
        id: warehouseId,
      },
      data: {
        ownerUserId,
      },
    });
    return buildResponse('Ответственный обновлён');
  }
}
