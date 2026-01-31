import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { CreatePresentationDto } from '../dto/create-presentation.dto';

@Injectable()
export class CreatePresentationUsecase {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    dto: CreatePresentationDto,
    tripId: string,
    placeId: string,
    req: Request,
  ) {
    const { id: creatorUserId } = req.user as JwtPayload;

    const { date, time, teams } = dto;
    const {
      AUDITOR,
      PRESENTER,
      TRADERS,
      TRIP_MANAGER,
      CHIEF_ASSISTANT,
      TM_AND_CA,
    } = teams;

    const dateValidate = new Date(`${date} ${time}`);

    if (isNaN(dateValidate.getTime())) {
      throw new BadRequestException('Ошибка формата даты/время');
    }

    const isExistTrip = await this.prismaService.trip.findUnique({
      where: { id: tripId },

      select: {
        baseTeamParticipants: true,
        dateFrom: true,
        dateTo: true,
        name: true,
      },
    });

    if (!isExistTrip) {
      throw new ConflictException('Выезд не найден');
    }

    const isExistPlace = await this.prismaService.places.findUnique({
      where: { id: placeId },
    });

    if (!isExistPlace) {
      throw new ConflictException('Локация не найдена');
    }

    await this.prismaService.$transaction(async (tx) => {
      const presentation = await tx.presentations.create({
        data: { date, time, tripId, placeId, creatorUserId },
      });

      await tx.presentationTeam.create({
        data: {
          presentationId: presentation.id,
          jobTitle: 'PRESENTER',
          participantsUserId: PRESENTER,
        },
      });

      const COORDINATOR = isExistTrip.baseTeamParticipants.find(
        (b) => b.jobTitle === 'COORDINATOR',
      )?.id;

      if (!COORDINATOR) {
        throw new ConflictException('В выезде отсутствует координатор');
      }

      await tx.presentationTeam.create({
        data: {
          presentationId: presentation.id,
          jobTitle: 'COORDINATOR',
          participantsUserId: COORDINATOR,
        },
      });

      if (AUDITOR) {
        const isExistAuditor = await tx.user.findUnique({
          where: {
            id: AUDITOR,
          },
        });

        if (!isExistAuditor) {
          throw new NotFoundException(
            'Сотрудник указанный вами как аудитор, на сервере не обнаружен',
          );
        }

        await tx.presentationTeam.create({
          data: {
            presentationId: presentation.id,
            jobTitle: 'AUDITOR',
            participantsUserId: AUDITOR,
          },
        });
      }
      if (!CHIEF_ASSISTANT && !TM_AND_CA) {
        throw new ConflictException('Назначение ГА - обязательно');
      }

      if (!TRIP_MANAGER && !TM_AND_CA) {
        throw new ConflictException('Назначение МВ - обязательно');
      }

      if (TRIP_MANAGER && CHIEF_ASSISTANT && TM_AND_CA) {
        throw new ConflictException(
          'При наличии назначеных ролей в команде ГА и МВ, совмещённую роль МВ/ГА назначать не нужно',
        );
      }
      if (TRIP_MANAGER) {
        const isExistManager = await tx.user.findUnique({
          where: {
            id: TRIP_MANAGER,
          },
        });

        if (!isExistManager) {
          throw new NotFoundException(
            'Сотрудник указанный вами как МВ, на сервере не обнаружен',
          );
        }

        await tx.presentationTeam.create({
          data: {
            presentationId: presentation.id,
            jobTitle: 'TRIP_MANAGER',
            participantsUserId: TRIP_MANAGER,
          },
        });
      }
      if (CHIEF_ASSISTANT) {
        const isExistAssistant = await tx.user.findUnique({
          where: {
            id: CHIEF_ASSISTANT,
          },
        });

        if (!isExistAssistant) {
          throw new NotFoundException(
            'Сотрудник указанный вами как ГА, на сервере не обнаружен',
          );
        }

        await tx.presentationTeam.create({
          data: {
            presentationId: presentation.id,
            jobTitle: 'CHIEF_ASSISTANT',
            participantsUserId: CHIEF_ASSISTANT,
          },
        });
      }
      if (TM_AND_CA) {
        const isExistManagerAssist = await tx.user.findUnique({
          where: {
            id: TM_AND_CA,
          },
        });

        if (!isExistManagerAssist) {
          throw new NotFoundException(
            'Сотрудник указанный вами как МВ/ГА, на сервере не обнаружен',
          );
        }

        await tx.presentationTeam.create({
          data: {
            presentationId: presentation.id,
            jobTitle: 'TM_AND_CA',
            participantsUserId: TM_AND_CA,
          },
        });
      }
      if (TRADERS?.length) {
        const isExistTraders = await tx.user.findMany({
          where: {
            id: {
              in: TRADERS,
            },
          },
        });

        if (isExistTraders.length !== TRADERS.length) {
          throw new NotFoundException(
            'Некоторые из торговых не были найдены на сервере',
          );
        }

        await tx.presentationTeam.createMany({
          data: TRADERS.map((id) => ({
            presentationId: presentation.id,
            jobTitle: 'TRADERS',
            participantsUserId: id,
          })),
        });
      }

      return;
    });

    return buildResponse('Выезд добавлен');
  }
}
