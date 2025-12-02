import { Module } from '@nestjs/common';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { TripsRepository } from './trips.repository';
import { WarehousesModule } from 'src/warehouses/warehouses.module';

@Module({
  controllers: [TripsController],
  providers: [TripsService, TripsRepository],
  imports: [WarehousesModule]
})
export class TripsModule {}
