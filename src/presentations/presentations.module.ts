import { Module } from '@nestjs/common';
import { PresentationsService } from './presentations.service';
import { PresentationsController } from './presentations.controller';
import { CreatePresentationUsecase } from './use-cases/create-presentation.usecase';

@Module({
  controllers: [PresentationsController],
  providers: [PresentationsService, CreatePresentationUsecase],
})
export class PresentationsModule {}
