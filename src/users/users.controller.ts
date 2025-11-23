import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import type { Request } from 'express';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @AuthRoles('view_users')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async allUsers(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('isFullData', ParseBoolPipe) isFullData: boolean,
    @Query('isActive', new ParseBoolPipe({ optional: true }))
    isActive?: boolean,
    @Query('isOnline', new ParseBoolPipe({ optional: true }))
    isOnline?: boolean,
  ) {
    return await this.usersService.allUsers({
      page,
      limit,
      isActive,
      isOnline,
      isFullData,
    });
  }

  @AuthRoles('view_users')
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async userById(@Param('id') id: string) {
    return await this.usersService.userById(id);
  }

  @AuthRoles('change_account_status')
  @Put('is-active/:id')
  @HttpCode(HttpStatus.OK)
  async isActiveUser(@Param('id') id: string, @Req() req: Request) {
    return await this.usersService.isActiveUser(id, req);
  }

  @AuthRoles('update_account_roles')
  @Put('update-roles-by-user/:id')
  @HttpCode(HttpStatus.OK)
  updateUserRoles(@Param('id') id: string, @Body() dto: UpdateUserRolesDto) {
    return this.usersService.updateUserRoles(id, dto);
  }
}
