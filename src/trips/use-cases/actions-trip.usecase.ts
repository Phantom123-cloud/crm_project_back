import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { RenameTripDto } from '../dto/rename-trip.dto';
import dayjs from 'dayjs';

@Injectable()
export class ActionsTripUsecase {
  constructor(private readonly prismaService: PrismaService) {}

  async isActiveTrip(id: string) {
    const isExist = await this.prismaService.trip.findUnique({
      where: { id },
    });

    if (!isExist) {
      throw new NotFoundException('Переданный выезд не найден');
    }

    await this.prismaService.trip.update({
      where: { id },

      data: {
        isActive: !isExist.isActive,

        ...(isExist.warehouseId && {
          warehouses: {
            update: {
              isActive: !isExist.isActive,
            },
          },
        }),
      },
    });

    return buildResponse(
      `Выезд ${isExist.isActive ? 'заблокирован' : 'разблокирован'}`,
    );
  }

  async renameTrip(tripId: string, dto: RenameTripDto) {
    const isExist = await this.prismaService.trip.findUnique({
      where: { id: tripId },

      select: {
        presentations: {
          select: {
            date: true,
          },
        },

        dateFrom: true,
        dateTo: true,
        name: true,
      },
    });

    if (!isExist) {
      throw new NotFoundException('Переданный выезд не найден');
    }

    const {
      dateFrom: dateFromCurrent,
      dateTo: dateToCurrent,
      name: nameCurrent,
    } = isExist;

    const { dateFrom, dateTo, name } = dto;

    if (dateFrom) {
      const dateFromNew = new Date(dateFrom);
      const dateFromCurrent = new Date(isExist.dateFrom);

      if (
        dateFromNew > dateFromCurrent &&
        isExist.presentations.some((pr) => new Date(pr.date) < dateFromNew)
      ) {
        throw new ConflictException(
          'Вы не можете изменить диапазон выезда, ранее были добавлены презентации на даты которые вы пытаетесь удалить',
        );
      }
    }

    if (dateTo) {
      const dateToNew = new Date(dateTo);
      const dateToCurrent = new Date(isExist.dateTo);

      if (
        dateToNew < dateToCurrent &&
        isExist.presentations.some((pr) => new Date(pr.date) > dateToNew)
      ) {
        throw new ConflictException(
          'Вы не можете изменить диапазон выезда, ранее были добавлены презентации на даты которые вы пытаетесь удалить',
        );
      }
    }

    if (!dateFrom && !dateTo && !name) {
      throw new ConflictException('Что бы внести изменения заполните форму');
    }

    const dFrom = new Date(dateFrom ? dateFrom : dateFromCurrent);
    const dTo = new Date(dateTo ? dateTo : dateToCurrent);

    if (isNaN(dFrom.getTime()) || isNaN(dTo.getTime())) {
      throw new BadRequestException('Ошибка формата дат');
    }

    if (dTo < dFrom) {
      throw new ConflictException(
        'Дата начала выезда не может быть больше даты окончания выезда',
      );
    }

    const isExistTrip = await this.prismaService.trip.findFirst({
      where: {
        name: name ? name : nameCurrent,
        dateFrom: dateFrom ? dateFrom : dateFromCurrent,
        dateTo: dateTo ? dateTo : dateToCurrent,
      },
    });

    if (isExistTrip) {
      throw new ConflictException(
        'Выезд с таким названием и датами (от-до) уже был добавлен',
      );
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.trip.update({
        where: {
          id: tripId,
        },
        data: {
          name,
          dateFrom,
          dateTo,

          warehouses: {
            update: {
              name: `${name ? name : nameCurrent}${dayjs(dateFrom ? dateFrom : dateFromCurrent).format('DDMMYY')}`,
            },
          },
        },
      });

      return;
    });

    return buildResponse('Выезд переименован');
  }
}
