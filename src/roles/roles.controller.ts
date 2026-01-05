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
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @AuthRoles('create_roles')
  @Post('create')
  @HttpCode(HttpStatus.OK)
  createRole(
    @Body() dto: CreateRoleDto,
    @Query('roleTypeId') roleTypeId: string,
  ) {
    return this.rolesService.createRole(dto, roleTypeId);
  }
  @AuthRoles('delete_roles')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }
  @AuthRoles('update_roles')
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.updateRole(id, dto);
  }

  @AuthRoles('view_roles')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  allRoles(@Query() dto: PaginationBasic) {
    return this.rolesService.allRoles(dto);
  }

  @AuthRoles('update_account_roles')
  @Get('full-info-roles-by-user/:id')
  @HttpCode(HttpStatus.OK)
  fullInformationOnRoles(@Param('id') id: string) {
    return this.rolesService.fullInformationOnRoles(id);
  }

  @AuthRoles('update_templates')
  @Get('by-not-id/:id')
  @HttpCode(HttpStatus.OK)
  getRolesNotInTemplate(@Param('id') id: string) {
    return this.rolesService.rolesByNotTemplate(id);
  }

  @AuthRoles('create_templates')
  @Get('all-roles')
  @HttpCode(HttpStatus.OK)
  allRolesByType() {
    return this.rolesService.allRolesByType();
  }
}
