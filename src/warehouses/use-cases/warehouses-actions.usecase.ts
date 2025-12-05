import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';

@Injectable()
export class WarehousesActionsUseCase {
  constructor(private readonly prismaService: PrismaService) {}
  async isActive(id: string) {
    const isExist = await this.prismaService.warehouses.findUnique({
      where: {
        id,
      },
    });

    if (!isExist) {
      throw new ConflictException('Склад не обнаружен');
    }

    await this.prismaService.warehouses.update({
      where: {
        id,
      },

      data: {
        isActive: !isExist.isActive,
      },
    });

    return buildResponse(
      `Cклад ${isExist.isActive ? 'заблокирован' : 'разблокирован'}`,
    );
  }
}
