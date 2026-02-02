import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { TeamCompositionsDto } from '../dto/team-compositions.dto';
import { WarehousesMutationUseCase } from 'src/warehouses/use-cases/warehouses-mutation.usecase';
import dayjs from 'dayjs';

@Injectable()
export class TeamCompositionsUsecase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly warehousesMutationUseCase: WarehousesMutationUseCase,
  ) {}

  async createComposition(dto: TeamCompositionsDto, tripId: string) {
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

    if (isExistTrip.baseTeamParticipants.length) {
      throw new ConflictException('Шаблон для состава уже добавлен');
    }

    if (!PRESENTER) {
      throw new ConflictException(
        'Ведущий - обязательный сотрудник состава команды',
      );
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.baseTeamParticipants.create({
        data: {
          tripId,
          jobTitle: 'PRESENTER',
          participantsUserId: PRESENTER,
        },
      });

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

      const COORDINATOR = isExistcoordinatorId.employee.coordinatorUserId;

      await tx.baseTeamParticipants.create({
        data: {
          tripId,
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

        await tx.baseTeamParticipants.create({
          data: {
            tripId,
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

        await tx.baseTeamParticipants.create({
          data: {
            tripId,
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

        await tx.baseTeamParticipants.create({
          data: {
            tripId,
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

        await tx.baseTeamParticipants.create({
          data: {
            tripId,
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

        await tx.baseTeamParticipants.createMany({
          data: TRADERS.map((id) => ({
            tripId,
            jobTitle: 'TRADERS',
            participantsUserId: id,
          })),
        });
      }

      const ownerUserId = TRIP_MANAGER ? TRIP_MANAGER : (TM_AND_CA as string);

      const warehouseId = await this.warehousesMutationUseCase.create(
        {
          name: `${isExistTrip.name} [${dayjs(isExistTrip.dateFrom).format('DD.MM.YYYY')}-${dayjs(isExistTrip.dateTo).format('DD.MM.YYYY')}]`,
          type: 'TRIP',
        },
        ownerUserId,
      );

      await tx.trip.update({
        where: {
          id: tripId,
        },

        data: {
          warehouseId,
        },
      });

      return;
    });

    return buildResponse('Состав добавлен');
  }
}
