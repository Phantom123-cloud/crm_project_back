import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { CreateProductsDto } from './dto/create-products.dto';
import { UpdateProductsDto } from './dto/update-products.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateProductsDto) {
    const { name } = dto;

    const isExist = await this.prismaService.products.findUnique({
      where: {
        name,
      },
    });

    if (isExist) {
      throw new ConflictException('Такой продукт уже существует');
    }

    await this.prismaService.products.create({
      data: {
        name,
      },
    });
    return buildResponse('Продукт добавлен');
  }
  async update(id: string, dto: UpdateProductsDto) {
    const { name } = dto;

    const isExist = await this.prismaService.products.findUnique({
      where: {
        id,
      },
    });

    if (!isExist) {
      throw new ConflictException('Такой продукт уже существует');
    }

    if (name === isExist.name) {
      throw new ConflictException('Новое имя должно отличаться от текущего');
    }

    const isExistNewData = await this.prismaService.products.findFirst({
      where: {
        name,
      },
    });

    if (isExistNewData) {
      throw new ConflictException('Продукт с такими данными уже существует');
    }

    await this.prismaService.products.update({
      where: { id },
      data: {
        name,
      },
    });
    return buildResponse('Продукт обновлён');
  }
  async delete(id: string) {
    const isExist = await this.prismaService.products.findUnique({
      where: {
        id,
      },

      select: {
        stockItems: true,
        stockMovements: true,
      },
    });

    if (!isExist) {
      throw new ConflictException('Продукт не обнаружен');
    }

    if (isExist.stockItems?.length || isExist.stockMovements?.length) {
      throw new ConflictException(
        'Невозможно удалить: Продукт связан с другими данными',
      );
    }

    await this.prismaService.products.delete({
      where: {
        id,
      },
    });

    return buildResponse('Продукт удалён');
  }

  async all() {
    const data = await this.prismaService.products.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return buildResponse('Данные', { data });
  }
}
