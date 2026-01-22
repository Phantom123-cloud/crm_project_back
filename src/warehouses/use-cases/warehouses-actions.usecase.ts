import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { RolesDataBuilder } from 'src/roles/builders/roles-data.builder';

@Injectable()
export class WarehousesActionsUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly rolesDataBuilder: RolesDataBuilder,
  ) {}

  async isWarehousesAdmin(user: JwtPayload) {
    const userRoles = await this.rolesDataBuilder.getRolesNameByUserId(user.id);
    return userRoles.some((roleName) => roleName === 'warehouses_admin');
  }
  async isActive(id: string) {
    const [isExistWarehouse, isExistEmptyStockItems, isEmptyStockMovements] =
      await this.prismaService.$transaction([
        this.prismaService.warehouses.findUnique({
          where: {
            id,
          },

          select: {
            stockItems: true,
            type: true,
            isActive: true,
            ownerUserId: true,
          },
        }),

        this.prismaService.stockItems.count({
          where: {
            warehouseId: id,
            quantity: {
              gte: 1,
            },
          },
        }),
        this.prismaService.stockMovements.count({
          where: {
            OR: [
              {
                toWarehouseId: id,
              },
              {
                fromWarehouseId: id,
              },
            ],

            status: 'TRANSIT',
          },
        }),
      ]);

    if (!isExistWarehouse) {
      throw new ConflictException('Склад не обнаружен');
    }

    if (isExistWarehouse.type === 'CENTRAL') {
      throw new ConflictException('Центральный склад не блокируется');
    }

    if (isExistEmptyStockItems > 0 || isEmptyStockMovements > 0) {
      throw new ConflictException(
        'Заблокировать склад можно после перемещения всех остатков товара в другое место',
      );
    }

    await this.prismaService.warehouses.update({
      where: {
        id,
      },

      data: {
        isActive: !isExistWarehouse.isActive,
      },
    });

    return buildResponse(
      `Cклад ${isExistWarehouse.isActive ? 'заблокирован' : 'разблокирован'}`,
    );
  }
  async changeOwnerWarehouse(warehouseId: string, ownerUserId: string) {
    const [isExistWarehouse, isExistUser] =
      await this.prismaService.$transaction([
        this.prismaService.warehouses.findUnique({
          where: {
            id: warehouseId,
          },

          select: {
            ownerUserId: true,
          },
        }),
        this.prismaService.user.findUnique({
          where: {
            id: ownerUserId,
          },
        }),
      ]);

    if (!isExistWarehouse || !isExistUser) {
      throw new NotFoundException(
        !isExistWarehouse ? 'Склад не найден' : 'Пользователь не найден',
      );
    }

    await this.prismaService.warehouses.update({
      where: {
        id: warehouseId,
      },
      data: {
        ownerUserId,
      },
    });
    return buildResponse('Ответственный обновлён');
  }
}
