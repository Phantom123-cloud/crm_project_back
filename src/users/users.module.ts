import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RolesModule } from 'src/roles/roles.module';
import { RoleTemplatesModule } from 'src/role-templates/role-templates.module';
import { UsersRepository } from './users.repository';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  imports: [RolesModule, RoleTemplatesModule],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
