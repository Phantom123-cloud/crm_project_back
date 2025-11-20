import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateRoleTemplateDto } from './dto/update-role-template.dto';

@Injectable()
export class RoleTemplatesRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async roleTemplatesById(id: string) {
    return this.prismaService.roleTemplates.findUnique({
      where: { id },
      select: {
        roles: true,
      },
    });
  }

  async roleTemplatesByName(name: string) {
    return this.prismaService.roleTemplates.findUnique({
      where: { name },
      select: {
        roles: true,
      },
    });
  }

  async getAllRoleTemplates() {
    return this.prismaService.roleTemplates.findMany({
      select: {
        name: true,
        id: true,
      },
    });
  }

  async updateRoleTemplate(id: string, dto: UpdateRoleTemplateDto) {
    const { arrayConnect, arrayDisconnect, name } = dto;

    return this.prismaService.roleTemplates.update({
      where: { id },
      data: {
        name,
        roles: {
          ...(arrayDisconnect?.length && {
            disconnect: arrayDisconnect.map((id) => ({ id })),
          }),
          ...(arrayConnect?.length && {
            connect: arrayConnect.map((id) => ({ id })),
          }),
        },

        ...(arrayDisconnect?.length && {
          individualRules: {
            deleteMany: { roleTemplatesId: id, type: 'REMOVE' },
          },
        }),
      },
    });
  }
}
