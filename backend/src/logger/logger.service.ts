import { Injectable, LoggerService, Scope } from '@nestjs/common';
import pino, { Logger as PinoLogger } from 'pino';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerServiceAdapter implements LoggerService {
  private logger: PinoLogger;

  constructor() {
    this.logger = this.createPino();
  }

  private createPino(): PinoLogger {
    const opts: pino.LoggerOptions = {
      level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          '*.password',
          '*.passwordHash',
          '*.currentPassword',
          '*.newPassword',
          '*.oldPassword',
          '*.confirmPassword',
        ],
        censor: '[REDACTED]',
      },
    };

    if (process.env.NODE_ENV !== 'production') {
      opts.transport = {
        target: 'pino-pretty',
        options: { colorize: true, singleLine: true, translateTime: 'SYS:HH:MM:ss' },
      };
    }

    return pino(opts);
  }

  log(message: unknown, context?: string) {
    this.logger.info({ context }, this.format(message));
  }
  error(message: unknown, trace?: string, context?: string) {
    this.logger.error({ context, err: trace ? { stack: trace } : undefined }, this.format(message));
  }
  warn(message: unknown, context?: string) {
    this.logger.warn({ context }, this.format(message));
  }
  debug?(message: unknown, context?: string) {
    this.logger.debug({ context }, this.format(message));
  }
  verbose?(message: unknown, context?: string) {
    this.logger.trace({ context }, this.format(message));
  }
  fatal?(message: unknown, context?: string) {
    this.logger.fatal({ context }, this.format(message));
  }

  private format(message: unknown): string {
    return typeof message === 'string' ? message : JSON.stringify(message);
  }

  getPino(): PinoLogger {
    return this.logger;
  }
}
