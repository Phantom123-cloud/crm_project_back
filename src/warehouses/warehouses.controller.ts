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
import { AddStockItems } from './dto/add-stock-items.dto';
import { StockMovementsStatus } from '@prisma/client';

@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  async create(
    @Body() dto: CreateWarehouseDto,
    @Query('ownerUserId') ownerUserId: string,
  ) {
    return this.warehousesService.create(dto, ownerUserId);
  }

  @Put('is-active/:id')
  @HttpCode(HttpStatus.OK)
  async isActive(@Param('id') id: string) {
    return this.warehousesService.isActive(id);
  }

  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  async update(@Body() dto: UpdateWarehouseDto, @Param('id') id: string) {
    return this.warehousesService.update(dto, id);
  }

  // @AuthRoles('view_users')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async allWarehouses(
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

  @Get('all-stock-movements')
  @HttpCode(HttpStatus.OK)
  async allStockMovements(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('toWarehouseId') toWarehouseId: string,
    @Query('status') status: StockMovementsStatus,
  ) {
    return this.warehousesService.allStockMovements(
      toWarehouseId,
      page,
      limit,
      status,
    );
  }

  @Get('by/:id')
  @HttpCode(HttpStatus.OK)
  async warehouseById(@Param('id') id: string) {
    return this.warehousesService.warehouseById(id);
  }

  @Put('add-stock-item')
  @HttpCode(HttpStatus.OK)
  async addStockItem(
    @Query('productId') productId: string,
    @Query('warehouseId') warehouseId: string,
    @Body() dto: AddStockItems,
  ) {
    return this.warehousesService.addStockItem(dto, productId, warehouseId);
  }

  @Put('stock-movements')
  @HttpCode(HttpStatus.OK)
  async stockMovements(
    @Query('productId') productId: string,
    @Query('fromWarehouseId') fromWarehouseId: string,
    @Query('toWarehouseId') toWarehouseId: string,
    @Body() dto: AddStockItems,
  ) {
    return this.warehousesService.stockMovements(
      productId,
      fromWarehouseId,
      toWarehouseId,
      dto,
    );
  }

  @Put('receive-product')
  @HttpCode(HttpStatus.OK)
  async receiveProduct(@Query('stockMovementsId') stockMovementsId: string) {
    return this.warehousesService.receiveProduct(stockMovementsId);
  }
}
