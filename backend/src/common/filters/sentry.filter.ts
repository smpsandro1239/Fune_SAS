import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as Sentry from '@sentry/node';

@Catch()
export class SentryFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= 500) {
      // Captura apenas erros de servidor (5xx) no Sentry.
      Sentry.captureException(exception, {
        extra: {
          method: request.method,
          url: request.originalUrl,
          ip: request.ip,
          user: (request as unknown as { user?: unknown }).user,
        },
      });
      this.logger.error(
        exception instanceof Error ? exception.stack || exception.message : String(exception),
        undefined,
        `${request.method} ${request.originalUrl}`,
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.originalUrl} -> ${status} ${this.message(exception)}`,
      );
    }

    const body =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            statusCode: status,
            message: 'Erro interno do servidor.',
            path: request.originalUrl,
          };

    response
      .status(status)
      .json(
        typeof body === 'string'
          ? { statusCode: status, message: body, path: request.originalUrl }
          : body,
      );
  }

  private message(exception: unknown): string {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      return typeof res === 'string'
        ? res
        : ((res as { message?: unknown }).message?.toString() ?? 'error');
    }
    return exception instanceof Error ? exception.message : String(exception);
  }
}
