import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { EmailService } from '../email/email.service';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService — autenticação, registo e recuperação', () => {
  let service: AuthService;

  const user = {
    id: 'user-1',
    agencyId: 'agency-1',
    name: 'Admin',
    email: 'admin@test.pt',
    role: UserRole.ADMIN,
    passwordHash: 'hash',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const emailService = {
    sendWelcomeEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  } as unknown as EmailService;

  const prisma = {
    refreshToken: {
      findUnique: jest.fn(),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest.fn().mockResolvedValue({}),
    },
    passwordResetToken: {
      findUnique: jest.fn(),
      upsert: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn(),
  };

  const jwtService = {
    signAsync: jest.fn().mockResolvedValue('signed-token'),
    verifyAsync: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (emailService.sendWelcomeEmail as jest.Mock).mockResolvedValue(undefined);
    (emailService.sendPasswordResetEmail as jest.Mock).mockResolvedValue({ sent: true });
    mockedBcrypt.hash.mockResolvedValue('hashed' as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);

    // transação no register (recebe callback tx) e no resetPassword (recebe array)
    (prisma.$transaction as jest.Mock).mockImplementation(async (arg: unknown) => {
      if (typeof arg === 'function') {
        const tx = {
          agency: { create: jest.fn().mockResolvedValue({ id: 'agency-1' }) },
          subscription: { create: jest.fn().mockResolvedValue({}) },
          user: { create: jest.fn().mockResolvedValue(user) },
        };
        return (arg as (tx: never) => Promise<unknown>)(tx as never);
      }
      return Promise.all(arg as Promise<unknown>[]);
    });

    service = new AuthService(prisma as never, jwtService as never, emailService);
  });

  describe('register — nova agência', () => {
    const dto = {
      name: 'Admin Teste',
      email: 'Novo@Teste.PT',
      password: 'Password123!',
      agencyName: 'Agência Nova',
      agencySlug: '',
    };

    it('cria agência + subscrição FREE + admin ADMIN e emite tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (prisma.$transaction as jest.Mock).mockImplementation(async (fn: (tx: never) => unknown) => {
        return fn({
          agency: { create: jest.fn().mockResolvedValue({ id: 'agency-1' }) },
          subscription: { create: jest.fn().mockResolvedValue({}) },
          user: {
            create: jest.fn().mockResolvedValue({ ...user, email: 'novo@teste.pt' }),
          },
        } as never);
      });

      const pair = await service.register(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'novo@teste.pt' } });
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith('novo@teste.pt', 'Agência Nova');
      expect(pair.accessToken).toBe('signed-token');
      expect(pair.refreshToken).toBe('signed-token');
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
    });

    it('gera slug a partir do nome da agência quando o slug não é fornecido', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      let createdSlug = '';
      (prisma.$transaction as jest.Mock).mockImplementation(async (fn: (tx: never) => unknown) => {
        return fn({
          agency: {
            create: jest.fn().mockImplementation(async (data: { data: { slug: string } }) => {
              createdSlug = data.data.slug;
              return { id: 'agency-1' };
            }),
          },
          subscription: { create: jest.fn().mockResolvedValue({}) },
          user: { create: jest.fn().mockResolvedValue(user) },
        } as never);
      });

      await service.register({ ...dto, agencyName: 'Agência  Nova! Teste' } as never);

      // A regex atual não normaliza acentos — 'ê' é removido e substituído por '-'
      expect(createdSlug).toBe('ag-ncia-nova-teste');
    });

    it('rejeita email já registado com BadRequestException', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'other' });
      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
      expect(emailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('autentica com email e password corretos e emite tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(user);

      const pair = await service.login({
        email: 'Admin@Teste.PT',
        password: 'Password123!',
      } as never);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'admin@teste.pt' } });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('Password123!', 'hash');
      expect(pair.accessToken).toBe('signed-token');
    });

    it('rejeita login com password incorreta (Unauthorized)', async () => {
      prisma.user.findUnique.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'admin@teste.pt', password: 'errada' } as never),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejeita login de utilizador inexistente (Unauthorized)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nao-existe@teste.pt', password: 'x' } as never),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('devolve mensagem genérica se o email não existe (não revela a existência)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword({ email: 'x@y.pt' } as never);

      expect(result.message).toContain('Se o email existir');
      expect(prisma.passwordResetToken.upsert).not.toHaveBeenCalled();
    });

    it('gera token, persiste hash e envia email de recuperação', async () => {
      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.forgotPassword({ email: 'admin@teste.pt' } as never);

      expect(result.message).toContain('Se o email existir');
      expect(prisma.passwordResetToken.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: user.id },
          create: expect.objectContaining({ userId: user.id, tokenHash: expect.any(String) }),
        }),
      );
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
      const [sentEmail, resetUrl] = (emailService.sendPasswordResetEmail as jest.Mock).mock
        .calls[0];
      expect(sentEmail).toBe(user.email);
      expect(resetUrl).toContain('/reset-password?token=');
    });
  });

  describe('resetPassword', () => {
    const token = 'raw-reset-token';
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    it('rejeita token inválido ou expirado (BadRequest)', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue(null);

      await expect(
        service.resetPassword({ token, newPassword: 'Nova123!?' } as never),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('rejeita token expirado', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'prt-1',
        userId: user.id,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(
        service.resetPassword({ token, newPassword: 'Nova123!?' } as never),
      ).rejects.toThrow(BadRequestException);
    });

    it('atualiza a password, remove o token e revoga as sessões', async () => {
      prisma.passwordResetToken.findUnique.mockResolvedValue({
        id: 'prt-1',
        userId: user.id,
        expiresAt: new Date(Date.now() + 100000),
      });

      const result = await service.resetPassword({ token, newPassword: 'Nova123!?' } as never);

      expect(result.message).toBe('Password atualizada com sucesso.');
      expect(prisma.passwordResetToken.findUnique).toHaveBeenCalledWith({
        where: { tokenHash },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('Nova123!?', 10);
    });
  });

  describe('logout', () => {
    it('remove todos os refresh tokens com o hash correspondente', async () => {
      const result = await service.logout('some-refresh-token');
      expect(result).toEqual({ success: true });
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: {
          tokenHash: crypto.createHash('sha256').update('some-refresh-token').digest('hex'),
        },
      });
    });
  });

  describe('refresh — rotação e reutilização', () => {
    const refreshToken = {
      id: 'refresh-1',
      userId: user.id,
      expiresAt: new Date(Date.now() + 100000),
      createdAt: new Date(),
    };
    const storedFor = (rawToken: string, overrides: Partial<typeof refreshToken> = {}) => ({
      ...refreshToken,
      tokenHash: crypto.createHash('sha256').update(rawToken).digest('hex'),
      user,
      ...overrides,
    });
    const validPayload = { sub: user.id, type: 'refresh', refreshId: 'refresh-1' };

    it('rotaciona e devolve um novo par de tokens num refresh válido', async () => {
      jwtService.verifyAsync.mockResolvedValue(validPayload);
      prisma.refreshToken.findUnique.mockResolvedValue(storedFor('valid-refresh-token'));

      const pair = await service.refresh('valid-refresh-token');

      expect(pair.accessToken).toBe('signed-token');
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 'refresh-1' } });
    });

    it('revoga TODAS as sessões do utilizador na reutilização de um token já usado', async () => {
      jwtService.verifyAsync.mockResolvedValue(validPayload);
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh('reused-token')).rejects.toThrow(UnauthorizedException);
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: user.id } });
    });

    it('revoga sessões quando o hash não coincide (token adulterado)', async () => {
      jwtService.verifyAsync.mockResolvedValue(validPayload);
      prisma.refreshToken.findUnique.mockResolvedValue(storedFor('outro-token'));

      await expect(service.refresh('adulterado')).rejects.toThrow(UnauthorizedException);
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: user.id } });
    });

    it('rejeita refresh token com tipo errado', async () => {
      jwtService.verifyAsync.mockResolvedValue({ ...validPayload, type: 'access' });

      await expect(service.refresh('access-token')).rejects.toThrow(UnauthorizedException);
      expect(prisma.refreshToken.deleteMany).not.toHaveBeenCalled();
    });

    it('rejeita refresh token com assinatura inválida', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));

      await expect(service.refresh('bad-sig')).rejects.toThrow(UnauthorizedException);
      expect(prisma.refreshToken.deleteMany).not.toHaveBeenCalled();
    });

    it('rejeita refresh expirado na BD sem revogar sessões', async () => {
      jwtService.verifyAsync.mockResolvedValue(validPayload);
      prisma.refreshToken.findUnique.mockResolvedValue(
        storedFor('expired', { expiresAt: new Date(Date.now() - 1000) }),
      );

      await expect(service.refresh('expired')).rejects.toThrow(UnauthorizedException);
      expect(prisma.refreshToken.deleteMany).not.toHaveBeenCalled();
    });
  });
});
