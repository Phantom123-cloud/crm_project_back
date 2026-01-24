import { Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { CreateTripUsecase } from './use-cases/create-trip.usecase';
import { TripsBuilder } from './builders/trips.builder';
import { ActionsTripUsecase } from './use-cases/actions-trip.usecase';
import { PaginationTripsDto } from './dto/pagination-trips.dto';
import { buildResponse } from 'src/utils/build-response';
import { Request } from 'express';
import { TeamCompositionsDto } from './dto/team-compositions.dto';
import { TeamCompositionsUsecase } from './use-cases/team-compositions.usecase';
import { ChangeCoordinatorUsecase } from './use-cases/change-coordinator.usecase';

@Injectable()
export class TripsService {
  constructor(
    private readonly createTripUsecase: CreateTripUsecase,
    private readonly tripsBuilder: TripsBuilder,
    private readonly actionsTripUsecase: ActionsTripUsecase,
    private readonly teamCompositionsUsecase: TeamCompositionsUsecase,
    private readonly changeCoordinatorUsecase: ChangeCoordinatorUsecase,
  ) {}

  async create(dto: CreateTripDto, req: Request) {
    this.createTripUsecase.create(dto, req);
    return buildResponse('Склад добавлен');
  }

  async allTrips(dto: PaginationTripsDto) {
    return this.tripsBuilder.allTrip(dto);
  }

  async isActiveTrip(id: string) {
    return this.actionsTripUsecase.isActiveTrip(id);
  }

  async tripById(id: string) {
    return this.tripsBuilder.tripById(id);
  }

  async createComposition(dto: TeamCompositionsDto, tripId: string) {
    return this.teamCompositionsUsecase.createComposition(dto, tripId);
  }

  async changeCoordinator(tripId: string, coordinatorId: string) {
    return this.changeCoordinatorUsecase.changeCoordinator(
      tripId,
      coordinatorId,
    );
  }
}
