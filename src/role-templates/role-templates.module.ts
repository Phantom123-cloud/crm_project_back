import { Module } from '@nestjs/common';
import { RoleTemplatesService } from './role-templates.service';
import { RoleTemplatesController } from './role-templates.controller';
import { RoleTemplatesRepository } from './role-templates.repository';

@Module({
  controllers: [RoleTemplatesController],
  providers: [RoleTemplatesService, RoleTemplatesRepository],
  exports: [RoleTemplatesService, RoleTemplatesRepository],
})
export class RoleTemplatesModule {}
