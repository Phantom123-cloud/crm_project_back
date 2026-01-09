import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto } from 'src/roles/dto/create-role.dto';
import { buildResponse } from 'src/utils/build-response';
import { UpdateRoleTypeDto } from './dto/update-role-type.dto';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';

@Injectable()
export class RoleTypesService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(dto: CreateRoleDto) {
    const { name, descriptions } = dto;

    const isExist = await this.prismaService.roleTypes.findUnique({
      where: {
        name,
      },
    });

    if (isExist) {
      throw new ConflictException('Такой тип роли уже существует');
    }

    if (!name || !descriptions) {
      throw new BadRequestException('Все данные обязательны');
    }

    await this.prismaService.roleTypes.create({
      data: { ...dto },
    });

    return buildResponse('Тип роли добавлен');
  }
  async delete(id: string) {
    const roleType = await this.prismaService.roleTypes.findUnique({
      where: {
        id,
      },

      select: {
        roles: true,
      },
    });

    if (!roleType) {
      throw new NotFoundException('Тип роли не найден');
    }

    if (roleType.roles?.length) {
      throw new ConflictException(
        'Невозможно удалить: тип роли связан с другими данными',
      );
    }

    await this.prismaService.roleTypes.delete({
      where: { id },
    });

    return buildResponse('Тип роли удалён');
  }
  async update(id: string, dto: UpdateRoleTypeDto) {
    const roleType = await this.prismaService.roleTypes.findUnique({
      where: {
        id,
      },

      select: {
        roles: true,
      },
    });

    if (!roleType) {
      throw new NotFoundException('Тип роли не найден');
    }
    const { name, descriptions } = dto;

    // if (name && roleType.roles?.length) {
    //   throw new ConflictException(
    //     'Невозможно редактировать: тип роли связан с другими данными',
    //   );
    // }

    if (name) {
      const isExistName = await this.prismaService.roleTypes.findUnique({
        where: {
          name,
        },
      });

      if (isExistName) {
        throw new ConflictException('Тип роли с таким именем уже существует');
      }
    }

    await this.prismaService.roleTypes.update({
      where: { id },
      data: {
        name,
        descriptions,
      },
    });

    return buildResponse('Тип роли изменён');
  }
  async all(dto: PaginationBasic) {
    const { page, limit } = dto;
    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;

    const [rolesTypeData, total] = await this.prismaService.$transaction([
      this.prismaService.roleTypes.findMany({
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          id: true,
          name: true,
          descriptions: true,
        },
      }),
      this.prismaService.roleTypes.count(),
    ]);

    const countPages = Math.ceil(total / limit);
    return buildResponse('Данные', {
      data: {
        rolesTypeData,
        total,
        countPages,
        page,
        limit,
      },
    });
  }

  async selectAll() {
    const data = await this.prismaService.roleTypes.findMany({
      select: {
        id: true,
        name: true,
        descriptions: true,
      },
    });
    return buildResponse('Данные', { data });
  }
}
