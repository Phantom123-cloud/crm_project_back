import { forwardRef, Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [RoleController],
  providers: [RoleService],
  imports: [forwardRef(() => UsersModule)],
  exports: [RoleService],
})
export class RoleModule {}
