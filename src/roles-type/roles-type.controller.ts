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
} from '@nestjs/common';
import { RolesTypeService } from './roles-type.service';
import { RoleDto } from 'src/role/dto/role.dto';

@Controller('roles-type')
export class RolesTypeController {
  constructor(private readonly rolesTypeService: RolesTypeService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  createRoleType(@Body() dto: Required<RoleDto>) {
    return this.rolesTypeService.createRoleType(dto);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteRoleType(@Param('id') id: string) {
    return this.rolesTypeService.deleteRoleType(id);
  }

  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  updateRoleType(@Param('id') id: string, @Body() dto: RoleDto) {
    return this.rolesTypeService.updateRoleType(id, dto);
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  allRoleTypes() {
    return this.rolesTypeService.allRoleTypes();
  }
}
