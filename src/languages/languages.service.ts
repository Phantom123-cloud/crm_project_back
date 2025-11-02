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
      throw new ConflictException('Такие данные уже были добавлены');
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

  async languages() {
    const data = await this.prismaService.languages.findMany({
      select: {
        id: true,
        localeEn: true,
        localeRu: true,
        code: true,
      },
    });
    return buildResponse('Список языков', { data });
  }

  async update(id: string, dto: UpdateLanguageDto) {
    const { localeEn, localeRu, code } = dto;

    const isExist = await this.prismaService.languages.findUnique({
      where: { id },
    });

    if (!isExist) {
      throw new NotFoundException('Такой страны на сервере не обнаружено');
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
      throw new NotFoundException('Такой страны на сервере не обнаружено');
    }

    if (isExist.foreignLanguages?.length) {
      throw new ConflictException(
        'Удаление невозможно, этот язык назначен некоторым пользователям',
      );
    }

    await this.prismaService.languages.delete({
      where: { id },
    });
    return buildResponse('Язык удален');
  }
}
