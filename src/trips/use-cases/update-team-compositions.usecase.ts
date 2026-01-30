import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { UpdateTeamCompositionsDto } from '../dto/update-team-compositions.dto';

@Injectable()
export class UpdateTeamCompositionsUsecase {
  constructor(private readonly prismaService: PrismaService) {}

  async updateTeamComposition(dto: UpdateTeamCompositionsDto, tripId: string) {
    const {
      AUDITOR,
      PRESENTER,
      TRADERS,
      TRIP_MANAGER,
      CHIEF_ASSISTANT,
      TM_AND_CA,
    } = dto;

    const isExistTrip = await this.prismaService.trip.findUnique({
      where: {
        id: tripId,
      },

      select: {
        baseTeamParticipants: true,
        dateFrom: true,
        dateTo: true,
        name: true,
      },
    });

    if (!isExistTrip) {
      throw new NotFoundException('Выезд не найден');
    }

    const currentComposition = isExistTrip.baseTeamParticipants;

    await this.prismaService.$transaction(async (tx) => {
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

          await tx.baseTeamParticipants.update({
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
          await tx.baseTeamParticipants.update({
            where: {
              id: currentAuditor.id,
            },
            data: {
              participantsUserId: AUDITOR,
            },
          });
        } else if (!currentAuditor) {
          await tx.baseTeamParticipants.create({
            data: {
              participantsUserId: AUDITOR,
              tripId,
              jobTitle: 'AUDITOR',
            },
          });
        }
      }
      if (!AUDITOR && currentAuditor?.id) {
        await tx.baseTeamParticipants.delete({
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
          await tx.baseTeamParticipants.update({
            where: {
              id: currentJobTitleTrManager.id,
            },
            data: {
              participantsUserId: TRIP_MANAGER,
            },
          });
        } else if (!currentJobTitleTrManager) {
          await tx.baseTeamParticipants.create({
            data: {
              participantsUserId: TRIP_MANAGER,
              tripId,
              jobTitle: 'TRIP_MANAGER',
            },
          });
        }
      }

      if (!TRIP_MANAGER && currentJobTitleTrManager?.id) {
        await tx.baseTeamParticipants.delete({
          where: {
            id: currentJobTitleTrManager.id,
          },
        });
      }
      if (CHIEF_ASSISTANT) {
        if (currentCa && currentCa.participantsUserId !== CHIEF_ASSISTANT) {
          await tx.baseTeamParticipants.update({
            where: {
              id: currentCa.id,
            },
            data: {
              participantsUserId: CHIEF_ASSISTANT,
            },
          });
        } else if (!currentCa) {
          await tx.baseTeamParticipants.create({
            data: {
              participantsUserId: CHIEF_ASSISTANT,
              tripId,
              jobTitle: 'CHIEF_ASSISTANT',
            },
          });
        }
      }

      if (!CHIEF_ASSISTANT && currentCa?.id) {
        await tx.baseTeamParticipants.delete({
          where: {
            id: currentCa.id,
          },
        });
      }
      if (TM_AND_CA) {
        if (currentTmCa && currentTmCa.participantsUserId !== TM_AND_CA) {
          await tx.baseTeamParticipants.update({
            where: {
              id: currentTmCa.id,
            },
            data: {
              participantsUserId: TM_AND_CA,
            },
          });
        } else if (!currentTmCa) {
          await tx.baseTeamParticipants.create({
            data: {
              participantsUserId: TM_AND_CA,
              tripId,
              jobTitle: 'TM_AND_CA',
            },
          });
        }
      }

      if (!TM_AND_CA && currentTmCa?.id) {
        await tx.baseTeamParticipants.delete({
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
        await tx.baseTeamParticipants.deleteMany({
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
          await tx.baseTeamParticipants.deleteMany({
            where: {
              id: {
                in: disconnect,
              },
            },
          });
        }
        if (connect?.length) {
          console.log(connect);

          await tx.baseTeamParticipants.createMany({
            data: connect.map((participantsUserId) => ({
              participantsUserId,
              tripId,
              jobTitle: 'TRADERS',
            })),
          });
        }
      }

      return;
    });

    return buildResponse('Состав обновлён');
  }
}
