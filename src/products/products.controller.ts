import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductsDto } from './dto/create-products.dto';
import { UpdateProductsDto } from './dto/update-products.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // @AuthRoles('create_languages')
  @Post('create')
  async create(@Body() dto: CreateProductsDto) {
    return await this.productsService.create(dto);
  }

  // @AuthRoles('view_languages')
  @Get('all')
  async all() {
    return await this.productsService.all();
  }

  // @AuthRoles('update_languages')
  @Put('update/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductsDto) {
    return await this.productsService.update(id, dto);
  }

  // @AuthRoles('delete_languages')
  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return await this.productsService.delete(id);
  }
}
