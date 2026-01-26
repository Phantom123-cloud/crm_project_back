import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { PlacesService } from './places.service';
// import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';

@Controller('places')
export class PlacesController {
  constructor(private readonly plasesService: PlacesService) {}

  // @AuthRoles('create_cities')
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePlaceDto) {
    return this.plasesService.create(dto);
  }

  // @AuthRoles('view_cities')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async all(@Query() dto: PaginationBasic) {
    return this.plasesService.all(dto);
  }

  // @AuthRoles('update_employee')
  @Get('select-all')
  @HttpCode(HttpStatus.OK)
  async allSelect() {
    return this.plasesService.allSelect();
  }

  // @AuthRoles('update_cities')
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdatePlaceDto) {
    return this.plasesService.update(id, dto);
  }

  // @AuthRoles('delete_cities')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.plasesService.delete(id);
  }
}
