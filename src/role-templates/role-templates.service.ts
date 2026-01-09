import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { RoleTemplatesDto } from './dto/role-templates.dto';
import { UpdateRoleTemplateDto } from './dto/update-role-template.dto';
import { RoleTemplatesBuilder } from './builders/role-templates-by-id.builder';
import { RoleTemplatesRepository } from './role-templates.repository';
import { UpdateRoleTemplateUseCase } from './use-cases/update-role-template.usecase';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';

@Injectable()
export class RoleTemplatesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly roleTemplatesBuilder: RoleTemplatesBuilder,
    private readonly roleTemplatesRepository: RoleTemplatesRepository,
    private readonly updateRoleTemplateUseCase: UpdateRoleTemplateUseCase,
  ) {}
  async createRoleTemplate(dto: RoleTemplatesDto) {
    const { array, name } = dto;

    const isExistTemplate =
      await this.roleTemplatesRepository.roleTemplatesByName(name);

    if (isExistTemplate) {
      throw new ConflictException('Такой шаблон уже существует');
    }

    const isExistsRoleAll = await this.prismaService.role.findMany({
      where: {
        id: { in: array },
      },
    });

    if (isExistsRoleAll.length !== array.length) {
      throw new NotFoundException('Некоторые указанные роли не найдены');
    }

    await this.prismaService.roleTemplates.create({
      data: {
        name,
        roles: {
          connect: array.map((id) => ({ id })),
        },
      },
    });
    return buildResponse('Новый шаблон создан');
  }
  async allRoleTemplatesSelect() {
    const templates = await this.prismaService.roleTemplates.findMany({
      select: {
        name: true,
        id: true,
      },
    });

    return buildResponse('Данные', { data: { templates } });
  }

  async allRoleTemplates(dto: PaginationBasic) {
    const { page, limit } = dto;
    const currentPage = page ?? 1;
    const pageSize = limit ?? 10;

    const [templates, total] = await this.prismaService.$transaction([
      this.prismaService.roleTemplates.findMany({
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

      this.prismaService.roleTemplates.count(),
    ]);

    const countPages = Math.ceil(total / limit);
    return buildResponse('Данные', {
      data: {
        templates,
        total,
        countPages,
        page,
        limit,
      },
    });
  }
  async deleteRoleTemplate(id: string) {
    const isExistTemplate = await this.prismaService.roleTemplates.findUnique({
      where: { id },

      select: {
        users: true,
      },
    });

    if (!isExistTemplate) {
      throw new ConflictException('Шаблон не найден');
    }

    if (isExistTemplate.users?.length) {
      throw new ConflictException(
        'Невозможно удалить: шаблон связан с другими данными',
      );
    }

    await this.prismaService.roleTemplates.delete({
      where: {
        id,
      },
    });

    return buildResponse('Шаблон удалён');
  }

  async roleTemplatesById(id: string) {
    return this.roleTemplatesBuilder.roleTemplatesById(id);
  }

  async updateRoleTemplate(id: string, dto: UpdateRoleTemplateDto) {
    return this.updateRoleTemplateUseCase.updateRoleTemplate(id, dto);
  }
}
