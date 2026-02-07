import { Module } from '@nestjs/common';
import { PresentationsService } from './presentations.service';
import { CreatePresentationUsecase } from './use-cases/create-presentation.usecase';
import { PresentationsBuilder } from './builders/presentations.builder';
import { UpdatePresentationUsecase } from './use-cases/update-presentation.usecase';
import { PresentationsController } from './presentations.controller';

@Module({
  controllers: [PresentationsController],
  providers: [
    PresentationsService,
    CreatePresentationUsecase,
    PresentationsBuilder,
    UpdatePresentationUsecase,
  ],
})
export class PresentationsModule {}
