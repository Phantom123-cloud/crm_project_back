import { Module } from '@nestjs/common';
import { RoleTemplatesService } from './role-templates.service';
import { RoleTemplatesController } from './role-templates.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [RoleTemplatesController],
  providers: [RoleTemplatesService],
  imports: [UsersModule],
})
export class RoleTemplatesModule {}
