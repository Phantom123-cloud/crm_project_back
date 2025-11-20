import { Global, Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { UploadsModule } from 'src/uploads/uploads.module';
import { UsersRepository } from 'src/users/users.repository';

@Global()
@Module({
  controllers: [FilesController],
  providers: [FilesService, UsersRepository],
  exports: [FilesService],
  imports: [UploadsModule],
})
export class FilesModule {}
