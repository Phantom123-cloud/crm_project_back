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
import { UpdatePresentationDto } from '../dto/update-presentation.dto copy';

@Injectable()
export class UpdatePresentationUsecase {
  constructor(private readonly prismaService: PrismaService) {}

  async update(
    dto: UpdatePresentationDto,
    tripId: string,
    presentationId: string,
    req: Request,
    presentationTypeId?: string,
  ) {
    const { id: creatorUserId } = req.user as JwtPayload;

    const {
      date,
      time,
      AUDITOR,
      PRESENTER,
      TRADERS,
      TRIP_MANAGER,
      CHIEF_ASSISTANT,
      TM_AND_CA,
      placeId,
    } = dto;

    await this.prismaService.$transaction(async (tx) => {
      const isExistTrip = await tx.trip.findUnique({
        where: { id: tripId },
      });

      if (!isExistTrip) {
        throw new ConflictException('Выезд не найден');
      }

      if (!isExistTrip.isActive) {
        throw new ConflictException('Выезд заблокирован, изменения запрещены');
      }

      const isExistPresentation = await tx.presentations.findUnique({
        where: { id: presentationId },

        select: {
          time: true,
          date: true,
          placeId: true,
          presentationTypeId: true,
          presentationTeams: true,
        },
      });

      if (!isExistPresentation) {
        throw new ConflictException('Презентация не найдена');
      }

      if (
        (date && isExistPresentation.date !== date) ||
        (time && isExistPresentation.time !== time)
      ) {
        const isExistPresNewData = await tx.presentations.findFirst({
          where: {
            date,
            time,
            placeId: placeId ? placeId : isExistPresentation.placeId,
            presentationTypeId: presentationTypeId
              ? presentationTypeId
              : isExistPresentation.presentationTypeId,
            tripId,
          },
        });

        if (isExistPresNewData) {
          throw new ConflictException(
            'Презентация с такими данными уже существует',
          );
        }
      }

      if (date) {
        const dateValidate = new Date(`${date} ${time}`);

        if (isNaN(dateValidate.getTime())) {
          throw new BadRequestException('Ошибка формата даты/время');
        }
      }

      const presIndex = time ? +time.split(':')[0] : undefined;

      if (presIndex && isNaN(presIndex)) {
        throw new ConflictException('Некорректный формат времени');
      }

      if (placeId) {
        const isExistPlace = await tx.places.findUnique({
          where: { id: placeId },
        });

        if (!isExistPlace) {
          throw new ConflictException('Локация не найдена');
        }
      }

      if (presentationTypeId) {
        const isExistPresentationType = await tx.presentationTypes.findUnique({
          where: {
            id: presentationTypeId,
          },
        });

        if (!isExistPresentationType) {
          throw new ConflictException('Тип презентации не найден');
        }
      }

      await tx.presentations.update({
        where: { id: presentationId },
        data: {
          ...(presIndex && {
            index:
              presIndex <= 12
                ? '01'
                : presIndex > 12 && presIndex <= 16
                  ? '02'
                  : '03',
          }),
          date,
          time,
          placeId,
          presentationTypeId,
          creatorUserId,
        },
      });

      const currentComposition = isExistPresentation.presentationTeams;

      if (PRESENTER) {
        const currentJobTitle = currentComposition.find(
          (c) => c.jobTitle === 'PRESENTER',
        );

        if (
          currentJobTitle &&
          currentJobTitle.participantsUserId !== PRESENTER
        ) {
          const isExistcoordinatorId = await tx.user.findUnique({
            where: {
              id: PRESENTER,
            },

            select: {
              employee: {
                select: {
                  coordinatorUserId: true,
                },
              },
            },
          });
          if (!isExistcoordinatorId) {
            throw new NotFoundException(
              'Сотрудник указанный вами как ведущий, на сервере не обнаружен',
            );
          }

          if (!isExistcoordinatorId.employee) {
            throw new ConflictException('Ошибка в аккаунте ведущего');
          }

          if (!isExistcoordinatorId.employee?.coordinatorUserId) {
            throw new ConflictException(
              'Что бы назначить сотрудника ведущим команды, его необходимо присвоить координатору',
            );
          }

          await tx.presentationTeam.update({
            where: {
              id: currentJobTitle.id,
            },
            data: {
              participantsUserId: PRESENTER,
            },
          });
        }
      }

      const currentAuditor = currentComposition.find(
        (c) => c.jobTitle === 'AUDITOR',
      );

      if (AUDITOR) {
        if (currentAuditor && currentAuditor.participantsUserId !== AUDITOR) {
          await tx.presentationTeam.update({
            where: {
              id: currentAuditor.id,
            },
            data: {
              participantsUserId: AUDITOR,
            },
          });
        } else if (!currentAuditor) {
          await tx.presentationTeam.create({
            data: {
              participantsUserId: AUDITOR,
              presentationId,
              jobTitle: 'AUDITOR',
            },
          });
        }
      }
      if (!AUDITOR && currentAuditor?.id) {
        await tx.presentationTeam.delete({
          where: {
            id: currentAuditor.id,
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

      const currentJobTitleTrManager = currentComposition.find(
        (c) => c.jobTitle === 'TRIP_MANAGER',
      );
      const currentCa = currentComposition.find(
        (c) => c.jobTitle === 'CHIEF_ASSISTANT',
      );
      const currentTmCa = currentComposition.find(
        (c) => c.jobTitle === 'TM_AND_CA',
      );

      if (
        currentJobTitleTrManager?.id &&
        currentTmCa?.id &&
        !CHIEF_ASSISTANT &&
        !TM_AND_CA
      ) {
        throw new ConflictException('Назначение ГА - обязательно');
      }

      if (currentCa?.id && currentTmCa?.id && !TRIP_MANAGER && !TM_AND_CA) {
        throw new ConflictException('Назначение МВ - обязательно');
      }

      if (TRIP_MANAGER) {
        if (
          currentJobTitleTrManager &&
          currentJobTitleTrManager.participantsUserId !== TRIP_MANAGER
        ) {
          await tx.presentationTeam.update({
            where: {
              id: currentJobTitleTrManager.id,
            },
            data: {
              participantsUserId: TRIP_MANAGER,
            },
          });
        } else if (!currentJobTitleTrManager) {
          await tx.presentationTeam.create({
            data: {
              participantsUserId: TRIP_MANAGER,
              presentationId,
              jobTitle: 'TRIP_MANAGER',
            },
          });
        }
      }

      if (!TRIP_MANAGER && currentJobTitleTrManager?.id) {
        await tx.presentationTeam.delete({
          where: {
            id: currentJobTitleTrManager.id,
          },
        });
      }
      if (CHIEF_ASSISTANT) {
        if (currentCa && currentCa.participantsUserId !== CHIEF_ASSISTANT) {
          await tx.presentationTeam.update({
            where: {
              id: currentCa.id,
            },
            data: {
              participantsUserId: CHIEF_ASSISTANT,
            },
          });
        } else if (!currentCa) {
          await tx.presentationTeam.create({
            data: {
              participantsUserId: CHIEF_ASSISTANT,
              presentationId,
              jobTitle: 'CHIEF_ASSISTANT',
            },
          });
        }
      }

      if (!CHIEF_ASSISTANT && currentCa?.id) {
        await tx.presentationTeam.delete({
          where: {
            id: currentCa.id,
          },
        });
      }
      if (TM_AND_CA) {
        if (currentTmCa && currentTmCa.participantsUserId !== TM_AND_CA) {
          await tx.presentationTeam.update({
            where: {
              id: currentTmCa.id,
            },
            data: {
              participantsUserId: TM_AND_CA,
            },
          });
        } else if (!currentTmCa) {
          await tx.presentationTeam.create({
            data: {
              participantsUserId: TM_AND_CA,
              presentationId,
              jobTitle: 'TM_AND_CA',
            },
          });
        }
      }

      if (!TM_AND_CA && currentTmCa?.id) {
        await tx.presentationTeam.delete({
          where: {
            id: currentTmCa.id,
          },
        });
      }
      const currentIds = currentComposition.reduce((acc, val) => {
        if (val.jobTitle === 'TRADERS') {
          acc.push(val.id);
        }
        return acc;
      }, [] as string[]);

      if (currentIds?.length && !TRADERS?.length) {
        await tx.presentationTeam.deleteMany({
          where: {
            id: {
              in: currentIds,
            },
          },
        });
      }

      if (TRADERS?.length) {
        const disconnect = currentIds.filter(
          (item) => !TRADERS.some((n) => n === item),
        );

        const connect = TRADERS.filter(
          (item) => !currentIds.some((n) => n === item),
        );

        if (disconnect?.length) {
          await tx.presentationTeam.deleteMany({
            where: {
              id: {
                in: disconnect,
              },
            },
          });
        }
        if (connect?.length) {
          await tx.presentationTeam.createMany({
            data: connect.map((participantsUserId) => ({
              participantsUserId,
              jobTitle: 'TRADERS',
              presentationId,
            })),
          });
        }
      }

      return;
    });

    return buildResponse('Презентация добавлена');
  }
}
