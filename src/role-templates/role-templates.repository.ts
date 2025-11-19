import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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

  
}
