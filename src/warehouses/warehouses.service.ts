import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { buildResponse } from 'src/utils/build-response';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehousesActionsUseCase } from './use-cases/warehouses-actions.usecase';
import { WarehousesMutationUseCase } from './use-cases/warehouses-mutation.usecase';
import { WarehousesBuilder } from './builders/warehouses.builder';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddStockItems } from './dto/add-stock-items.dto';
import { StockMovementsStatus } from '@prisma/client';
import { SaleProductDto } from './dto/sele-product.dto';
import type { Request } from 'express';
import { PaginationWarehousesDto } from './dto/pagination-warehouses.dto';
import { PaginationStockMovementsDto } from './dto/pagination-stock-movements.dto';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';

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
    const warehouseId = await this.warehousesMutationUseCase.create(
      dto,
      ownerUserId,
    );
    const stockItems = await this.prismaService.stockItems.findMany({
      where: {
        quantity: {
          gte: 1,
        },
      },

      select: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const uniqueProducts = [
      ...new Set(stockItems.map((item) => item.product.id)),
    ];

    await this.prismaService.stockItems.createMany({
      data: uniqueProducts.map((productId) => ({
        productId,
        warehouseId,
        quantity: 0,
      })),
    });

    return buildResponse('Склад добавлен');
  }

  async isActive(id: string) {
    return this.warehousesActionsUseCase.isActive(id);
  }

  async update(dto: UpdateWarehouseDto, id: string) {
    return this.warehousesMutationUseCase.update(dto, id);
  }

  async allWarehouses(dto: PaginationWarehousesDto, req: Request) {
    return this.warehousesBuilder.allWarehouses(dto, req);
  }

  async allStockMovements(dto: PaginationStockMovementsDto) {
    return this.warehousesBuilder.allStockMovements(dto);
  }
  async allWarehousesSelect(notId: string) {
    return this.warehousesBuilder.allWarehousesSelect(notId);
  }

  async warehouseById(id: string, dto: PaginationBasic) {
    return this.warehousesBuilder.warehouseById(id, dto);
  }

  async getReportRemainderWarehouses() {
    return this.warehousesBuilder.getReportRemainderWarehouses();
  }

  async addStockItem(
    req: Request,
    dto: AddStockItems,
    productId: string,
    warehouseId: string,
  ) {
    return this.warehousesActionsUseCase.addStockItem(
      req,
      dto,
      productId,
      warehouseId,
    );
  }
  async saleProduct(
    req: Request,
    dto: SaleProductDto,
    productId: string,
    warehouseId: string,
  ) {
    return this.warehousesActionsUseCase.saleProduct(
      req,
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
    req: Request,
  ) {
    return this.warehousesActionsUseCase.stockMovements(
      productId,
      fromWarehouseId,
      toWarehouseId,
      dto,
      req,
    );
  }

  async acceptProduct(
    req: Request,
    stockMovementsId: string,
    warehouseId: string,
  ) {
    return this.warehousesActionsUseCase.acceptProduct(
      req,
      stockMovementsId,
      warehouseId,
    );
  }

  async scrapProduct(
    req: Request,
    warehouseId: string,
    productId: string,
    dto: AddStockItems,
  ) {
    return this.warehousesActionsUseCase.scrapProduct(
      req,
      warehouseId,
      productId,
      dto,
    );
  }
  async changeOwnerWarehouse(
    warehouseId: string,
    ownerUserId: string,
    req: Request,
  ) {
    return this.warehousesActionsUseCase.changeOwnerWarehouse(
      warehouseId,
      ownerUserId,
      req,
    );
  }
}
