import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildResponse } from 'src/utils/build-response';
import { RoleTemplatesDto } from './dto/role-templates.dto';
import { ChangingRolesTemplateDto } from './dto/changing-roles-template.dto';
import { RoleDto } from 'src/role/dto/role.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RoleTemplatesService {
 constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
  ) {}

    // создать шаблог
      async createRoleTemplate(dto: RoleTemplatesDto) {
        const { array, name } = dto;
    
        const isExistTemplate = await this.prismaService.roleTemplates.findUnique({
          where: { name },
        });
    
        if (isExistTemplate) {
          throw new ConflictException('Даное имя уже присвоенно');
        }
    
        const isExistsRoleAll = await this.prismaService.role.findMany({
          where: {
            id: { in: array },
          },
        });
    
        if (isExistsRoleAll.length !== array.length) {
          throw new NotFoundException(
            'Некоторые роли не обнаружены на сервере, проверьте правильность данных и попробуйте ещё раз',
          );
        }
    
        await this.prismaService.roleTemplates.create({
          data: {
            name,
            roles: {
              connect: array.map((id) => ({ id })),
            },
          },
        });
        return buildResponse('Шаблон создан');
      }
      // получение списка всех типов роли
      async roleTemplatesAll() {
        const data = await this.prismaService.roleTemplates.findMany({
          select: { name: true, id: true },
        });
        return buildResponse('Список шаблонов', { data });
      }
      // удалить шабуло
      async deleteRoleTemplate(id: string) {
        const isExistTemplate = await this.prismaService.roleTemplates.findUnique({
          where: { id },
        });
    
        if (!isExistTemplate) {
          throw new ConflictException('Такого шаблона не существует');
        }
    
        await this.prismaService.roleTemplates.delete({
          where: {
            id,
          },
        });
    
        return buildResponse('Успешно удалено');
      }
      // смена ролей в шаблоне
      async changingRolesTemplate(id: string, dto: ChangingRolesTemplateDto) {
        const isExistTemplate = await this.prismaService.roleTemplates.findUnique({
          where: { id },
        });
    
        if (!isExistTemplate) {
          throw new ConflictException('Такого шаблона не существует');
        }
    
        const { key, array } = dto;
    
        const roles =
          key === 'connect'
            ? {
                connect: array.map((id) => ({ id })),
              }
            : {
                disconnect: array.map((id) => ({ id })),
              };
    
        await this.prismaService.roleTemplates.update({
          where: { id },
          data: {
            roles,
          },
        });
    
        return buildResponse('Роли обновлены');
      }
      // смена имена шаблона
      async changeNameRolesTemplate(id: string, dto: RoleDto) {
        const isExistTemplate = await this.prismaService.roleTemplates.findUnique({
          where: { id },
        });
    
        if (!isExistTemplate) {
          throw new ConflictException('Такого шаблона не существует');
        }
    
        await this.prismaService.roleTemplates.update({
          where: {
            id,
          },
    
          data: {
            name: dto.name,
          },
        });
    
        return buildResponse('Успешно удалено');
      }
      // назначить шаблон юзеру
      async assignRoleTemplate(userId: string, roleTemplatesId: string) {
        if (!userId || !roleTemplatesId) {
          throw new BadRequestException('Ошибка получения данных');
        }
    
        const user = await this.usersService.findUser(userId);
    
        if (!user) {
          throw new NotFoundException('Пользователь не найден');
        }
    
        if (user?.roleTemplate?.id === roleTemplatesId) {
          throw new ConflictException('Пользователь уже владеет данными ролями');
        }
    
        const isExistTemplate = this.prismaService.roleTemplates.findUnique({
          where: {
            id: roleTemplatesId,
          },
        });
    
        if (!isExistTemplate) {
          throw new NotFoundException('Пользователь не найден');
        }
    
        await this.prismaService.user.update({
          where: {
            id: userId,
          },
          data: {
            roleTemplatesId,
          },
        });
    
        return buildResponse('Шаблон добавлен');
      }
      // удалить шаблон у юзера
      async revokeRoleTemplate(userId: string, roleTemplatesId: string) {
        if (!userId || !roleTemplatesId) {
          throw new BadRequestException('Ошибка получения данных');
        }
    
        const user = await this.usersService.findUser(userId);
    
        if (!user) {
          throw new NotFoundException('Пользователь не найден');
        }
    
        if (user?.roleTemplate?.id !== roleTemplatesId) {
          throw new ConflictException('Пользователь не владеет данными ролями');
        }
    
        const isExistTemplate = this.prismaService.roleTemplates.findUnique({
          where: {
            id: roleTemplatesId,
          },
        });
    
        if (!isExistTemplate) {
          throw new NotFoundException('Пользователь не найден');
        }
    
        await this.prismaService.user.update({
          where: {
            id: userId,
          },
          data: {
            roleTemplatesId: null,
          },
        });
    
        return buildResponse('Шаблон откреплён');
      }
    
}
