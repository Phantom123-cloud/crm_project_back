import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { buildResponse } from 'src/utils/build-response';
import { WarehousesService } from 'src/warehouses/warehouses.service';

@Injectable()
export class TripsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly warehousesService: WarehousesService,
  ) {}

  async create(dto: CreateTripDto, tripTypesId: string, ownerUserId: string) {
    const { name, dateFrom, dateTo } = dto;

    const isExist = await this.prismaService.trip.findFirst({
      where: { name },
    });

    if (isExist) {
      throw new ConflictException('Выезд с таким названием уже существует');
    }

    const isExistType = await this.prismaService.tripTypes.findUnique({
      where: {
        id: tripTypesId,
      },
    });

    if (!isExistType) {
      throw new ConflictException('Тип выезда переданный вами не существует');
    }

    const isExistOwner = await this.prismaService.user.findUnique({
      where: {
        id: ownerUserId,
      },
    });

    if (!isExistOwner) {
      throw new ConflictException('Пользователь не существует');
    }

    if (new Date(dateTo) < new Date(dateFrom)) {
      throw new ConflictException(
        'Дата начала выезда не может быть больше даты окончания выезда',
      );
    }

    await this.prismaService.$transaction(async (tx) => {
      const warehouseId = await this.warehousesService.create(
        {
          type: 'TRIP',
          name: `${dateFrom}-${dateFrom} ${isExistType.name} ${name}`,
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
    });

    return buildResponse('Выезд добавлен');
  }
}
