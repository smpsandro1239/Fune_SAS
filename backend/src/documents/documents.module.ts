import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { UploadsCleanupService } from './uploads-cleanup.service';

@Module({
  providers: [DocumentsService, UploadsCleanupService],
  controllers: [DocumentsController],
})
export class DocumentsModule {}
