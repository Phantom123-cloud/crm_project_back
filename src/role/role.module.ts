import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [RoleController],
  providers: [RoleService],
  imports: [UsersModule],
})
export class RoleModule {}
