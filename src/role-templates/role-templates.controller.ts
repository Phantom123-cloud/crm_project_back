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
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('role-templates')
export class RoleTemplatesController {
  constructor(private readonly roleTemplatesService: RoleTemplatesService) {}

  // @AuthRoles('create_templates')
  @Auth()
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  createRoleTemplate(@Body() dto: RoleTemplatesDto) {
    return this.roleTemplatesService.createRoleTemplate(dto);
  }

  // @AuthRoles('delete_templates')
  @Auth()
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteRoleTemplate(@Param('id') id: string) {
    return this.roleTemplatesService.deleteRoleTemplate(id);
  }

  // @AuthRoles('update_templates')
  @Auth()
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  updateRoleTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateRoleTemplateDto,
  ) {
    return this.roleTemplatesService.updateRoleTemplate(id, dto);
  }

  // @AuthRoles('view_templates')
  @Auth()
  @Get('all')
  @HttpCode(HttpStatus.OK)
  allRoleTemplates() {
    return this.roleTemplatesService.allRoleTemplates();
  }

  // @AuthRoles('view_template')
  @Auth()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  allRoleTemplatesById(@Param('id') id: string) {
    return this.roleTemplatesService.roleTemplatesById(id);
  }
}
