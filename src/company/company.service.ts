import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { buildResponse } from 'src/utils/build-response';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateCompanyDto) {
    const { name } = dto;

    const isExist = await this.prismaService.company.findFirst({
      where: {
        name,
      },
    });

    if (isExist) {
      throw new ConflictException('Компания с таким названием уже существует');
    }

    await this.prismaService.company.create({
      data: {
        name,
      },
    });

    return buildResponse('Компания добавлена');
  }

  async update(id: string, dto: UpdateCompanyDto) {
    const { name } = dto;

    const isExist = await this.prismaService.company.findUnique({
      where: { id },
    });

    if (!isExist) {
      throw new NotFoundException('Компания не найдена');
    }

    const isExistNewData = await this.prismaService.company.findFirst({
      where: {
        name,
      },
    });

    if (isExistNewData) {
      throw new ConflictException('Компания с такими данными уже существует');
    }

    await this.prismaService.company.update({
      where: { id },
      data: {
        name,
      },
    });
    return buildResponse('Компания обновлена');
  }

  async all(dto: PaginationBasic) {
    const { page, limit } = dto;
    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;

    const [companies, total] = await this.prismaService.$transaction([
      this.prismaService.company.findMany({
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
      this.prismaService.company.count(),
    ]);

    const countPages = Math.ceil(total / limit);
    return buildResponse('Данные', {
      data: {
        companies,
        total,
        countPages,
        page,
        limit,
      },
    });
  }

  async allSelect(tripId?: string) {
    const data = await this.prismaService.company.findMany({
      where: {
        ...(tripId && {
          NOT: {
            trips: {
              some: {
                id: tripId,
              },
            },
          },
        }),
      },
      select: {
        id: true,
        name: true,
      },
    });
    return buildResponse('Данные', { data });
  }

  async delete(id: string) {
    const isExist = await this.prismaService.company.findUnique({
      where: { id },
      select: {
        trips: true,
      },
    });

    if (!isExist) {
      throw new NotFoundException('Компания не обнаружена');
    }

    if (isExist.trips?.length) {
      throw new ConflictException(
        'Невозможно удалить: компания связана с другими данными',
      );
    }

    await this.prismaService.company.delete({
      where: { id },
    });
    return buildResponse('Компания удалена');
  }
}
