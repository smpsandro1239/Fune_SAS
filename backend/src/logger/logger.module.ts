import { Global, Module } from '@nestjs/common';
import { LoggerServiceAdapter } from './logger.service';

@Global()
@Module({
  providers: [LoggerServiceAdapter],
  exports: [LoggerServiceAdapter],
})
export class LoggerModule {}
