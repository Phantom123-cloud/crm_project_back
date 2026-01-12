import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RoleTemplatesService } from './role-templates.service';
import { RoleTemplatesDto } from './dto/role-templates.dto';
import { UpdateRoleTemplateDto } from './dto/update-role-template.dto';
import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';
import { PaginationBasic } from 'src/common/dto-global/pagination.dto';

@Controller('role-templates')
export class RoleTemplatesController {
  constructor(private readonly roleTemplatesService: RoleTemplatesService) {}

  @AuthRoles('create_templates')
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  createRoleTemplate(@Body() dto: RoleTemplatesDto) {
    return this.roleTemplatesService.createRoleTemplate(dto);
  }

  @AuthRoles('delete_templates')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteRoleTemplate(@Param('id') id: string) {
    return this.roleTemplatesService.deleteRoleTemplate(id);
  }

  @AuthRoles('update_templates')
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  updateRoleTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateRoleTemplateDto,
  ) {
    return this.roleTemplatesService.updateRoleTemplate(id, dto);
  }

  @AuthRoles('view_templates')
  @Get('all')
  @HttpCode(HttpStatus.OK)
  allRoleTemplates(@Query() dto: PaginationBasic) {
    return this.roleTemplatesService.allRoleTemplates(dto);
  }

  @AuthRoles('register_users', 'update_account_roles')
  @Get('select-all')
  @HttpCode(HttpStatus.OK)
  allRoleTemplatesSelect() {
    return this.roleTemplatesService.allRoleTemplatesSelect();
  }

  @AuthRoles('view_templates')
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  allRoleTemplatesById(@Param('id') id: string) {
    return this.roleTemplatesService.roleTemplatesById(id);
  }
}
