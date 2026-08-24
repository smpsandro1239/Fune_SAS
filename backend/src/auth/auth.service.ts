import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from './dto/auth.dto';

const ACCESS_TOKEN_TYPE = 'access';
const REFRESH_TOKEN_TYPE = 'refresh';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new BadRequestException('Já existe um utilizador com este email.');
    }

    const slug =
      dto.agencySlug?.trim() ||
      dto.agencyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const agency = await tx.agency.create({
        data: {
          name: dto.agencyName,
          slug,
          address: dto.agencyAddress,
          location: dto.agencyLocation,
          subscriptionPlan: 'FREE',
        },
      });

      await tx.subscription.create({
        data: {
          agencyId: agency.id,
          plan: 'FREE',
          priceCents: 0,
        },
      });

      return tx.user.create({
        data: {
          agencyId: agency.id,
          name: dto.name,
          email: dto.email.toLowerCase(),
          passwordHash,
          role: UserRole.ADMIN,
        },
      });
    });

    // Boas-vindas (não bloqueia o registo se o email falhar)
    await this.emailService.sendWelcomeEmail(user.email, dto.agencyName);

    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<TokenPair> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email ou password incorretos.');
    }
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: { sub: string; type: string; refreshId: string };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }

    if (payload.type !== REFRESH_TOKEN_TYPE) {
      throw new UnauthorizedException('Token inválido.');
    }

    const stored = await this.prisma.refreshToken.findUnique({
      where: { id: payload.refreshId },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Sessão expirada, faça login novamente.');
    }

    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    if (stored.tokenHash !== hash) {
      throw new UnauthorizedException('Refresh token não reconhecido.');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.issueTokens(stored.user);
  }

  async logout(refreshToken: string): Promise<{ success: boolean }> {
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash: hash } });
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; token?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      return { message: 'Se o email existir, receberá um link de recuperação.' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    await this.prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
      update: {
        tokenHash,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    // O token nunca é devolvido na resposta — é enviado por email.
    const appUrl = process.env.APP_URL || 'https://fune-sas.vercel.app';
    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    const { sent } = await this.emailService.sendPasswordResetEmail(user.email, resetUrl);

    if (!sent) {
      // Sem serviço de email configurado (ou falha): em desenvolvimento
      // o token fica visível nos logs do servidor para testes locais.
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV] Reset URL para ${dto.email}: ${resetUrl}`);
      }
    }

    return {
      message: 'Se o email existir, receberá um link de recuperação.',
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Token de recuperação inválido ou expirado.');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.delete({ where: { id: resetToken.id } }),
      this.prisma.refreshToken.deleteMany({ where: { userId: resetToken.userId } }),
    ]);

    return { message: 'Password atualizada com sucesso.' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { agency: true },
    });
    if (!user) throw new UnauthorizedException('Utilizador não encontrado.');
    const { passwordHash, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Utilizador não encontrado.');

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
      if (existing) throw new ConflictException('Já existe um utilizador com este email.');
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email.toLowerCase();

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        agencyId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return updated;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Utilizador não encontrado.');

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('A password atual está incorreta.');

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      // Revoga todas as sessões ativas — tokens roubados deixam de valer
      this.prisma.refreshToken.deleteMany({ where: { userId } }),
    ]);
    return { success: true };
  }

  private async issueTokens(user: User): Promise<TokenPair> {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        agencyId: user.agencyId,
        type: ACCESS_TOKEN_TYPE,
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      },
    );

    const refreshId = crypto.randomUUID();
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        type: REFRESH_TOKEN_TYPE,
        refreshId,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      },
    );

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { id: refreshId, userId: user.id, tokenHash, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    };
  }
}
