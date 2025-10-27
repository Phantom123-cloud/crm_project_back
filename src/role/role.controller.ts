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
import { RoleService } from './role.service';
import { RoleDto } from './dto/role.dto';
import { IndividualRulesDto } from './dto/individual-rules.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  createRole(
    @Body() dto: Required<RoleDto>,
    @Query('roleTypeId') roleTypeId: string,
  ) {
    return this.roleService.createRole(dto, roleTypeId);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteRole(@Param('id') id: string) {
    return this.roleService.deleteRole(id);
  }

  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  updateRole(@Param('id') id: string, @Body() dto: RoleDto) {
    return this.roleService.updateRole(id, dto);
  }

  // все роли
  @Get('all')
  @HttpCode(HttpStatus.OK)
  allRoles(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.roleService.allRoles(page, limit);
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
  @HttpCode(HttpStatus.OK)
  deleteIndividualRule(@Param('id') id: string) {
    return this.roleService.deleteIndividualRule(id);
  }
}
