import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../types/authenticated-user';
import { LOG_AUDIT_KEY } from '../decorators/audit.decorator';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as unknown as { user?: AuthenticatedUser }).user;

    const config = this.reflector.getAllAndOverride<{
      action?: string;
      entity?: string;
      skip?: boolean;
    }>(LOG_AUDIT_KEY, [context.getHandler(), context.getClass()]);

    // Auditoria apenas para pedidos autenticados com métodos de escrita,
    // exceto endpoints marcados para skip.
    if (!user || !WRITE_METHODS.has(request.method) || config?.skip) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        const entityId = this.extractEntityId(request, data);
        const action = config?.action ?? request.method;
        const entity =
          config?.entity ?? request.path.split('/').filter(Boolean).slice(1)[0] ?? 'unknown';

        this.prisma.auditLog
          .create({
            data: {
              agencyId: user.agencyId || undefined,
              userId: user.id,
              action,
              entity,
              entityId,
              meta: config ? undefined : { body: request.body ?? {} },
              ip: this.ip(request),
              userAgent: request.headers['user-agent']?.slice(0, 255),
            },
          })
          .catch(() => {
            // Falha de auditoria não deve quebrar a resposta.
          });

        return data;
      }),
    );
  }

  private extractEntityId(request: Request, data: unknown): string | undefined {
    const paramId = (request.params as Record<string, string> | undefined)?.id;
    if (paramId) return paramId;
    if (data && typeof data === 'object') {
      const id = (data as { id?: unknown }).id;
      return typeof id === 'string' ? id : undefined;
    }
    return undefined;
  }

  private ip(request: Request): string | undefined {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return request.ip?.slice(0, 255);
  }
}
