import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RoleTemplatesModule } from 'src/role-templates/role-templates.module';
import { RolesRepository } from './roles.repository';
import { RolesByUserIdBuilder } from './domain/roles-by-user-id.builder';
import { UsersRepository } from 'src/users/users.repository';

@Module({
  controllers: [RolesController],
  providers: [
    RolesService,
    RolesRepository,
    RolesByUserIdBuilder,
    UsersRepository,
  ],
  exports: [RolesService, RolesRepository, RolesByUserIdBuilder],
  imports: [RoleTemplatesModule],
})
export class RolesModule {}
