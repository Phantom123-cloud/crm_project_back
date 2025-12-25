import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductsDto } from './dto/create-products.dto';
import { UpdateProductsDto } from './dto/update-products.dto';
import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @AuthRoles('create_products')
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductsDto) {
    return this.productsService.create(dto);
  }

  @AuthRoles('view_products')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async all(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.productsService.all(page, limit);
  }

  @AuthRoles('stock_movements')
  @Get('select-all')
  @HttpCode(HttpStatus.OK)
  async allSelect() {
    return this.productsService.allSelect();
  }

  @AuthRoles('update_products')
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateProductsDto) {
    return this.productsService.update(id, dto);
  }

  @AuthRoles('delete_products')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
