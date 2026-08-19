import { Module } from '@nestjs/common';
import { DocumentsGeneratorController } from './documents-generator.controller';
import { DocumentsGeneratorService } from './documents-generator.service';

@Module({
  controllers: [DocumentsGeneratorController],
  providers: [DocumentsGeneratorService],
})
export class DocumentsGeneratorModule {}
