import { Module } from '@nestjs/common';
import { RoleTypesController } from './role-types.controller';
import { RoleTypesService } from './role-types.service';
import { RolesDataBuilder } from 'src/roles/builders/roles-data.builder';
import { UsersRepository } from 'src/users/users.repository';

@Module({
  controllers: [RoleTypesController],
  providers: [RoleTypesService, RolesDataBuilder, UsersRepository],
})
export class RoleTypesModule {}
