import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Auth } from './decorators/auth.decorator';
import { UpdateAccountCredentialsDto } from './dto/update-account-credentials.dto';
import { AuthRoles } from './decorators/auth-roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @AuthRoles('register_users')
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginDto,
  ) {
    return await this.authService.login(res, dto);
  }

  @Auth()
  @Post('logout/me')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    return await this.authService.logoutMe(res, req);
  }

  @Auth()
  @AuthRoles('logout_users')
  @Post('logout-user/:id')
  @HttpCode(HttpStatus.OK)
  async user(@Param('id') id: string, @Req() req: Request) {
    return await this.authService.logoutById(id, req);
  }

  @Auth()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return await this.authService.me(req, res);
  }

  @AuthRoles('update_accounts')
  @Put('update-account-credentials/:id')
  @HttpCode(HttpStatus.OK)
  async updateAccountCredentials(
    @Param('id') id: string,
    @Body() dto: Partial<UpdateAccountCredentialsDto>,
  ) {
    return await this.authService.updateAccountCredentials(dto, id);
  }
}
