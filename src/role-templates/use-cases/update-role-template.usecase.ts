import { ConflictException, Injectable } from '@nestjs/common';
import { buildResponse } from 'src/utils/build-response';
import { ensureAllExist, ensureNoDuplicates } from 'src/utils/is-exists.utils';
import { UpdateRoleTemplateDto } from '../dto/update-role-template.dto';
import { RoleTemplatesRepository } from '../role-templates.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UpdateRoleTemplateUseCase {
  constructor(
    private readonly roleTemplatesRepository: RoleTemplatesRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async updateRoleTemplate(id: string, dto: UpdateRoleTemplateDto) {
    const isExistTemplate =
      await this.roleTemplatesRepository.roleTemplatesById(id);
    if (!isExistTemplate) {
      throw new ConflictException('Шаблон не найден');
    }

    const { arrayConnect, arrayDisconnect, name } = dto;

    if (name) {
      const isExistName =
        await this.roleTemplatesRepository.roleTemplatesByName(name);

      if (isExistName) {
        throw new ConflictException('Шаблон с таким именем уже существует');
      }
    }
    const individualIdsDelete: string[] = [];

    const roleIds = new Set(isExistTemplate.roles.map((r) => r.id));
    if (arrayConnect?.length) {
      ensureNoDuplicates(
        arrayConnect,
        roleIds,
        'Некоторые роли из переданного списка, уже добавлены в шаблон',
      );

      const individualIds = await this.prismaService.individualRules.findMany({
        where: {
          roleId: { in: arrayConnect },
          roleTemplatesId: id,
          type: 'ADD',
        },

        select: {
          id: true,
        },
      });

      individualIdsDelete.push(...individualIds.map((i) => i.id));
    }

    if (arrayDisconnect?.length) {
      ensureAllExist(
        arrayDisconnect,
        roleIds,
        'Вы пытаетесь удалить роль, отсутствующую в шаблоне',
      );

      const individualIds = await this.prismaService.individualRules.findMany({
        where: {
          roleId: { in: arrayConnect },
          roleTemplatesId: id,
          type: 'REMOVE',
        },

        select: {
          id: true,
        },
      });

      individualIdsDelete.push(...individualIds.map((i) => i.id));
    }

    const uniqueDeleteIds = [...new Set(individualIdsDelete)];

    await this.roleTemplatesRepository.updateRoleTemplate(
      id,
      uniqueDeleteIds,
      dto,
    );

    return buildResponse('Роли обновлены');
  }
}
