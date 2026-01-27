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
import { TeamCompositionsDto } from './dto/team-compositions.dto';
import { ArrayCompaniesDto } from './dto/array-companies.dto copy';
import { UpdateTeamCompositionsDto } from './dto/update-team-compositions.dto';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}
  @AuthRoles('create_trips')
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTripDto, @Req() req: Request) {
    return this.tripsService.create(dto, req);
  }

  @AuthRoles('view_trips')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async allTrips(@Query() dto: PaginationTripsDto) {
    return this.tripsService.allTrips(dto);
  }

  // @AuthRoles('view_trips')
  @Get('by/:id')
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

  @Put('connect-companies')
  @HttpCode(HttpStatus.OK)
  async addCompanies(
    @Body() dto: ArrayCompaniesDto,
    @Query('tripId') tripId: string,
  ) {
    return this.tripsService.addCompanies(dto, tripId);
  }

  @Put('disconnect-company')
  @HttpCode(HttpStatus.OK)
  async disconnectCompany(
    @Query('companyId') companyId: string,
    @Query('tripId') tripId: string,
  ) {
    return this.tripsService.disconnectCompany(companyId, tripId);
  }

  // tripId: string, coordinatorId: string
  @Put('change-coordinator')
  @HttpCode(HttpStatus.OK)
  async changeCoordinator(
    @Query('tripId') tripId: string,
    @Query('coordinatorId') coordinatorId: string,
  ) {
    return this.tripsService.changeCoordinator(tripId, coordinatorId);
  }

  @Post('create-team-composition')
  @HttpCode(HttpStatus.CREATED)
  async createComposition(
    @Body() dto: TeamCompositionsDto,
    @Query('tripId') tripId: string,
  ) {
    return this.tripsService.createComposition(dto, tripId);
  }

  @Put('update-team-composition')
  @HttpCode(HttpStatus.CREATED)
  async updateComposition(
    @Body() dto: UpdateTeamCompositionsDto,
    @Query('tripId') tripId: string,
  ) {
    return this.tripsService.updateComposition(dto, tripId);
  }
}
