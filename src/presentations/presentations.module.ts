import { Module } from '@nestjs/common';
import { PresentationsService } from './presentations.service';
import { CreatePresentationUsecase } from './use-cases/create-presentation.usecase';
import { PresentationsBuilder } from './builders/presentations.builder';
import { UpdatePresentationUsecase } from './use-cases/update-presentation.usecase';
import { PresentationsController } from './presentations.controller';
import { ChangeCoordinatorUsecase } from './use-cases/change-coordinator.usecase';

@Module({
  controllers: [PresentationsController],
  providers: [
    PresentationsService,
    CreatePresentationUsecase,
    PresentationsBuilder,
    UpdatePresentationUsecase,
    ChangeCoordinatorUsecase,
  ],
})
export class PresentationsModule {}
