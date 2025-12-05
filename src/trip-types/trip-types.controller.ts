import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
  async create(@Body() dto: CreateTripTypesDto) {
    return this.tripTypesService.create(dto);
  }

  // @AuthRoles('view_languages')
  @Get('all')
  async all() {
    return this.tripTypesService.all();
  }

  // @AuthRoles('update_languages')
  @Put('update/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateTripTypesDto) {
    return this.tripTypesService.update(id, dto);
  }

  // @AuthRoles('delete_languages')
  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return this.tripTypesService.delete(id);
  }
}
