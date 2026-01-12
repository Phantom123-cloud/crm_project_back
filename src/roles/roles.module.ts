import { Global, Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RoleTemplatesModule } from 'src/role-templates/role-templates.module';
import { RolesRepository } from './roles.repository';
import { RolesByUserIdBuilder } from './builders/roles-by-user-id.builder';
import { FullInformationOnRolesBuilder } from './builders/full-Information-on-roles.builder';
import { RolesByNotTemplateBuilder } from './builders/roles-by-not-templete';
import { RolesByTypeBuilder } from './builders/roles-by-type.builder';
import { RolesDataBuilder } from './builders/roles-data.builder';
import { UsersModule } from 'src/users/users.module';

@Global()
@Module({
  controllers: [RolesController],
  providers: [
    RolesService,
    RolesRepository,
    RolesByUserIdBuilder,
    FullInformationOnRolesBuilder,
    RolesByTypeBuilder,
    RolesDataBuilder,
    RolesByNotTemplateBuilder,
  ],
  exports: [
    RolesDataBuilder,
    RolesRepository,
    RolesByUserIdBuilder,
    RolesByNotTemplateBuilder,
  ],
  imports: [RoleTemplatesModule, UsersModule],
})
export class RolesModule {}
