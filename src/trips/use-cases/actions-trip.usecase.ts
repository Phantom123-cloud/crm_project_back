import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';

@Injectable()
export class ActionsTripUsecase {
  constructor(private readonly prismaService: PrismaService) {}

  async isActiveTrip(id: string) {
    const isExist = await this.prismaService.trip.findUnique({
      where: { id },
    });

    if (!isExist) {
      throw new NotFoundException('Переданный выезд не найден');
    }

    await this.prismaService.trip.update({
      where: { id },

      data: {
        isActive: !isExist.isActive,

        // warehouses: {
        //   update: {
        //     isActive: !isExist.isActive,
        //   },
        // },
      },
    });

    return buildResponse(
      `Выезд ${isExist.isActive ? 'заблокирован' : 'разблокирован'}`,
    );
  }
}
