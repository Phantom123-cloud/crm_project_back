import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AllUsersBuilder } from './builders/users.builder';
import { IsActiveUserUseCase } from './use-cases/is-active-user.usecase';
import { UpdateUserRolesUseCase } from './use-cases/update-user-roles.usecase';
import { UsersRepository } from './users.repository';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    AllUsersBuilder,
    IsActiveUserUseCase,
    UpdateUserRolesUseCase,
    UsersRepository,
  ],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
