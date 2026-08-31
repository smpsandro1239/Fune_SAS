import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PublicService } from './public.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('PublicService', () => {
  let service: PublicService;
  let prisma: {
    agency: { findUnique: jest.Mock };
    funeral: { findFirst: jest.Mock };
    condolence: { create: jest.Mock };
  };
  let emailService: { send: jest.Mock };
  let whatsappService: { sendForAgency: jest.Mock };
  let notificationsService: { create: jest.Mock };

  const agencyFull = {
    id: 'agency-1',
    condolenceModeration: false,
    name: 'Casa Hortas',
    email: 'geral@casahortas.com',
    whatsappNotifyNumber: '351912345678',
    whatsappPhoneNumberId: '123456789',
    whatsappAccessToken: 'EAAG_token',
  };

  beforeEach(async () => {
    prisma = {
      agency: { findUnique: jest.fn() },
      funeral: { findFirst: jest.fn() },
      condolence: { create: jest.fn() },
    };
    emailService = { send: jest.fn().mockResolvedValue(undefined) };
    whatsappService = { sendForAgency: jest.fn().mockResolvedValue({ sent: true }) };
    notificationsService = { create: jest.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailService, useValue: emailService },
        { provide: WhatsAppService, useValue: whatsappService },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get<PublicService>(PublicService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFuneralBySlug', () => {
    it('lança NotFoundException quando a agência não existe', async () => {
      prisma.agency.findUnique.mockResolvedValue(null);
      await expect(service.getFuneralBySlug('nao-existe', 'f-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lança NotFoundException quando o funeral não é público', async () => {
      prisma.agency.findUnique.mockResolvedValue({ id: 'agency-1' });
      prisma.funeral.findFirst.mockResolvedValue(null);
      await expect(service.getFuneralBySlug('casa-hortas', 'f-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('devolve agência e funeral público', async () => {
      prisma.agency.findUnique.mockResolvedValue({ id: 'agency-1', name: 'Casa Hortas' });
      prisma.funeral.findFirst.mockResolvedValue({ id: 'f-1', serviceType: 'CERIMONIA' });

      const result = await service.getFuneralBySlug('casa-hortas', 'f-1');
      expect(result.agency.name).toBe('Casa Hortas');
      expect(result.funeral.id).toBe('f-1');
    });
  });

  describe('generateIcs', () => {
    const icsFuneral = {
      id: 'f-1',
      funeralDate: new Date('2026-07-08T17:00:00.000Z'),
      funeralTime: '17:00',
      locationParish: 'Igreja Paroquial da Ventosa, Braga',
      cemeteryLocation: null,
      wakeLocation: null,
      deceased: { fullName: 'LUÍS FILIPE DA SILVA FREITAS' },
    };

    it('lança NotFoundException quando a agência não existe', async () => {
      prisma.agency.findUnique.mockResolvedValue(null);
      await expect(service.generateIcs('nao-existe', 'f-1')).rejects.toThrow(NotFoundException);
    });

    it('lança NotFoundException quando o funeral não é público', async () => {
      prisma.agency.findUnique.mockResolvedValue({ id: 'agency-1', name: 'Casa Hortas' });
      prisma.funeral.findFirst.mockResolvedValue(null);
      await expect(service.generateIcs('casa-hortas', 'f-1')).rejects.toThrow(NotFoundException);
    });

    it('gera um iCal RFC-5545 válido com CRLF e blocos esperados', async () => {
      prisma.agency.findUnique.mockResolvedValue({ id: 'agency-1', name: 'Casa Hortas' });
      prisma.funeral.findFirst.mockResolvedValue(icsFuneral);

      const ics = await service.generateIcs('casa-hortas', 'f-1');

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('PRODID:-//Fune_SAS//PT');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('END:VEVENT');
      expect(ics).toContain('END:VCALENDAR');
      expect(ics).toContain('UID:f-1@fune-sas');
      expect(ics).toContain('DTSTART:20260708T170000Z');
      expect(ics).toContain('DTEND:20260708T190000Z');
      expect(ics).toContain('SUMMARY:Fúnebre de LUÍS FILIPE DA SILVA FREITAS');
      expect(ics).toContain('LOCATION:Igreja Paroquial da Ventosa, Braga');
      expect(ics).toContain('DESCRIPTION:Casa Hortas');
      expect(ics).toContain('DTSTAMP:');
      expect(ics.endsWith('\r\n')).toBe(true);
      expect(ics).toMatch(/DTSTAMP:\d{8}T\d{6}Z/);
    });

    it('usa cemeteryLocation quando locationParish não existe', async () => {
      prisma.agency.findUnique.mockResolvedValue({ id: 'agency-1', name: 'Casa Hortas' });
      prisma.funeral.findFirst.mockResolvedValue({
        ...icsFuneral,
        locationParish: null,
        cemeteryLocation: 'Crematório de Braga',
      });

      const ics = await service.generateIcs('casa-hortas', 'f-1');
      expect(ics).toContain('LOCATION:Crematório de Braga');
    });

    it('usa wakeLocation quando não há parish nem cemitério', async () => {
      prisma.agency.findUnique.mockResolvedValue({ id: 'agency-1', name: 'Casa Hortas' });
      prisma.funeral.findFirst.mockResolvedValue({
        ...icsFuneral,
        locationParish: null,
        cemeteryLocation: null,
        wakeLocation: 'Capela da Ventosa',
      });

      const ics = await service.generateIcs('casa-hortas', 'f-1');
      expect(ics).toContain('LOCATION:Capela da Ventosa');
    });

    it('usa a hora de funeralDate quando funeralTime não existe', async () => {
      prisma.agency.findUnique.mockResolvedValue({ id: 'agency-1', name: 'Casa Hortas' });
      prisma.funeral.findFirst.mockResolvedValue({
        ...icsFuneral,
        funeralTime: null,
        funeralDate: new Date('2026-07-08T09:30:00.000Z'),
      });

      const ics = await service.generateIcs('casa-hortas', 'f-1');
      expect(ics).toContain('DTSTART:20260708T093000Z');
    });
  });

  describe('addCondolence', () => {
    const dto = { authorName: 'Família Silva', message: 'Os nossos pêsames.' } as never;

    it('ignora pedidos com honeypot preenchido (spam)', async () => {
      const result = await service.addCondolence('casa-hortas', 'f-1', {
        authorName: 'Bot',
        message: 'spam',
        website: 'http://spam.example',
      } as never);
      expect(result.success).toBe(true);
      expect(prisma.condolence.create).not.toHaveBeenCalled();
    });

    it('lança NotFoundException quando a agência não existe', async () => {
      prisma.agency.findUnique.mockResolvedValue(null);
      await expect(service.addCondolence('x', 'f-1', dto)).rejects.toThrow(NotFoundException);
    });

    it('lança NotFoundException quando o funeral não é público', async () => {
      prisma.agency.findUnique.mockResolvedValue(agencyFull);
      prisma.funeral.findFirst.mockResolvedValue(null);
      await expect(service.addCondolence('x', 'f-1', dto)).rejects.toThrow(NotFoundException);
    });

    it('valida o comprimento do nome e da mensagem', async () => {
      prisma.agency.findUnique.mockResolvedValue(agencyFull);
      prisma.funeral.findFirst.mockResolvedValue({ id: 'f-1' });

      await expect(
        service.addCondolence('x', 'f-1', { authorName: 'A', message: 'ok mensagem' } as never),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.addCondolence('x', 'f-1', { authorName: 'Família', message: 'abc' } as never),
      ).rejects.toThrow(BadRequestException);
    });

    it('cria condolência aprovada quando a moderação está desligada', async () => {
      prisma.agency.findUnique.mockResolvedValue({ ...agencyFull, condolenceModeration: false });
      prisma.funeral.findFirst.mockResolvedValue({ id: 'f-1' });
      prisma.condolence.create.mockResolvedValue({
        id: 'c-1',
        authorName: 'Família Silva',
        message: 'Os nossos pêsames.',
      });

      const result = await service.addCondolence('casa-hortas', 'f-1', dto);

      expect(result.success).toBe(true);
      expect(result.moderated).toBe(false);
      expect(prisma.condolence.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ approved: true }) }),
      );
      // Notificações internas + email + whatsapp
      expect(notificationsService.create).toHaveBeenCalled();
      expect(emailService.send).toHaveBeenCalled();
      expect(whatsappService.sendForAgency).toHaveBeenCalled();
    });

    it('cria condolência pendente quando a moderação está ligada', async () => {
      prisma.agency.findUnique.mockResolvedValue({ ...agencyFull, condolenceModeration: true });
      prisma.funeral.findFirst.mockResolvedValue({ id: 'f-1' });
      prisma.condolence.create.mockResolvedValue({
        id: 'c-1',
        authorName: 'Família Silva',
        message: 'Os nossos pêsames.',
      });

      const result = await service.addCondolence('casa-hortas', 'f-1', dto);

      expect(result.moderated).toBe(true);
      expect(prisma.condolence.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ approved: false }) }),
      );
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Aguarda aprovação') }),
      );
    });
  });
});
