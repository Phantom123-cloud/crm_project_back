import { Injectable } from '@nestjs/common';
import type { Response, Request } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateAccountCredentialsDto } from './dto/update-account-credentials.dto';
import { RegisterUseCase } from './use-cases/register.usecase';
import { LoginUseCase } from './use-cases/login.usecase';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UpdateAccountCredentialsUseCase } from './use-cases/update-account-credentials.usecase';
import { UserSessionUseCase } from './use-cases/user-session-usecase';
import { AppGateway } from 'src/gateway/app.gateway';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly updateAccountCredentialsUseCase: UpdateAccountCredentialsUseCase,
    private readonly userSessionUseCase: UserSessionUseCase,
  ) {}

  async register(dto: RegisterDto) {
    return this.registerUseCase.register(dto);
  }

  async login(res: Response, dto: LoginDto) {
    return this.loginUseCase.login(res, dto);
  }

  async updateAccountCredentials(
    dto: Partial<UpdateAccountCredentialsDto>,
    userId: string,
  ) {
    return this.updateAccountCredentialsUseCase.updateAccountCredentials(
      dto,
      userId,
    );
  }

  async validate(id: string): Promise<JwtPayload> {
    return this.userSessionUseCase.validate(id);
  }

  async me(req: Request, res: Response) {
    return this.userSessionUseCase.me(req, res);
  }

  async logoutMe(res: Response, req: Request) {
    return this.userSessionUseCase.logoutMe(res, req);
  }

  async logoutById(id: string, req: Request) {
    return this.userSessionUseCase.logoutById(id, req);
  }
}
