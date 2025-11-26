import { Global, Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';

@Global()
@Module({
  exports: [AppGateway],
  providers: [AppGateway],
})
export class AppGatewayModule {}
