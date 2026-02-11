import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { CreateTripDto } from '../dto/create-trip.dto';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

// enum TeamComposition {
//   COORDINATOR
//   AUDITOR
//   PRESENTER
//   TRADER
//   TRIP_MANAGER
//   CHIEF_ASSISTANT
//   TM_AND_CA
// }

@Injectable()
export class CreateTripUsecase {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateTripDto, req: Request) {
    const { id: creatorUserId } = req.user as JwtPayload;

    const isExistMainWarehouse = await this.prismaService.warehouses.findFirst({
      where: {
        type: 'CENTRAL',
      },
    });

    if (!isExistMainWarehouse) {
      throw new NotFoundException(
        'Что бы начать работу, создайте центральный склад',
      );
    }

    const { dateFrom, dateTo, name } = dto;

    const dFrom = new Date(dateFrom);
    const dTo = new Date(dateTo);

    if (isNaN(dFrom.getTime()) || isNaN(dTo.getTime())) {
      throw new BadRequestException('Ошибка формата дат');
    }

    if (dTo < dFrom) {
      throw new ConflictException(
        'Дата начала выезда не может быть больше даты окончания выезда',
      );
    }

    const isExistTrip = await this.prismaService.trip.findFirst({
      where: { name, dateFrom, dateTo },
    });

    if (isExistTrip) {
      throw new ConflictException('Выезд с таким названием уже существует');
    }

    await this.prismaService.trip.create({
      data: {
        name,
        dateFrom,
        dateTo,
        creatorUserId,
      },
    });

    return buildResponse('Выезд добавлен');
  }
}
