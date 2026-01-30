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
import { TripCompaniecUsecase } from './use-cases/trip-companies.usecase';
import { ArrayCompaniesDto } from './dto/array-companies.dto copy';
import { UpdateTeamCompositionsUsecase } from './use-cases/update-team-compositions.usecase';
import { UpdateTeamCompositionsDto } from './dto/update-team-compositions.dto';
import { RenameTripDto } from './dto/rename-trip.dto';

@Injectable()
export class TripsService {
  constructor(
    private readonly createTripUsecase: CreateTripUsecase,
    private readonly tripsBuilder: TripsBuilder,
    private readonly actionsTripUsecase: ActionsTripUsecase,
    private readonly teamCompositionsUsecase: TeamCompositionsUsecase,
    private readonly changeCoordinatorUsecase: ChangeCoordinatorUsecase,
    private readonly tripCompaniecUsecase: TripCompaniecUsecase,
    private readonly updateTeamCompositionsUsecase: UpdateTeamCompositionsUsecase,
  ) {}

  async create(dto: CreateTripDto, req: Request) {
    this.createTripUsecase.create(dto, req);
    return buildResponse('Выезд добавлен');
  }

  async allTrips(dto: PaginationTripsDto) {
    return this.tripsBuilder.allTrip(dto);
  }

  async isActiveTrip(id: string) {
    return this.actionsTripUsecase.isActiveTrip(id);
  }

  async renameTrip(tripId: string, dto: RenameTripDto) {
    return this.actionsTripUsecase.renameTrip(tripId, dto);
  }

  async tripById(id: string) {
    return this.tripsBuilder.tripById(id);
  }

  async createComposition(dto: TeamCompositionsDto, tripId: string) {
    return this.teamCompositionsUsecase.createComposition(dto, tripId);
  }
  async updateComposition(dto: UpdateTeamCompositionsDto, tripId: string) {
    return this.updateTeamCompositionsUsecase.updateTeamComposition(
      dto,
      tripId,
    );
  }
  async addCompanies(dto: ArrayCompaniesDto, tripId: string) {
    return this.tripCompaniecUsecase.addCompanies(dto, tripId);
  }
  async disconnectCompany(companyId: string, tripId: string) {
    return this.tripCompaniecUsecase.disconnectCompany(companyId, tripId);
  }

  async changeCoordinator(tripId: string, coordinatorId: string) {
    return this.changeCoordinatorUsecase.changeCoordinator(
      tripId,
      coordinatorId,
    );
  }
}
