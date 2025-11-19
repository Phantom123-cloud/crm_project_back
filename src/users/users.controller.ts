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
    @Query('isFullData', ParseBoolPipe) isFullData: boolean,
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
      isFullData,
    });
  }
  @Auth()
  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async userById(@Param('id') id: string) {
    return await this.usersService.userById(id);
  }

  @Auth()
  @Put('is-active/:id')
  @HttpCode(HttpStatus.OK)
  async isActiveUser(@Param('id') id: string, @Req() req: Request) {
    return await this.usersService.isActiveUser(id, req);
  }
}
