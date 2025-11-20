import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FullInformationOnRolesBuilder } from './builders/full-Information-on-roles.builder';
import { RolesDataBuilder } from './builders/roles-data.builder';

@Injectable()
export class RolesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fullInformationOnRolesBuilder: FullInformationOnRolesBuilder,
    private readonly rolesDataBuilder: RolesDataBuilder,
  ) {}

  async createRole(dto: CreateRoleDto, roleTypeId: string) {
    const isExist = await this.prismaService.role.findUnique({
      where: {
        name: dto.name,
      },
    });

    if (isExist) {
      throw new ConflictException('Такая роль уже существует');
    }

    const isExistType = await this.prismaService.roleTypes.findUnique({
      where: { id: roleTypeId },
    });

    if (!isExistType) {
      throw new NotFoundException('Роль не найдена');
    }

    await this.prismaService.role.create({
      data: { ...dto, roleTypeId },
    });

    return buildResponse('Новая роль создана');
  }
  async deleteRole(id: string) {
    const role = await this.prismaService.role.findUnique({
      where: {
        id,
      },

      select: {
        roleTemplates: true,
        individualRules: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Роль не найдена');
    }

    if (role.individualRules?.length || role.roleTemplates?.length) {
      throw new ConflictException(
        'Невозможно удалить: роль связан с другими данными',
      );
    }
    await this.prismaService.role.delete({
      where: { id },
    });

    return buildResponse('Роль удалена');
  }
  async updateRole(id: string, dto: UpdateRoleDto) {
    const { roleTypeId, name, descriptions } = dto;
    const role = await this.prismaService.role.findUnique({
      where: {
        id,
      },

      select: {
        roleTemplates: true,
        individualRules: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Роль не найдена');
    }

    if (
      (role.individualRules?.length || role.roleTemplates?.length) &&
      (name || roleTypeId)
    ) {
      throw new ConflictException(
        descriptions
          ? 'Вы можете отредактировать только описание '
          : 'Невозможно редактировать: роль связана с другими данными',
      );
    }

    if (name) {
      const isExistName = await this.prismaService.role.findUnique({
        where: {
          name,
        },
      });

      if (isExistName) {
        throw new ConflictException('Роль с таким именем уже существует');
      }
    }

    await this.prismaService.role.update({
      where: { id },
      data: {
        roleTypeId,
        name,
        descriptions,
      },
    });

    return buildResponse('Роль изменена');
  }
  
  async allRoles(page: number, limit: number) {
    return this.rolesDataBuilder.allRoles(page, limit);
  }
  async fullInformationOnRoles(userId: string) {
    return this.fullInformationOnRolesBuilder.fullInformationOnRoles(userId);
  }
}
