import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePresentationUsecase } from './use-cases/create-presentation.usecase';
import { Request } from 'express';
import { CreatePresentationDto } from './dto/create-presentation.dto';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';
import { PresentationsBuilder } from './builders/presentations.builder';
import { UpdatePresentationUsecase } from './use-cases/update-presentation.usecase';
import { UpdatePresentationDto } from './dto/update-presentation.dto copy';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';

@Injectable()
export class PresentationsService {
  constructor(
    private readonly createPresentationUsecase: CreatePresentationUsecase,
    private readonly presentationsBuilder: PresentationsBuilder,
    private readonly updatePresentationUsecase: UpdatePresentationUsecase,
    private readonly prismaService: PrismaService,
  ) {}

  async create(
    dto: CreatePresentationDto,
    tripId: string,
    presentationTypeId: string,
    req: Request,
  ) {
    return this.createPresentationUsecase.create(
      dto,
      tripId,
      presentationTypeId,
      req,
    );
  }

  async update(
    dto: UpdatePresentationDto,
    tripId: string,
    presentationId: string,
    req: Request,
    presentationTypeId?: string,
  ) {
    return this.updatePresentationUsecase.update(
      dto,
      tripId,
      presentationId,
      req,
      presentationTypeId,
    );
  }

  async allPresentations(dto: PaginationBasic, tripId: string) {
    return this.presentationsBuilder.allPresentations(dto, tripId);
  }
  async presentationById(presentationId: string) {
    return this.presentationsBuilder.presentationById(presentationId);
  }

  async delete(presentationId: string) {
    const presentation = await this.prismaService.presentations.findUnique({
      where: {
        id: presentationId,
      },
    });

    if (!presentation) {
      throw new NotFoundException('Презентация не найдена');
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.presentationTeam.deleteMany({
        where: {
          presentationId,
        },
      });

      await tx.presentations.delete({
        where: { id: presentationId },
      });
    });

    return buildResponse('Презентация удалена');
  }
}
