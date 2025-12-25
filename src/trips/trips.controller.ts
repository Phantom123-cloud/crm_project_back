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
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}
  @AuthRoles('create_trips')
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateTripDto,
    @Query('tripTypesId') tripTypesId: string,
    @Query('ownerUserId') ownerUserId: string,
  ) {
    return this.tripsService.create(dto, tripTypesId, ownerUserId);
  }

  @AuthRoles('view_trips')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async allTrips(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('isActive', new ParseBoolPipe({ optional: true }))
    isActive?: boolean,
  ) {
    return this.tripsService.allTrips({
      page,
      limit,
      isActive,
    });
  }

  @AuthRoles('change_trip_status')
  @Put('is-active/:id')
  @HttpCode(HttpStatus.OK)
  async isActiveTrip(@Param('id') id: string) {
    return this.tripsService.isActiveTrip(id);
  }
}
