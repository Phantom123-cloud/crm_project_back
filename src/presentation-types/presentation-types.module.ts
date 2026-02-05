import { Module } from '@nestjs/common';
import { PresentationTypesController } from './presentation-types.controller';
import { PresentationTypesService } from './presentation-types.service';

@Module({
  controllers: [PresentationTypesController],
  providers: [PresentationTypesService],
})
export class PresentationTypesModule {}
