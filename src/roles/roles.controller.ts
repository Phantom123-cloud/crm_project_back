import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Delete,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { IndividualRulesDto } from './dto/individual-rules.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @Auth()
  @Post('create')
  // create_roles
  @HttpCode(HttpStatus.OK)
  createRole(
    @Body() dto: CreateRoleDto,
    @Query('roleTypeId') roleTypeId: string,
  ) {
    return this.rolesService.createRole(dto, roleTypeId);
  }
  @Auth()
  @Delete('delete/:id')
  // delete_roles
  @HttpCode(HttpStatus.OK)
  deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }
  @Auth()
  @Put('update/:id')
  // update_roles
  @HttpCode(HttpStatus.OK)
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.updateRole(id, dto);
  }

  @Auth()
  @Get('all')
  // view_roles
  @HttpCode(HttpStatus.OK)
  allRoles(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.rolesService.allRoles(page, limit);
  }

  @Get('full-info-roles-by-user/:id')
  @HttpCode(HttpStatus.OK)
  fullInformationOnRoles(@Param('id') id: string) {
    return this.rolesService.fullInformationOnRoles(id);
  }

  // @Auth()
  @Put('update-roles-by-user/:id')
  // update_roles
  @HttpCode(HttpStatus.OK)
  updateUserRoles(@Param('id') id: string, @Body() dto: UpdateUserRolesDto) {
    return this.rolesService.updateUserRoles(id, dto);
  }
}
