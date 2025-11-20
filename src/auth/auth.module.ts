import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJwtConfig } from 'src/common/config/jwt.config';
import { RolesModule } from 'src/roles/roles.module';

// providers
import { AuthService } from './auth.service';
import { UsersRepository } from 'src/users/users.repository';
import { CreateSessionBuilder } from './builders/create-session.builder';
import { AuthRepository } from './repositories/auth.repository';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LoginUseCase } from './use-cases/login.usecase';
import { RegisterUseCase } from './use-cases/register.usecase';
import { UpdateAccountCredentialsUseCase } from './use-cases/update-account-credentials.usecase';
import { UserSessionUseCase } from './use-cases/user-session-usecase';
import { RoleTemplatesRepository } from 'src/role-templates/role-templates.repository';
import { TokenRepository } from './repositories/token.repository';
import { MeRolesBuilder } from 'src/roles/builders/me-roles.builder';
import { RolesDataBuilder } from 'src/roles/builders/roles-data.builder';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig,
    }),
    RolesModule,
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
    UsersRepository,
    RoleTemplatesRepository,
    TokenRepository,
    MeRolesBuilder,
    RolesDataBuilder,
  ],
  exports: [AuthService],
})
export class AuthModule {}
