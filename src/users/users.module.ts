import { forwardRef, Global, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RolesModule } from 'src/roles/roles.module';
import { AllUsersBuilder } from './builders/users.builder';
import { IsActiveUserUseCase } from './use-cases/is-active-user.usecase';
import { UpdateUserRolesUseCase } from './use-cases/update-user-roles.usecase';
import { UsersRepository } from './users.repository';
import { RolesDataBuilder } from 'src/roles/builders/roles-data.builder';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    AllUsersBuilder,
    IsActiveUserUseCase,
    UpdateUserRolesUseCase,
    RolesDataBuilder,
    UsersRepository,
  ],
  imports: [RolesModule],
  exports: [UsersService],
})
export class UsersModule {}
