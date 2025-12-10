import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { CreateCitizenshipsDto } from './dto/create-citizenships.dto';
import { UpdateCitizenshipsDto } from './dto/update-citizenships.dto';

@Injectable()
export class CitizenshipsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateCitizenshipsDto) {
    const { localeEn, localeRu, code } = dto;

    const isExist = await this.prismaService.citizenships.findFirst({
      where: {
        OR: [
          {
            localeEn,
          },
          { localeRu },
          { code },
        ],
      },
    });

    if (isExist) {
      throw new ConflictException('Такая страна уже существует');
    }

    await this.prismaService.citizenships.create({
      data: {
        code,
        localeEn,
        localeRu,
      },
    });

    return buildResponse('Страна добавлена');
  }
  async update(id: string, dto: UpdateCitizenshipsDto) {
    const { localeEn, localeRu, code } = dto;

    const isExist = await this.prismaService.citizenships.findUnique({
      where: { id },
    });

    if (!isExist) {
      throw new NotFoundException('Страна не найдена');
    }

    const isExistNewData = await this.prismaService.citizenships.findFirst({
      where: {
        OR: [
          {
            localeEn,
          },
          { localeRu },
          { code },
        ],
      },
    });

    if (isExistNewData) {
      throw new ConflictException('Страна с такими данными уже существует');
    }

    await this.prismaService.citizenships.update({
      where: { id },
      data: {
        localeEn,
        localeRu,
        code,
      },
    });
    return buildResponse('Страна обновлена');
  }
  async all(page: number, limit: number) {
    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;

    const [citizenships, total] = await this.prismaService.$transaction([
      this.prismaService.citizenships.findMany({
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          id: true,
          localeEn: true,
          localeRu: true,
          code: true,
        },
      }),
      this.prismaService.citizenships.count(),
    ]);

    const countPages = Math.ceil(total / limit);
    return buildResponse('Данные', {
      data: {
        citizenships,
        total,
        countPages,
        page,
        limit,
      },
    });
  }

  async allSelect() {
    const data = await this.prismaService.citizenships.findMany({
      select: {
        id: true,
        localeEn: true,
        localeRu: true,
        code: true,
      },
    });
    return buildResponse('Данные', { data });
  }
  async delete(id: string) {
    const isExist = await this.prismaService.citizenships.findUnique({
      where: { id },
      select: {
        employees: true,
      },
    });

    if (!isExist) {
      throw new NotFoundException('Такой страны на сервере не обнаружено');
    }

    if (isExist.employees?.length) {
      throw new ConflictException(
        'Невозможно удалить: страна связана с другими данными',
      );
    }

    await this.prismaService.citizenships.delete({
      where: { id },
    });
    return buildResponse('Страна удалена');
  }
}
