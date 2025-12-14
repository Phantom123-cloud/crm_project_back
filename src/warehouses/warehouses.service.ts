import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { buildResponse } from 'src/utils/build-response';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehousesActionsUseCase } from './use-cases/warehouses-actions.usecase';
import { WarehousesMutationUseCase } from './use-cases/warehouses-mutation.usecase';
import { WarehousesBuilder } from './builders/warehouses.builder';
import { PaginationDto } from 'src/users/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddStockItems } from './dto/add-stock-items.dto';
import { StockMovementsStatus } from '@prisma/client';

@Injectable()
export class WarehousesService {
  constructor(
    private readonly warehousesActionsUseCase: WarehousesActionsUseCase,
    private readonly warehousesMutationUseCase: WarehousesMutationUseCase,
    private readonly warehousesBuilder: WarehousesBuilder,
    private readonly prismaService: PrismaService,
  ) {}

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
    this.warehousesMutationUseCase.create(dto, ownerUserId);
    return buildResponse('Склад добавлен');
  }

  async isActive(id: string) {
    return this.warehousesActionsUseCase.isActive(id);
  }

  async update(dto: UpdateWarehouseDto, id: string) {
    return this.warehousesMutationUseCase.update(dto, id);
  }

  async allWarehouses(dto: PaginationDto) {
    return this.warehousesBuilder.allWarehouses(dto);
  }

  async allStockMovements(
    warehouseId: string,
    page: number,
    limit: number,
    status?: StockMovementsStatus,
  ) {
    return this.warehousesBuilder.allStockMovements(
      warehouseId,
      page,
      limit,
      status,
    );
  }
  async allWarehousesSelect(notId: string) {
    return this.warehousesBuilder.allWarehousesSelect(notId);
  }

  async warehouseById(id: string, page: number, limit: number) {
    return this.warehousesBuilder.warehouseById(id, page, limit);
  }

  async addStockItem(
    dto: AddStockItems,
    productId: string,
    warehouseId: string,
  ) {
    return this.warehousesActionsUseCase.addStockItem(
      dto,
      productId,
      warehouseId,
    );
  }

  async stockMovements(
    productId: string,
    fromWarehouseId: string,
    toWarehouseId: string,
    dto: AddStockItems,
  ) {
    return this.warehousesActionsUseCase.stockMovements(
      productId,
      fromWarehouseId,
      toWarehouseId,
      dto,
    );
  }

  async acceptProduct(stockMovementsId: string, warehouseId: string) {
    return this.warehousesActionsUseCase.acceptProduct(
      stockMovementsId,
      warehouseId,
    );
  }
}
