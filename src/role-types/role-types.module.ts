import { Module } from '@nestjs/common';
import { RoleTypesController } from './role-types.controller';
import { RoleTypesService } from './role-types.service';


@Module({
  controllers: [RoleTypesController],
  providers: [RoleTypesService],
})
export class RoleTypesModule {}
