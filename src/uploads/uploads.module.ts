import { Global, Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';

@Global()
@Module({
  exports: [UploadsService],
  providers: [UploadsService],
})
export class UploadsModule {}
