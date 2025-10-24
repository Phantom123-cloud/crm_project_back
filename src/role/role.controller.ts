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
} from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleDto } from './dto/role.dto';
import { AuthRoles } from 'src/auth/decorators/auth-roles.decorator';
import { RoleTemplatesDto } from './dto/role-templates.dto';
import { IndividualRulesDto } from './dto/individual-rules.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // создание роли
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: RoleDto) {
    return this.roleService.create(dto);
  }
  // все роли
  @Get('all')
  @HttpCode(HttpStatus.OK)
  allRoles() {
    return this.roleService.allRoles();
  }

  // добавление или блокировка отдельных ролей
  @Post('create-individual-rules')
  @HttpCode(HttpStatus.CREATED)
  createIndividualRules(
    @Body() dto: IndividualRulesDto,
    @Query('userId') userId: string,
  ) {
    return this.roleService.createIndividualRules(dto, userId);
  }
  // удаление правил
  @Delete('delete-individual-rule/:id')
  @HttpCode(HttpStatus.CREATED)
  deleteIndividualRule(@Param('id') id: string) {
    return this.roleService.deleteIndividualRule(id);
  }
  
  // создание шаблона
  @Post('create-template')
  @HttpCode(HttpStatus.CREATED)
  createRoleTemplate(@Body() dto: RoleTemplatesDto) {
    return this.roleService.createRoleTemplate(dto);
  }

  @Delete('delete-template/:id')
  @HttpCode(HttpStatus.CREATED)
  deleteRoleTemplate(@Param('id') id: string) {
    return this.roleService.deleteRoleTemplate(id);
  }

  @Get('templates-all')
  @HttpCode(HttpStatus.OK)
  roleTemplatesAll() {
    return this.roleService.roleTemplatesAll();
  }
}
