import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';

@Injectable()
export class LanguagesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateLanguageDto) {
    const { localeEn, localeRu, code } = dto;

    const isExist = await this.prismaService.languages.findFirst({
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
      throw new ConflictException('Такой язык уже существует');
    }

    await this.prismaService.languages.create({
      data: {
        code,
        localeEn,
        localeRu,
      },
    });

    return buildResponse('Язык добавлен');
  }
  async all(page: number, limit: number) {
    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;

    const [languages, total] = await this.prismaService.$transaction([
      this.prismaService.languages.findMany({
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
      this.prismaService.languages.count(),
    ]);

    const countPages = Math.ceil(total / limit);
    return buildResponse('Данные', {
      data: {
        languages,
        total,
        countPages,
        page,
        limit,
      },
    });
  }
  async allSelect() {
    const data = await this.prismaService.languages.findMany({
      select: {
        id: true,
        localeEn: true,
        localeRu: true,
        code: true,
      },
    });
    return buildResponse('Данные', { data });
  }
  async update(id: string, dto: UpdateLanguageDto) {
    const { localeEn, localeRu, code } = dto;

    const isExist = await this.prismaService.languages.findUnique({
      where: { id },
    });

    if (!isExist) {
      throw new NotFoundException('Такого языка на сервере не обнаружено');
    }

    const isExistNewData = await this.prismaService.languages.findFirst({
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
      throw new ConflictException('Язык с такими данными уже существует');
    }

    await this.prismaService.languages.update({
      where: { id },
      data: {
        localeEn,
        localeRu,
        code,
      },
    });
    return buildResponse('Язык обновлен');
  }
  async delete(id: string) {
    const isExist = await this.prismaService.languages.findUnique({
      where: { id },
      select: {
        foreignLanguages: true,
      },
    });

    if (!isExist) {
      throw new NotFoundException('Такой языка на сервере не обнаружено');
    }

    if (isExist.foreignLanguages?.length) {
      throw new ConflictException(
        'Невозможно удалить: язык связан с другими данными',
      );
    }

    await this.prismaService.languages.delete({
      where: { id },
    });
    return buildResponse('Язык удален');
  }
}
