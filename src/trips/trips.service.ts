import { Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { CreateTripUsecase } from './use-cases/create-trip.usecase';
import { TripsBuilder } from './builders/trips.builder';
import { PaginationDto } from 'src/users/dto/pagination.dto';
import { ActionsTripUsecase } from './use-cases/actions-trip.usecase';

@Injectable()
export class TripsService {
  constructor(
    private readonly createTripUsecase: CreateTripUsecase,
    private readonly tripsBuilder: TripsBuilder,
    private readonly actionsTripUsecase: ActionsTripUsecase,
  ) {}

  async create(dto: CreateTripDto, tripTypesId: string, ownerUserId: string) {
    return this.createTripUsecase.create(dto, tripTypesId, ownerUserId);
  }

  async allTrips(dto: PaginationDto) {
    return this.tripsBuilder.allTrip(dto);
  }

  async isActiveTrip(id: string) {
    return this.actionsTripUsecase.isActiveTrip(id);
  }
}
