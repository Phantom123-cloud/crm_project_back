import { Module } from '@nestjs/common';
import { PresentationsService } from './presentations.service';
import { PresentationsController } from './presentations.controller';
import { CreatePresentationUsecase } from './use-cases/create-presentation.usecase';
import { PresentationsBuilder } from './builders/presentations.builder';
import { UpdatePresentationUsecase } from './use-cases/update-presentation.usecase';

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
