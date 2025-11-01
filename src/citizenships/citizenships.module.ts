import { Module } from '@nestjs/common';
import { CitizenshipsService } from './citizenships.service';
import { CitizenshipsController } from './citizenships.controller';

@Module({
  controllers: [CitizenshipsController],
  providers: [CitizenshipsService],
})
export class CitizenshipsModule {}
