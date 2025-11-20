import { Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { PaginationDto } from './dto/pagination.dto';
import { AllUsersBuilder } from './builders/users.builder';
import { IsActiveUserUseCase } from './use-cases/is-active-user.usecase';
import { UpdateUserRolesUseCase } from './use-cases/update-user-roles.usecase';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly allUsersBuilder: AllUsersBuilder,
    private readonly isActiveUserUseCase: IsActiveUserUseCase,
    private readonly updateUserRolesUseCase: UpdateUserRolesUseCase,
  ) {}

  async allUsers(dto: PaginationDto) {
    return this.allUsersBuilder.allUsers(dto);
  }

  async userById(id: string) {
    return this.allUsersBuilder.userById(id);
  }

  async isActiveUser(id: string, req: Request) {
    return this.isActiveUserUseCase.isActiveUser(id, req);
  }

  async updateUserRoles(userId: string, dto: UpdateUserRolesDto) {
    return this.updateUserRolesUseCase.updateUserRoles(userId, dto);
  }
}
