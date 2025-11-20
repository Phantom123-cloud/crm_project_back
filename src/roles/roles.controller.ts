import {
  Controller,
  Post,
  Body,
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
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @Auth()
  @Post('create')
  // @AuthRoles('create_roles')
  @HttpCode(HttpStatus.OK)
  createRole(
    @Body() dto: CreateRoleDto,
    @Query('roleTypeId') roleTypeId: string,
  ) {
    return this.rolesService.createRole(dto, roleTypeId);
  }
  @Auth()
  @Delete('delete/:id')
  // @AuthRoles('delete_roles')
  @HttpCode(HttpStatus.OK)
  deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }
  @Auth()
  @Put('update/:id')
  // @AuthRoles('update_roles')
  @HttpCode(HttpStatus.OK)
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.updateRole(id, dto);
  }

  @Auth()
  @Get('all')
  // @AuthRoles('view_roles')
  @HttpCode(HttpStatus.OK)
  allRoles(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.rolesService.allRoles(page, limit);
  }

  // @AuthRoles('view_roles_by_user')
  @Get('full-info-roles-by-user/:id')
  @HttpCode(HttpStatus.OK)
  fullInformationOnRoles(@Param('id') id: string) {
    return this.rolesService.fullInformationOnRoles(id);
  }

  @Auth()
  // @AuthRoles('view_roles_by_user')
  @Get('by-not-id/:id')
  @HttpCode(HttpStatus.OK)
  getRolesNotInTemplate(@Param('id') id: string) {
    return this.rolesService.rolesByNotTemplate(id);
  }

  @Auth()
  // @AuthRoles('view_roles_by_type')
  @Get('all-roles')
  @HttpCode(HttpStatus.OK)
  allRolesByType() {
    return this.rolesService.allRolesByType();
  }
}
