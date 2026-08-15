import { Module } from '@nestjs/common';
import { FuneralsService } from './funerals.service';
import { FuneralsController } from './funerals.controller';

@Module({
  providers: [FuneralsService],
  controllers: [FuneralsController],
})
export class FuneralsModule {}
