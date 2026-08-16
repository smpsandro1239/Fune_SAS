import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Ligação à base de dados estabelecida.');
    } catch (error) {
      this.logger.error(
        `Não foi possível ligar à base de dados: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
