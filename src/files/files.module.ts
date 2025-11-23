import { Global, Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { UploadsModule } from 'src/uploads/uploads.module';
import { UsersModule } from 'src/users/users.module';

@Global()
@Module({
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
  imports: [UploadsModule, UsersModule],
})
export class FilesModule {}
