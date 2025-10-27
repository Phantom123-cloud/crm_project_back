import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RoleTemplatesService } from './role-templates.service';
import { RoleTemplatesDto } from './dto/role-templates.dto';
import { ChangingRolesTemplateDto } from './dto/changing-roles-template.dto';
import { RoleDto } from 'src/role/dto/role.dto';

@Controller('role-templates')
export class RoleTemplatesController {
  constructor(private readonly roleTemplatesService: RoleTemplatesService) {}

  // создание шаблона
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  createRoleTemplate(@Body() dto: RoleTemplatesDto) {
    return this.roleTemplatesService.createRoleTemplate(dto);
  }

  // удаление шаблона
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteRoleTemplate(@Param('id') id: string) {
    return this.roleTemplatesService.deleteRoleTemplate(id);
  }

  // изменение ролей в шаблоне
  @Delete('changing-roles/:id')
  @HttpCode(HttpStatus.OK)
  changingRolesTemplate(
    @Param('id') id: string,
    dto: ChangingRolesTemplateDto,
  ) {
    return this.roleTemplatesService.changingRolesTemplate(id, dto);
  }

  // изменение ролей в шаблоне
  @Delete('change-name/:id')
  @HttpCode(HttpStatus.OK)
  changeNameRolesTemplate(@Param('id') id: string, dto: RoleDto) {
    return this.roleTemplatesService.changeNameRolesTemplate(id, dto);
  }

  @Patch('assign')
  @HttpCode(HttpStatus.OK)
  assignRoleTemplate(
    @Query('userId') userId: string,
    @Query('roleTemplatesId') roleTemplatesId: string,
  ) {
    return this.roleTemplatesService.assignRoleTemplate(
      userId,
      roleTemplatesId,
    );
  }

  @Patch('revoke')
  @HttpCode(HttpStatus.OK)
  revokeRoleTemplate(
    @Query('userId') userId: string,
    @Query('roleTemplatesId') roleTemplatesId: string,
  ) {
    return this.roleTemplatesService.revokeRoleTemplate(
      userId,
      roleTemplatesId,
    );
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  roleTemplatesAll() {
    return this.roleTemplatesService.roleTemplatesAll();
  }
}
