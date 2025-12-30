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
  Req,
} from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { AddStockItems } from './dto/add-stock-items.dto';
import { StockMovementsStatus } from '@prisma/client';
import { SaleProductDto } from './dto/sele-product.dto';
import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';
import type { Request } from 'express';

@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}
  @AuthRoles('create_warehouses')
  @Post('create')
  @HttpCode(HttpStatus.OK)
  async create(
    @Body() dto: CreateWarehouseDto,
    @Query('ownerUserId') ownerUserId: string,
  ) {
    return this.warehousesService.create(dto, ownerUserId);
  }

  @AuthRoles('warehouses_admin')
  @Put('is-active/:id')
  @HttpCode(HttpStatus.OK)
  async isActive(@Param('id') id: string) {
    return this.warehousesService.isActive(id);
  }

  @AuthRoles('warehouses_admin')
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  async update(@Body() dto: UpdateWarehouseDto, @Param('id') id: string) {
    return this.warehousesService.update(dto, id);
  }

  @AuthRoles('view_warehouses')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async allWarehouses(
    @Req() req: Request,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('isActive', new ParseBoolPipe({ optional: true }))
    isActive?: boolean,
  ) {
    return this.warehousesService.allWarehouses(
      {
        page,
        limit,
        isActive,
      },
      req,
    );
  }

  @AuthRoles('view_warehouse_by_id')
  @Get('all-stock-movements')
  @HttpCode(HttpStatus.OK)
  async allStockMovements(
    @Req() req: Request,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('warehouseId') warehouseId: string,
    @Query('status') status: StockMovementsStatus,
  ) {
    return this.warehousesService.allStockMovements(
      req,
      warehouseId,
      page,
      limit,
      status,
    );
  }

  @AuthRoles('view_warehouse_by_id')
  @Get('by/:id')
  @HttpCode(HttpStatus.OK)
  async warehouseById(
    @Param('id') id: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.warehousesService.warehouseById(id, page, limit);
  }

  // для списка складов перемещения товаров
  @AuthRoles('stock_movements')
  @Get('select-all')
  @HttpCode(HttpStatus.OK)
  async allWarehousesSelect(@Query('notId') notId: string) {
    return this.warehousesService.allWarehousesSelect(notId);
  }

  // @AuthRoles('stock_movements')
  @Get('report-warehouses-remainder')
  @HttpCode(HttpStatus.OK)
  async getReportRemainderWarehouses() {
    return this.warehousesService.getReportRemainderWarehouses();
  }

  @AuthRoles('stock_movements')
  @Put('stock-movements')
  @HttpCode(HttpStatus.OK)
  async stockMovements(
    @Req() req: Request,
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
      req,
    );
  }

  @AuthRoles('add_product_to_warehouse')
  @Put('add-stock-item')
  @HttpCode(HttpStatus.OK)
  async addStockItem(
    @Req() req: Request,
    @Query('productId') productId: string,
    @Query('warehouseId') warehouseId: string,
    @Body() dto: AddStockItems,
  ) {
    return this.warehousesService.addStockItem(
      req,
      dto,
      productId,
      warehouseId,
    );
  }

  @AuthRoles('scrap_product_to_warehouse')
  @Put('scrap-product')
  @HttpCode(HttpStatus.OK)
  async scrapProduct(
    @Req() req: Request,
    @Query('warehouseId') warehouseId: string,
    @Query('productId') productId: string,
    @Body() dto: AddStockItems,
  ) {
    return this.warehousesService.scrapProduct(
      req,
      warehouseId,
      productId,
      dto,
    );
  }

  @AuthRoles('sale_product_to_warehouse')
  @Put('sale-product')
  @HttpCode(HttpStatus.OK)
  async saleProduct(
    @Req() req: Request,
    @Query('productId') productId: string,
    @Query('warehouseId') warehouseId: string,
    @Body() dto: SaleProductDto,
  ) {
    return this.warehousesService.saleProduct(req, dto, productId, warehouseId);
  }

  @AuthRoles('accept_product_to_warehouse')
  @Put('accept-product')
  @HttpCode(HttpStatus.OK)
  async acceptProduct(
    @Req() req: Request,
    @Query('stockMovementsId') stockMovementsId: string,
    @Query('warehouseId') warehouseId: string,
  ) {
    return this.warehousesService.acceptProduct(
      req,
      stockMovementsId,
      warehouseId,
    );
  }

  @AuthRoles('change_owner_warehouse')
  @Put('change-owher')
  @HttpCode(HttpStatus.OK)
  async changeOwnerWarehouse(
    @Req() req: Request,
    @Query('warehouseId') warehouseId: string,
    @Query('ownerUserId') ownerUserId: string,
  ) {
    return this.warehousesService.changeOwnerWarehouse(
      warehouseId,
      ownerUserId,
      req,
    );
  }
}
