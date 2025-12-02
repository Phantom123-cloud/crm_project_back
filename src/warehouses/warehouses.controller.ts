import { Body, Controller, Param, Post, Put, Query } from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post('create')
  async create(
    @Body() dto: CreateWarehouseDto,
    @Query('ownerUserId') ownerUserId: string,
  ) {
    return await this.warehousesService.create(dto, ownerUserId);
  }

  @Put('is-active/:id')
  async isActive(@Param('id') id: string) {
    return await this.warehousesService.isActive(id);
  }

  @Put('update/:id')
  async update(@Body() dto: UpdateWarehouseDto, @Param('id') id: string) {
    return await this.warehousesService.update(dto, id);
  }
}
