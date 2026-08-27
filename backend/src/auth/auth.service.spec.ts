import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { EmailService } from '../email/email.service';

describe('AuthService — refresh token', () => {
  let service: AuthService;

  const emailService = {} as EmailService;

  const user = {
    id: 'user-1',
    agencyId: 'agency-1',
    name: 'Admin',
    email: 'admin@test.pt',
    role: UserRole.ADMIN,
    passwordHash: 'x',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const refreshToken = {
    id: 'refresh-1',
    userId: user.id,
    tokenHash: '',
    expiresAt: new Date(Date.now() + 100000),
    createdAt: new Date(),
  };
  // hash do token em si não é validado nos testes abaixo, apenas o lookup da BD
  refreshToken.tokenHash = crypto.createHash('sha256').update('anything').digest('hex');

  const prisma = {
    refreshToken: {
      findUnique: jest.fn(),
      delete: jest.fn().mockResolvedValue({}),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest.fn().mockResolvedValue({}),
    },
    user: { findUnique: jest.fn().mockResolvedValue(user) },
  };

  const jwtService = {
    signAsync: jest.fn().mockResolvedValue('signed-token'),
    verifyAsync: jest.fn(),
  };

  /** Fábrica de registo já com o hash correto do token que será usado no teste */
  const storedFor = (rawToken: string, overrides: Partial<typeof refreshToken> = {}) => ({
    ...refreshToken,
    tokenHash: crypto.createHash('sha256').update(rawToken).digest('hex'),
    user,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(prisma as never, jwtService as never, emailService);
  });

  const validPayload = { sub: user.id, type: 'refresh', refreshId: 'refresh-1' };

  it('rotaciona e devolve um novo par de tokens num refresh válido', async () => {
    jwtService.verifyAsync.mockResolvedValue(validPayload);
    prisma.refreshToken.findUnique.mockResolvedValue(storedFor('valid-refresh-token'));

    const pair = await service.refresh('valid-refresh-token');

    expect(pair.accessToken).toBe('signed-token');
    expect(pair.refreshToken).toBe('signed-token');
    expect(prisma.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 'refresh-1' } });
  });

  it('revoga TODAS as sessões do utilizador na reutilização de um token já usado', async () => {
    // O refreshId era válido na JWT mas o registo já não existe na BD (foi rotacionado)
    jwtService.verifyAsync.mockResolvedValue(validPayload);
    prisma.refreshToken.findUnique.mockResolvedValue(null);

    await expect(service.refresh('reused-token')).rejects.toThrow(UnauthorizedException);

    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: user.id } });
  });

  it('revoga sessões quando o hash não coincide (token adulterado com refreshId válido)', async () => {
    jwtService.verifyAsync.mockResolvedValue(validPayload);
    // Registro existe mas o hash do token não bate com o número armazenado
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

  it('rejeita refresh expirado na BD (expiresAt no passado) sem revogar sessões', async () => {
    jwtService.verifyAsync.mockResolvedValue(validPayload);
    prisma.refreshToken.findUnique.mockResolvedValue(
      storedFor('expired', { expiresAt: new Date(Date.now() - 1000) }),
    );

    await expect(service.refresh('expired')).rejects.toThrow(UnauthorizedException);
    // Sem reutilização — apenas token expirado
    expect(prisma.refreshToken.deleteMany).not.toHaveBeenCalled();
  });
});
