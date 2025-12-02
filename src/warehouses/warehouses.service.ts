import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { buildResponse } from 'src/utils/build-response';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateWarehouseDto, ownerUserId: string) {
    const { name, type } = dto;

    const isExist = await this.prismaService.warehouses.findUnique({
      where: {
        name,
      },
    });

    if (isExist) {
      throw new ConflictException('Данное имя склада уже задействовано');
    }

    const { id } = await this.prismaService.warehouses.create({
      data: {
        name,
        type,
        ownerUserId,
      },
    });

    return id;
    // return buildResponse('Склад добавлен');
  }

  async isActive(id: string) {
    const isExist = await this.prismaService.warehouses.findUnique({
      where: {
        id,
      },
    });

    if (!isExist) {
      throw new ConflictException('Склад не обнаружен');
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

    if (isExist.type === 'TRIP') {
      throw new ConflictException(
        'Склад предназначеный для выезда изменять нельзя',
      );
    }

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
