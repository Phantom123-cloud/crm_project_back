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
    });

    if (!isExist) {
      throw new ConflictException('Склад не обнаружен');
    }

    if (isExist.type === 'CENTRAL') {
      throw new ConflictException('Центральный склад не блокируется');
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

    if (!findStockId) {
      await this.prismaService.stockItems.create({
        data: {
          productId,
          warehouseId,
          quantity,
        },
      });
    } else {
      await this.prismaService.stockItems.update({
        where: { id: findStockId.id },

        data: {
          quantity: quantity + findStockId.quantity,
        },
      });
    }

    return buildResponse('К-во обновлено');
  }
}
