import { Module } from '@nestjs/common';
import { DeceasedService } from './deceased.service';
import { DeceasedController } from './deceased.controller';

@Module({
  providers: [DeceasedService],
  controllers: [DeceasedController],
})
export class DeceasedModule {}
