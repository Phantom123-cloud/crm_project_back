import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import type { Request } from 'express';

// import { UseUploadFiles } from 'src/uploads/decorators/upload-file.decorator';
// import { UpdateUserByIdDto } from './dto/update-user-by-id.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth()
  @Get('all')
  @HttpCode(HttpStatus.OK)
  async allUsers(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('isActive', new ParseBoolPipe({ optional: true }))
    isActive?: boolean,
    @Query('isOnline', new ParseBoolPipe({ optional: true }))
    isOnline?: boolean,
  ) {
    return await this.usersService.allUsers({
      page,
      limit,
      isActive,
      isOnline,
    });
  }

  @Auth()
  @Post('logout-user/:id')
  @HttpCode(HttpStatus.OK)
  async user(@Param('id') id: string, @Req() req: Request) {
    return await this.usersService.logoutByUserId(id, req);
  }

  @Auth()
  @Put('is-active/:id')
  @HttpCode(HttpStatus.OK)
  async isActiveUser(@Param('id') id: string, @Req() req: Request) {
    return await this.usersService.isActiveUser(id, req);
  }

  // @AuthRoles('ADMIN')
  // @Patch('is-active/:id')
  // @HttpCode(HttpStatus.OK)
  // async isActive(@Param('id') id: string, @Req() req: Request) {
  //   return await this.usersService.isActive(id, req);
  // }

  // @Auth()
  // @Put('update-user/:id')
  // @HttpCode(HttpStatus.OK)
  // @UseUploadFiles(1, 1, 'avatars', ['image/jpeg', 'image/png', 'image/webp'])
  // async updateUserById(
  //   @Body() dto: UpdateUserByIdDto,
  //   @Param('id') id: string,
  //   @Req() req: Request,
  //   @UploadedFiles() files: Array<Express.Multer.File>,
  // ) {
  //   return await this.usersService.updateUserById(dto, id, req, files);
  // }

  // @Auth()
  // @Get('for-project')
  // @HttpCode(HttpStatus.OK)
  // async usersForProject(@Req() req: Request) {
  //   return await this.usersService.usersForProject(req);
  // }
}
