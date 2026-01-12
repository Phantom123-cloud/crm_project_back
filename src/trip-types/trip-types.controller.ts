import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TripTypesService } from './trip-types.service';
import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';
import { CreateTripTypesDto } from './dto/create-trip-types.dto';
import { UpdateTripTypesDto } from './dto/update-trip-types.dto';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';

@Controller('trip-types')
export class TripTypesController {
  constructor(private readonly tripTypesService: TripTypesService) {}

  @AuthRoles('create_trip_types')
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTripTypesDto) {
    return this.tripTypesService.create(dto);
  }

  @AuthRoles('view_trip_types')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async all(@Query() dto: PaginationBasic) {
    return this.tripTypesService.all(dto);
  }

  // для создания выезда
  @AuthRoles('create_trips')
  @Get('select-all')
  @HttpCode(HttpStatus.OK)
  async allSelect() {
    return this.tripTypesService.allSelect();
  }

  @AuthRoles('update_trip_types')
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateTripTypesDto) {
    return this.tripTypesService.update(id, dto);
  }

  @AuthRoles('delete_trip_types')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.tripTypesService.delete(id);
  }
}
