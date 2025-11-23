import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJwtConfig } from 'src/common/config/jwt.config';

import { AuthService } from './auth.service';
import { CreateSessionBuilder } from './builders/create-session.builder';
import { AuthRepository } from './repositories/auth.repository';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LoginUseCase } from './use-cases/login.usecase';
import { RegisterUseCase } from './use-cases/register.usecase';
import { UpdateAccountCredentialsUseCase } from './use-cases/update-account-credentials.usecase';
import { UserSessionUseCase } from './use-cases/user-session-usecase';
import { TokenRepository } from './repositories/token.repository';
import { RoleTemplatesModule } from 'src/role-templates/role-templates.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    RoleTemplatesModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    AuthRepository,
    RegisterUseCase,
    LoginUseCase,
    UserSessionUseCase,
    CreateSessionBuilder,
    UpdateAccountCredentialsUseCase,
    TokenRepository,
  ],
  exports: [AuthService],
})
export class AuthModule {}
