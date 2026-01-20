import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { buildResponse } from 'src/utils/build-response';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';

@Injectable()
export class PlacesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreatePlaceDto) {
    const { name, city, street, postcode } = dto;

    const isExist = await this.prismaService.places.findFirst({
      where: {
        name,
        city,
        street,
      },
    });

    if (isExist) {
      throw new ConflictException('Место с таким названием уже существует');
    }

    await this.prismaService.places.create({
      data: {
        name,
        city,
        street,
        postcode,
      },
    });

    return buildResponse('Место добавлено');
  }
  async update(id: string, dto: UpdatePlaceDto) {
    const { name, city, street, postcode } = dto;

    const isExist = await this.prismaService.places.findUnique({
      where: { id },
    });

    if (!isExist) {
      throw new NotFoundException('Место не найдено');
    }

    const isExistNewData = await this.prismaService.places.findFirst({
      where: {
        name,
        city,
        street,
      },
    });

    if (isExistNewData) {
      throw new ConflictException('Город с такими данными уже существует');
    }

    await this.prismaService.places.update({
      where: { id },
      data: {
        name,
        city,
        street,
        postcode,
      },
    });
    return buildResponse('Место обновлёно');
  }
  async all(dto: PaginationBasic) {
    const { page, limit } = dto;
    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;

    const [places, total] = await this.prismaService.$transaction([
      this.prismaService.places.findMany({
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          id: true,
          name: true,
          city: true,
          street: true,
          postcode: true,
        },
      }),
      this.prismaService.places.count(),
    ]);

    const countPages = Math.ceil(total / limit);
    return buildResponse('Данные', {
      data: {
        places,
        total,
        countPages,
        page,
        limit,
      },
    });
  }

  async allSelect() {
    const data = await this.prismaService.places.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        street: true,
        postcode: true,
      },
    });
    return buildResponse('Данные', { data });
  }
  async delete(id: string) {
    const isExist = await this.prismaService.places.findUnique({
      where: { id },
      // select: {
      //   trips: true,
      // },
    });

    if (!isExist) {
      throw new NotFoundException('Такой страны на сервере не обнаружено');
    }

    // if (isExist.trips?.length) {
    //   throw new ConflictException(
    //     'Невозможно удалить: страна связана с другими данными',
    //   );
    // }

    await this.prismaService.places.delete({
      where: { id },
    });
    return buildResponse('Город удалён');
  }
}
