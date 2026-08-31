import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class SseAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const queryToken = (request.query as Record<string, string | undefined>).token;
    const authHeader = (request.headers as Record<string, string | undefined>)['authorization'];
    const raw = queryToken || (authHeader && authHeader.replace(/^Bearer\s+/i, '')) || '';

    if (!raw) throw new UnauthorizedException('Token de autenticação em falta.');

    let payload: { sub: string; email?: string; name?: string; role?: string; agencyId?: string };
    try {
      payload = this.jwtService.verify<{
        sub: string;
        email?: string;
        name?: string;
        role?: string;
        agencyId?: string;
      }>(raw, { secret: process.env.JWT_ACCESS_SECRET });
    } catch {
      throw new UnauthorizedException('Token de autenticação inválido ou expirado.');
    }

    if (!payload.sub || !payload.agencyId) {
      throw new UnauthorizedException('Token de autenticação inválido.');
    }

    (request as unknown as { user?: unknown }).user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      agencyId: payload.agencyId,
    };

    return true;
  }
}
