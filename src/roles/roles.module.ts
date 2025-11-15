import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RoleTemplatesModule } from 'src/role-templates/role-templates.module';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
  imports: [RoleTemplatesModule],
})
export class RolesModule {}
