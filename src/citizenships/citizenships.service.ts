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
      throw new ConflictException('Такие данные уже были добавлены');
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
      throw new NotFoundException('Такой страны на сервере не обнаружено');
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

  async countries() {
    const data = await this.prismaService.citizenships.findMany({
      select: {
        id: true,
        localeEn: true,
        localeRu: true,
        code: true,
      },
    });
    return buildResponse('Список стран', { data });
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

    if (isExist.employees.length > 0) {
      throw new ConflictException(
        'Удаление невозможно, эта страна назначена некоторым пользователям',
      );
    }

    await this.prismaService.citizenships.delete({
      where: { id },
    });
    return buildResponse('Страна удалена');
  }
}
