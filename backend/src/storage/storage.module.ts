import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';

/** Módulo global: o storage é partilhado por documentos e futuros módulos com ficheiros */
@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
