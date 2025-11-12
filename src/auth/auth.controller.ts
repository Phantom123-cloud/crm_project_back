import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenService } from 'src/token/token.service';
import { Auth } from './decorators/auth.decorator';
import { AuthRoles } from './decorators/auth-roles.decorator';
import { UsersService } from 'src/users/users.service';
import { UpdateAccountCredentialsDto } from './dto/update-account-credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
  ) {}

  // @AuthRoles('register_users')
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
    return await this.tokenService.logout(res, req);
  }

  @Auth()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return await this.usersService.me(req, res);
  }

  @Put('update-account-credentials/:id')
  @HttpCode(HttpStatus.OK)
  async updateAccountCredentials(
    @Param('id') id: string,
    @Body() dto: Partial<UpdateAccountCredentialsDto>,
  ) {
    return await this.authService.updateAccountCredentials(dto, id);
  }

  @AuthRoles('logout_users')
  @Post('logout/:id')
  @HttpCode(HttpStatus.OK)
  async logoutById(@Param('id') id: string) {
    return await this.tokenService.logoutById(id);
  }
}
