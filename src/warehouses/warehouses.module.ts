import { Module } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { WarehousesController } from './warehouses.controller';
import { WarehousesActionsUseCase } from './use-cases/warehouses-actions.usecase';
import { WarehousesMutationUseCase } from './use-cases/warehouses-mutation.usecase';
import { WarehousesBuilder } from './builders/warehouses.builder';

@Module({
  controllers: [WarehousesController],
  providers: [
    WarehousesService,
    WarehousesActionsUseCase,
    WarehousesMutationUseCase,
    WarehousesBuilder,
  ],
  exports: [WarehousesMutationUseCase],
})
export class WarehousesModule {}
