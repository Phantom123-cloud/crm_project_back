import { Module } from '@nestjs/common';
import { TripTypesService } from './trip-types.service';
import { TripTypesController } from './trip-types.controller';

@Module({
  controllers: [TripTypesController],
  providers: [TripTypesService],
})
export class TripTypesModule {}
