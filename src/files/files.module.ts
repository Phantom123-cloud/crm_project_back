import { Global, Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { UploadsModule } from 'src/uploads/uploads.module';
import { UsersRepository } from 'src/users/users.repository';
import { RolesDataBuilder } from 'src/roles/builders/roles-data.builder';

@Global()
@Module({
  controllers: [FilesController],
  providers: [FilesService, RolesDataBuilder, UsersRepository],
  exports: [FilesService],
  imports: [UploadsModule],
})
export class FilesModule {}
