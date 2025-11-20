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
import { RoleTypesService } from './role-types.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateRoleDto } from 'src/roles/dto/create-role.dto';
import { UpdateRoleTypeDto } from './dto/update-role-type.dto';

@Controller('role-types')
export class RoleTypesController {
  constructor(private readonly roleTypesService: RoleTypesService) {}
  @Auth()
  // @AuthRoles('create_role_types')
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  createRoleType(@Body() dto: CreateRoleDto) {
    return this.roleTypesService.create(dto);
  }
  @Auth()
  // @AuthRoles('delete_role_types')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteRoleType(@Param('id') id: string) {
    return this.roleTypesService.delete(id);
  }

  @Auth()
  // @AuthRoles('update_role_types')
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  updateRoleType(@Param('id') id: string, @Body() dto: UpdateRoleTypeDto) {
    return this.roleTypesService.update(id, dto);
  }

  // @AuthRoles('view_role_types')
  @Auth()
  @Get('all')
  @HttpCode(HttpStatus.OK)
  allRoleTypes() {
    return this.roleTypesService.all();
  }
}
