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
  Put,
  Query,
} from '@nestjs/common';
import { RoleTemplatesService } from './role-templates.service';
import { RoleTemplatesDto } from './dto/role-templates.dto';
import { UpdateRoleTemplateDto } from './dto/update-role-template.dto';
import { RolesDto } from 'src/roles/dto/roles.dto';

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
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  updateRoleTemplate(@Param('id') id: string, dto: UpdateRoleTemplateDto) {
    return this.roleTemplatesService.updateRoleTemplate(id, dto);
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
  allRoleTemplates() {
    return this.roleTemplatesService.allRoleTemplates();
  }
}
