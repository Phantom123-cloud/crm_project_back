import { Injectable } from '@nestjs/common';
import { CreatePresentationUsecase } from './use-cases/create-presentation.usecase';
import { Request } from 'express';
import { CreatePresentationDto } from './dto/create-presentation.dto';

@Injectable()
export class PresentationsService {
  constructor(
    private readonly createPresentationUsecase: CreatePresentationUsecase,
  ) {}

  async create(dto: CreatePresentationDto, tripId: string, req: Request) {
    return this.createPresentationUsecase.create(dto, tripId, req);
  }
}
