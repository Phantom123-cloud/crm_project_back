import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTripTypesDto } from './dto/create-trip-types.dto';
import { buildResponse } from 'src/utils/build-response';
import { UpdateTripTypesDto } from './dto/update-trip-types.dto';

@Injectable()
export class TripTypesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateTripTypesDto) {
    const { name } = dto;

    const isExist = await this.prismaService.tripTypes.findUnique({
      where: {
        name,
      },
    });

    if (isExist) {
      throw new ConflictException('Такой тип выезда уже существует');
    }

    await this.prismaService.tripTypes.create({
      data: {
        name,
      },
    });
    return buildResponse('Тип выезда добавлен');
  }
  async update(id: string, dto: UpdateTripTypesDto) {
    const { name } = dto;

    const isExist = await this.prismaService.tripTypes.findUnique({
      where: {
        id,
      },
    });

    if (!isExist) {
      throw new ConflictException('Такой тип выезда уже существует');
    }

    if (name === isExist.name) {
      throw new ConflictException('Новое имя должно отличаться от текущего');
    }

    const isExistNewData = await this.prismaService.tripTypes.findFirst({
      where: {
        name,
      },
    });

    if (isExistNewData) {
      throw new ConflictException('Тип выезда с такими данными уже существует');
    }

    await this.prismaService.tripTypes.update({
      where: { id },
      data: {
        name,
      },
    });
    return buildResponse('Тип выезда обновлён');
  }
  async delete(id: string) {
    const isExist = await this.prismaService.tripTypes.findUnique({
      where: {
        id,
      },

      select: {
        trips: true,
      },
    });

    if (!isExist) {
      throw new ConflictException('Тип выезда не обнаружен');
    }

    if (isExist.trips?.length) {
      throw new ConflictException(
        'Невозможно удалить: тип выезда связан с другими данными',
      );
    }

    await this.prismaService.tripTypes.delete({
      where: {
        id,
      },
    });

    return buildResponse('Тип выезда удалён');
  }

  async all(page: number, limit: number) {
    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;

    const [tripTypes, total] = await this.prismaService.$transaction([
      this.prismaService.tripTypes.findMany({
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          id: true,
          name: true,
        },
      }),
      this.prismaService.tripTypes.count(),
    ]);

    const countPages = Math.ceil(total / limit);
    return buildResponse('Данные', {
      data: {
        tripTypes,
        total,
        countPages,
        page,
        limit,
      },
    });
  }

  async allSelect() {
    const data = await this.prismaService.tripTypes.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return buildResponse('Данные', { data });
  }
}
