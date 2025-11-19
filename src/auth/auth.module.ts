import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJwtConfig } from 'src/common/config/jwt.config';
import { RolesModule } from 'src/roles/roles.module';
import { providers } from './providers';

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
  providers,
  exports: [AuthService],
})
export class AuthModule {}
