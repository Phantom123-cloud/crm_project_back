import { Injectable } from '@nestjs/common';
import { CreatePresentationUsecase } from './use-cases/create-presentation.usecase';
import { Request } from 'express';
import { CreatePresentationDto } from './dto/create-presentation.dto';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';
import { PresentationsBuilder } from './builders/presentations.builder';

@Injectable()
export class PresentationsService {
  constructor(
    private readonly createPresentationUsecase: CreatePresentationUsecase,
    private readonly presentationsBuilder: PresentationsBuilder,
  ) {}

  async create(dto: CreatePresentationDto, tripId: string, req: Request) {
    return this.createPresentationUsecase.create(dto, tripId, req);
  }

  async allPresentations(dto: PaginationBasic, tripId: string) {
    return this.presentationsBuilder.allPresentations(dto, tripId);
  }
}
