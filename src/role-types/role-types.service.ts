import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesDto } from 'src/roles/dto/roles.dto';
import { buildResponse } from 'src/utils/build-response';

@Injectable()
export class RoleTypesService {
  constructor(
    private readonly prismaService: PrismaService,
    // @Inject(forwardRef(() => UsersService))
    // private readonly usersService: UsersService,
  ) {}
  // создать тип роли
  async createRoleType(dto: Required<RolesDto>) {
    const { name, descriptions } = dto;

    const isExist = await this.prismaService.roleTypes.findUnique({
      where: {
        name,
      },
    });

    if (isExist) {
      throw new ConflictException('Тип роли с таким именем уже существует');
    }

    if (!name || !descriptions) {
      throw new BadRequestException('Имя и описание обязательны');
    }

    await this.prismaService.roleTypes.create({
      data: { ...dto },
    });

    return buildResponse('Тип роли добавлен');
  }
  // удалить тип роли, если к нему ничего не прикреплено
  async deleteRoleType(id: string) {
    const roleType = await this.prismaService.roleTypes.findUnique({
      where: {
        id,
      },

      select: {
        roles: true,
      },
    });

    if (!roleType) {
      throw new NotFoundException('Переданный тип роли не найден');
    }

    if (roleType.roles.length > 0) {
      throw new ConflictException(
        'Удаление невозможно, к данному типу прикреплены роли',
      );
    }

    await this.prismaService.roleTypes.delete({
      where: { id },
    });

    return buildResponse('Тип роли был удалён');
  }
  // смена имени типа роли, если к нему ничего не прикреплено
  async updateRoleType(id: string, dto: RolesDto) {
    const roleType = await this.prismaService.roleTypes.findUnique({
      where: {
        id,
      },

      select: {
        roles: true,
      },
    });

    if (!roleType) {
      throw new NotFoundException('Переданный тип роли не найден');
    }

    if (dto.name && roleType.roles.length > 0) {
      throw new ConflictException(
        'Редактирование невозможно, к данному типу прикреплены роли',
      );
    }

    await this.prismaService.roleTypes.update({
      where: { id },
      data: {
        name: dto.name || undefined,
        descriptions: dto.descriptions || undefined,
      },
    });

    return buildResponse('Имя типа роли было изменено');
  }

  async allRoleTypes() {
    const data = await this.prismaService.roleTypes.findMany({
      select: {
        id: true,
        name: true,
        descriptions: true,
      },
    });

    return buildResponse('Список типов', { data });
  }
}
