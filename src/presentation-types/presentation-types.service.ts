import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';
import { CreatePresentationTypesDto } from './dto/create-presentation-types.dto';
import { UpdatePresentationTypesDto } from './dto/update-presentation-types.dto';

@Injectable()
export class PresentationTypesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreatePresentationTypesDto) {
    const { name } = dto;

    const isExist = await this.prismaService.presentationTypes.findUnique({
      where: {
        name,
      },
    });

    if (isExist) {
      throw new ConflictException('Такой тип презентации уже существует');
    }

    await this.prismaService.presentationTypes.create({
      data: {
        name,
      },
    });
    return buildResponse('Тип презентации добавлен');
  }
  async update(id: string, dto: UpdatePresentationTypesDto) {
    const { name } = dto;

    const isExist = await this.prismaService.presentationTypes.findUnique({
      where: {
        id,
      },
    });

    if (!isExist) {
      throw new ConflictException('Такой тип презентации уже существует');
    }

    if (name === isExist.name) {
      throw new ConflictException('Новое имя должно отличаться от текущего');
    }

    const isExistNewData = await this.prismaService.presentationTypes.findFirst(
      {
        where: {
          name,
        },
      },
    );

    if (isExistNewData) {
      throw new ConflictException(
        'Тип презентации с такими данными уже существует',
      );
    }

    await this.prismaService.presentationTypes.update({
      where: { id },
      data: {
        name,
      },
    });
    return buildResponse('Тип презентации обновлён');
  }
  async delete(id: string) {
    const isExist = await this.prismaService.presentationTypes.findUnique({
      where: {
        id,
      },

      select: {
        presentations: true,
      },
    });

    if (!isExist) {
      throw new ConflictException('Тип выезда не обнаружен');
    }

    if (isExist.presentations?.length) {
      throw new ConflictException(
        'Невозможно удалить: тип презентации связан с другими данными',
      );
    }

    await this.prismaService.presentationTypes.delete({
      where: {
        id,
      },
    });

    return buildResponse('Тип презентации удалён');
  }

  async all(dto: PaginationBasic) {
    const { page, limit } = dto;
    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;

    const [presentationTypes, total] = await this.prismaService.$transaction([
      this.prismaService.presentationTypes.findMany({
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
      this.prismaService.presentationTypes.count(),
    ]);

    const countPages = Math.ceil(total / limit);
    return buildResponse('Данные', {
      data: {
        presentationTypes,
        total,
        countPages,
        page,
        limit,
      },
    });
  }

  async allSelect() {
    const data = await this.prismaService.presentationTypes.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return buildResponse('Данные', { data });
  }
}
