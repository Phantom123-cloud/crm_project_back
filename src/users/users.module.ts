import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RolesModule } from 'src/roles/roles.module';
import { RoleTemplatesModule } from 'src/role-templates/role-templates.module';
import { UsersRepository } from './users.repository';
import { AllUsersBuilder } from './builders/users.builder';
import { IsActiveUserUseCase } from './use-cases/is-active-user.usecase';
import { UpdateUserRolesUseCase } from './use-cases/update-user-roles.usecase';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    AllUsersBuilder,
    IsActiveUserUseCase,
    UpdateUserRolesUseCase,
  ],
  imports: [RolesModule, RoleTemplatesModule],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
