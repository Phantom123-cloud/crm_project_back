import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TokenModule } from 'src/token/token.module';
import { RolesModule } from 'src/roles/roles.module';
import { RoleTemplatesModule } from 'src/role-templates/role-templates.module';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
  imports: [forwardRef(() => TokenModule), RolesModule, RoleTemplatesModule],
})
export class UsersModule {}
