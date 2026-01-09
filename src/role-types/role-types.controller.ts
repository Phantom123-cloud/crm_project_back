import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RoleTypesService } from './role-types.service';
import { CreateRoleDto } from 'src/roles/dto/create-role.dto';
import { UpdateRoleTypeDto } from './dto/update-role-type.dto';
import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';

@Controller('role-types')
export class RoleTypesController {
  constructor(private readonly roleTypesService: RoleTypesService) {}
  @AuthRoles('create_role_types')
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  createRoleType(@Body() dto: CreateRoleDto) {
    return this.roleTypesService.create(dto);
  }
  @AuthRoles('delete_role_types')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteRoleType(@Param('id') id: string) {
    return this.roleTypesService.delete(id);
  }

  @AuthRoles('update_role_types')
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  updateRoleType(@Param('id') id: string, @Body() dto: UpdateRoleTypeDto) {
    return this.roleTypesService.update(id, dto);
  }

  @AuthRoles('view_role_types')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  allRoleTypes(@Query() dto: PaginationBasic) {
    return this.roleTypesService.all(dto);
  }

  @AuthRoles('create_roles', 'update_roles')
  @Get('select-all')
  @HttpCode(HttpStatus.OK)
  selectAll() {
    return this.roleTypesService.selectAll();
  }
}
