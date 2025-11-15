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
import { RolesService } from './roles.service';
import { IndividualRulesDto } from './dto/individual-rules.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly RolesService: RolesService) {}
  @Auth()
  @Post('create')
  // create_roles
  @HttpCode(HttpStatus.OK)
  createRole(
    @Body() dto: CreateRoleDto,
    @Query('roleTypeId') roleTypeId: string,
  ) {
    return this.RolesService.createRole(dto, roleTypeId);
  }
  @Auth()
  @Delete('delete/:id')
  // delete_roles
  @HttpCode(HttpStatus.OK)
  deleteRole(@Param('id') id: string) {
    return this.RolesService.deleteRole(id);
  }
  @Auth()
  @Put('update/:id')
  // update_roles
  @HttpCode(HttpStatus.OK)
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.RolesService.updateRole(id, dto);
  }

  @Auth()
  @Get('all')
  // view_roles
  @HttpCode(HttpStatus.OK)
  allRoles(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return this.RolesService.allRoles(page, limit);
  }

  @Get('full-info-roles-by-user/:id')
  @HttpCode(HttpStatus.OK)
  fullInformationOnRoles(@Param('id') id: string) {
    return this.RolesService.fullInformationOnRoles(id);
  }

  // @Auth()
  // @Post('create-individual-rules')
  // @HttpCode(HttpStatus.CREATED)
  // createIndividualRules(
  //   @Body() dto: IndividualRulesDto,
  //   @Query('userId') userId: string,
  // ) {
  //   return this.RolesService.createIndividualRules(dto, userId);
  // }
  // @Auth()
  // @Delete('delete-individual-rule/:id')
  // @HttpCode(HttpStatus.OK)
  // deleteIndividualRule(@Param('id') id: string) {
  //   return this.RolesService.deleteIndividualRule(id);
  // }
}
