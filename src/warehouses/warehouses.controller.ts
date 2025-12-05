import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
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
    return this.warehousesService.create(dto, ownerUserId);
  }

  @Put('is-active/:id')
  async isActive(@Param('id') id: string) {
    return this.warehousesService.isActive(id);
  }

  @Put('update/:id')
  async update(@Body() dto: UpdateWarehouseDto, @Param('id') id: string) {
    return this.warehousesService.update(dto, id);
  }

  // @AuthRoles('view_users')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async allTrips(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('isActive', new ParseBoolPipe({ optional: true }))
    isActive?: boolean,
  ) {
    return this.warehousesService.allWarehouses({
      page,
      limit,
      isActive,
    });
  }
}
