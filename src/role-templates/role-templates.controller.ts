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

  @Auth()
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  createRoleTemplate(@Body() dto: RoleTemplatesDto) {
    return this.roleTemplatesService.createRoleTemplate(dto);
  }

  @Auth()
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteRoleTemplate(@Param('id') id: string) {
    return this.roleTemplatesService.deleteRoleTemplate(id);
  }

  @Auth()
  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  updateRoleTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateRoleTemplateDto,
  ) {
    return this.roleTemplatesService.updateRoleTemplate(id, dto);
  }
  // @Auth()
  // @Patch('assign')
  // @HttpCode(HttpStatus.OK)
  // assignRoleTemplate(
  //   @Query('userId') userId: string,
  //   @Query('roleTemplatesId') roleTemplatesId: string,
  // ) {
  //   return this.roleTemplatesService.assignRoleTemplate(
  //     userId,
  //     roleTemplatesId,
  //   );
  // }
  // @Auth()
  // @Patch('revoke')
  // @HttpCode(HttpStatus.OK)
  // revokeRoleTemplate(
  //   @Query('userId') userId: string,
  //   @Query('roleTemplatesId') roleTemplatesId: string,
  // ) {
  //   return this.roleTemplatesService.revokeRoleTemplate(
  //     userId,
  //     roleTemplatesId,
  //   );
  // }
  @Auth()
  @Get('all')
  @HttpCode(HttpStatus.OK)
  allRoleTemplates() {
    return this.roleTemplatesService.allRoleTemplates();
  }
  @Auth()
  @Get('all-select')
  @HttpCode(HttpStatus.OK)
  getSelectTeamplates() {
    return this.roleTemplatesService.getSelectTeamplates();
  }

  // @Auth()
  // @Get('/:id')
  // @HttpCode(HttpStatus.OK)
  // getTemplateById(@Param('id') id: string) {
  //   return this.roleTemplatesService.getTemplateById(id);
  // }

  @Auth()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  allRoleTemplatesById(@Param('id') id: string) {
    return this.roleTemplatesService.roleTemplatesById(id);
  }

  @Auth()
  @Get('by-not-id/:id')
  @HttpCode(HttpStatus.OK)
  getRolesNotInTemplate(@Param('id') id: string) {
    return this.roleTemplatesService.getRolesNotInTemplate(id);
  }
}
