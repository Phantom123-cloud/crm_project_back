import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RoleTemplatesModule } from 'src/role-templates/role-templates.module';
import { RolesRepository } from './roles.repository';
import { RolesByUserIdBuilder } from './builders/roles-by-user-id.builder';
import { UsersRepository } from 'src/users/users.repository';
import { FullInformationOnRolesBuilder } from './builders/full-Information-on-roles.builder';
import { RolesDataBuilder } from './builders/roles-data.builder';
import { MeRolesBuilder } from './builders/me-roles.builder';
import { RolesByNotTemplateBuilder } from './builders/roles-by-not-templete';
import { RolesByTypeBuilder } from './builders/roles-by-type.builder';

@Module({
  controllers: [RolesController],
  providers: [
    RolesService,
    RolesRepository,
    RolesByUserIdBuilder,
    UsersRepository,
    RolesDataBuilder,
    FullInformationOnRolesBuilder,
    MeRolesBuilder,
    RolesByNotTemplateBuilder,
    RolesByTypeBuilder,
  ],
  exports: [RolesService, RolesRepository, RolesByUserIdBuilder],
  imports: [RoleTemplatesModule],
})
export class RolesModule {}
