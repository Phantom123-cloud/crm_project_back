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
import { RolesDto } from 'src/roles/dto/roles.dto';
import { RoleTypesService } from './role-types.service';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('role-types')
export class RoleTypesController {
  constructor(private readonly roleTypesService: RoleTypesService) {}
  @Auth()
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  createRoleType(@Body() dto: Required<RolesDto>) {
    return this.roleTypesService.createRoleType(dto);
  }
  @Auth()
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteRoleType(@Param('id') id: string) {
    return this.roleTypesService.deleteRoleType(id);
  }
  @Auth()
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  updateRoleType(@Param('id') id: string, @Body() dto: RolesDto) {
    return this.roleTypesService.updateRoleType(id, dto);
  }
  @Auth()
  @Get('all')
  @HttpCode(HttpStatus.OK)
  allRoleTypes() {
    return this.roleTypesService.allRoleTypes();
  }
}
