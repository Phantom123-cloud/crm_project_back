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

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // @AuthRoles('create_languages')
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductsDto) {
    return this.productsService.create(dto);
  }

  // @AuthRoles('view_languages')

  @Get('all')
  @HttpCode(HttpStatus.OK)
  async all(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.productsService.all(page, limit);
  }

  @Get('select-all')
  @HttpCode(HttpStatus.OK)
  async allSelect() {
    return this.productsService.allSelect();
  }

  // @AuthRoles('update_languages')
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateProductsDto) {
    return this.productsService.update(id, dto);
  }

  // @AuthRoles('delete_languages')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
