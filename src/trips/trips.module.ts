import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { TripsRepository } from './trips.repository';
import { WarehousesModule } from 'src/warehouses/warehouses.module';
import { CreateTripUsecase } from './use-cases/create-trip.usecase';
import { TripsBuilder } from './builders/trips.builder';
import { ActionsTripUsecase } from './use-cases/actions-trip.usecase';
import { TeamCompositionsUsecase } from './use-cases/team-compositions.usecase';
import { ChangeCoordinatorUsecase } from './use-cases/change-coordinator.usecase';
import { TripCompaniecUsecase } from './use-cases/trip-companies.usecase';

@Module({
  controllers: [TripsController],
  providers: [
    TripsService,
    TripsRepository,
    CreateTripUsecase,
    TripsBuilder,
    ActionsTripUsecase,
    TeamCompositionsUsecase,
    ChangeCoordinatorUsecase,
    TripCompaniecUsecase,
  ],
  imports: [WarehousesModule],
})
export class TripsModule {}
