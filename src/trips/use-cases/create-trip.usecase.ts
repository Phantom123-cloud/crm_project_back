import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { WarehousesMutationUseCase } from 'src/warehouses/use-cases/warehouses-mutation.usecase';
import { CreateTripDto } from '../dto/create-trip.dto';

@Injectable()
export class CreateTripUsecase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly warehousesMutationUseCase: WarehousesMutationUseCase,
  ) {}

  async create(dto: CreateTripDto, tripTypesId: string, ownerUserId: string) {
    const { dateFrom, dateTo } = dto;

    const dFrom = new Date(dateFrom);
    const dTo = new Date(dateTo);

    if (isNaN(dFrom.getTime()) || isNaN(dTo.getTime())) {
      throw new BadRequestException('Ошибка формата дат');
    }

    const isExistType = await this.prismaService.tripTypes.findUnique({
      where: {
        id: tripTypesId,
      },
    });

    if (!isExistType) {
      throw new ConflictException('Тип выезда переданный вами не существует');
    }

    if (dTo < dFrom) {
      throw new ConflictException(
        'Дата начала выезда не может быть больше даты окончания выезда',
      );
    }

    const name = `${dFrom.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })} - ${dTo.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })} ${isExistType.name}`;

    const [isExistTrip, isExistWarehouse] =
      await this.prismaService.$transaction([
        this.prismaService.trip.findFirst({
          where: { name },
        }),

        this.prismaService.warehouses.findFirst({
          where: { name },
        }),
      ]);

    if (isExistTrip || isExistWarehouse) {
      throw new ConflictException(
        `${isExistTrip ? 'Выезд' : isExistWarehouse && 'Склад'} с таким названием уже существует`,
      );
    }

    const isExistOwner = await this.prismaService.user.findUnique({
      where: {
        id: ownerUserId,
      },
    });

    if (!isExistOwner) {
      throw new ConflictException('Пользователь не существует');
    }

    await this.prismaService.$transaction(async (tx) => {
      const warehouseId = await this.warehousesMutationUseCase.create(
        {
          type: 'TRIP',
          name,
        },
        ownerUserId,
      );

      if (warehouseId) {
        await tx.trip.create({
          data: {
            name,
            dateFrom,
            dateTo,
            tripTypesId,
            warehouseId,
          },
        });
      }

      return;
    });

    return buildResponse('Выезд добавлен');
  }
}
