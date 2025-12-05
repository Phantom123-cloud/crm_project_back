import { Injectable } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { buildResponse } from 'src/utils/build-response';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehousesActionsUseCase } from './use-cases/warehouses-actions.usecase';
import { WarehousesMutationUseCase } from './use-cases/warehouses-mutation.usecase';
import { WarehousesBuilder } from './builders/warehouses.builder';
import { PaginationDto } from 'src/users/dto/pagination.dto';

@Injectable()
export class WarehousesService {
  constructor(
    private readonly warehousesActionsUseCase: WarehousesActionsUseCase,
    private readonly warehousesMutationUseCase: WarehousesMutationUseCase,
    private readonly warehousesBuilder: WarehousesBuilder,
  ) {}

  async create(dto: CreateWarehouseDto, ownerUserId: string) {
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
}
