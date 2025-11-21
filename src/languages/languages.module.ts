import { Module } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { RolesDataBuilder } from 'src/roles/builders/roles-data.builder';
import { UsersRepository } from 'src/users/users.repository';

@Module({
  controllers: [LanguagesController],
  providers: [LanguagesService, RolesDataBuilder, UsersRepository],
})
export class LanguagesModule {}
