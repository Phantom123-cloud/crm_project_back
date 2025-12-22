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
import { SaleProductDto } from './dto/sele-product.dto';

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
    @Query('warehouseId') warehouseId: string,
    @Query('status') status: StockMovementsStatus,
  ) {
    return this.warehousesService.allStockMovements(
      warehouseId,
      page,
      limit,
      status,
    );
  }

  @Get('select-all')
  @HttpCode(HttpStatus.OK)
  async allWarehousesSelect(@Query('notId') notId: string) {
    return this.warehousesService.allWarehousesSelect(notId);
  }

  @Get('by/:id')
  @HttpCode(HttpStatus.OK)
  async warehouseById(
    @Param('id') id: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.warehousesService.warehouseById(id, page, limit);
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
  @Put('scrap-product')
  @HttpCode(HttpStatus.OK)
  async scrapProduct(
    @Query('warehouseId') warehouseId: string,
    @Query('productId') productId: string,
    @Body() dto: AddStockItems,
  ) {
    return this.warehousesService.scrapProduct(warehouseId, productId, dto);
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

  @Put('sale-product')
  @HttpCode(HttpStatus.OK)
  async saleProduct(
    @Query('productId') productId: string,
    @Query('warehouseId') warehouseId: string,
    @Body() dto: SaleProductDto,
  ) {
    return this.warehousesService.saleProduct(dto, productId, warehouseId);
  }

  @Put('accept-product')
  @HttpCode(HttpStatus.OK)
  async acceptProduct(
    @Query('stockMovementsId') stockMovementsId: string,
    @Query('warehouseId') warehouseId: string,
  ) {
    return this.warehousesService.acceptProduct(stockMovementsId, warehouseId);
  }
}
