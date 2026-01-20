import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';
import { PaginationTripsDto } from './dto/pagination-trips.dto';
import type { Request } from 'express';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}
  @AuthRoles('create_trips')
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateTripDto,
    @Query('tripTypesId') tripTypesId: string,
    @Req() req: Request,
  ) {
    return this.tripsService.create(dto, tripTypesId, req);
  }

  @AuthRoles('view_trips')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async allTrips(@Query() dto: PaginationTripsDto) {
    return this.tripsService.allTrips(dto);
  }

  // @AuthRoles('view_trips')
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async tripsBuilder(@Param('id') id: string) {
    return this.tripsService.tripById(id);
  }

  @AuthRoles('change_trip_status')
  @Put('is-active/:id')
  @HttpCode(HttpStatus.OK)
  async isActiveTrip(@Param('id') id: string) {
    return this.tripsService.isActiveTrip(id);
  }
}
