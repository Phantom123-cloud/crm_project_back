import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';

@Injectable()
export class WarehousesMutationUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateWarehouseDto, ownerUserId: string) {
    const isExistMainWarehouse = await this.prismaService.warehouses.findFirst({
      where: {
        type: 'CENTRAL',
      },
    });

    if (!isExistMainWarehouse && dto.type !== 'CENTRAL') {
      throw new NotFoundException(
        'Что бы начать работу, создайте центральный склад',
      );
    }

    const { name, type } = dto;

    const isExist = await this.prismaService.warehouses.findUnique({
      where: {
        name,
      },
    });

    if (isExist) {
      throw new ConflictException('Данное имя склада уже задействовано');
    }

    const warehouse = await this.prismaService.warehouses.create({
      data: {
        name,
        type,
        ownerUserId,
      },
    });

    const products = await this.prismaService.products.findMany({
      select: {
        id: true,
      },

      where: {
        stockItems: {
          some: {
            quantity: {
              gte: 1,
            },
          },
        },
      },
    });

    const uniqueProducts = [...new Set(products.map((item) => item.id))];

    await this.prismaService.stockItems.createMany({
      data: uniqueProducts.map((productId) => ({
        productId,
        warehouseId: warehouse.id,
        quantity: 0,
      })),
    });

    return buildResponse('Склад добавлен');
  }
  async update(dto: UpdateWarehouseDto, id: string) {
    const { name } = dto;
    const isExist = await this.prismaService.warehouses.findUnique({
      where: {
        id,
      },
    });

    if (!isExist) {
      throw new ConflictException('Склад не обнаружен');
    }

    // if (isExist.type === 'TRIP') {
    //   throw new ConflictException(
    //     'Склад предназначеный для выезда изменять нельзя',
    //   );
    // }

    if (name === isExist.name) {
      throw new ConflictException('Новое имя должно отличаться от текущего');
    }

    const isExistNewData = await this.prismaService.warehouses.findFirst({
      where: {
        name,
      },
    });

    if (isExistNewData) {
      throw new ConflictException('Склад с такими данными уже существует');
    }

    await this.prismaService.warehouses.update({
      where: {
        id,
      },

      data: {
        name,
      },
    });

    return buildResponse('Склад обновлён');
  }
}
