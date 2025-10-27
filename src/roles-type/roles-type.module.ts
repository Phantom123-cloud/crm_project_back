import { Module } from '@nestjs/common';
import { RolesTypeService } from './roles-type.service';
import { RolesTypeController } from './roles-type.controller';

@Module({
  controllers: [RolesTypeController],
  providers: [RolesTypeService],
})
export class RolesTypeModule {}
