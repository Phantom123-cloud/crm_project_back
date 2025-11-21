import { Module } from '@nestjs/common';
import { CitizenshipsService } from './citizenships.service';
import { CitizenshipsController } from './citizenships.controller';
import { RolesDataBuilder } from 'src/roles/builders/roles-data.builder';
import { UsersRepository } from 'src/users/users.repository';

@Module({
  controllers: [CitizenshipsController],
  providers: [CitizenshipsService, RolesDataBuilder, UsersRepository],
})
export class CitizenshipsModule {}
