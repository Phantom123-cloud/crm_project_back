import { Module } from '@nestjs/common';
import { RoleTemplatesService } from './role-templates.service';
import { RoleTemplatesController } from './role-templates.controller';
import { RoleTemplatesRepository } from './role-templates.repository';
import { UpdateRoleTemplateUseCase } from './use-cases/update-role-template.usecase';
import { RoleTemplatesBuilder } from './builders/role-templates-by-id.builder';

@Module({
  controllers: [RoleTemplatesController],
  providers: [
    RoleTemplatesService,
    RoleTemplatesRepository,
    UpdateRoleTemplateUseCase,
    RoleTemplatesBuilder,
  ],
  exports: [RoleTemplatesService, RoleTemplatesRepository],
})
export class RoleTemplatesModule {}
