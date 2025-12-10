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
import { TripTypesService } from './trip-types.service';
import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';
import { CreateTripTypesDto } from './dto/create-trip-types.dto';
import { UpdateTripTypesDto } from './dto/update-trip-types.dto';

@Controller('trip-types')
export class TripTypesController {
  constructor(private readonly tripTypesService: TripTypesService) {}

  // @AuthRoles('create_languages')
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTripTypesDto) {
    return this.tripTypesService.create(dto);
  }

  // @AuthRoles('view_languages')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async all(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.tripTypesService.all(page, limit);
  }

  @Get('select-all')
  @HttpCode(HttpStatus.OK)
  async allSelect() {
    return this.tripTypesService.allSelect();
  }

  // @AuthRoles('update_languages')
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateTripTypesDto) {
    return this.tripTypesService.update(id, dto);
  }

  // @AuthRoles('delete_languages')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.tripTypesService.delete(id);
  }
}
