import { Test, TestingModule } from '@nestjs/testing';
import { WhatsAppService } from './whatsapp.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WhatsAppService', () => {
  let service: WhatsAppService;
  let prisma: { agency: { findUnique: jest.Mock } };

  const options = { to: '351912345678', message: 'Mensagem de teste' };

  beforeEach(async () => {
    prisma = { agency: { findUnique: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [WhatsAppService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<WhatsAppService>(WhatsAppService);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendForAgency', () => {
    it('não envia (sent:false) quando a agência não configurou WhatsApp', async () => {
      prisma.agency.findUnique.mockResolvedValue({
        id: 'agency-1',
        whatsappPhoneNumberId: null,
        whatsappAccessToken: null,
      });

      const result = await service.sendForAgency('agency-1', options);
      expect(result.sent).toBe(false);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('envia com sucesso usando as credenciais da agência', async () => {
      prisma.agency.findUnique.mockResolvedValue({
        id: 'agency-1',
        whatsappPhoneNumberId: '123456789',
        whatsappAccessToken: 'EAAG_token',
      });
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      const result = await service.sendForAgency('agency-1', options);

      expect(result.sent).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/123456789/messages'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer EAAG_token',
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('"to":"351912345678"'),
        }),
      );
    });

    it('devolve sent:false quando a API Meta responde com erro', async () => {
      prisma.agency.findUnique.mockResolvedValue({
        id: 'agency-1',
        whatsappPhoneNumberId: '123456789',
        whatsappAccessToken: 'EAAG_token',
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => '{"error":{"message":"invalid"}}',
      });

      const result = await service.sendForAgency('agency-1', options);
      expect(result.sent).toBe(false);
    });

    it('não lança e devolve sent:false quando o fetch rebenta', async () => {
      prisma.agency.findUnique.mockResolvedValue({
        id: 'agency-1',
        whatsappPhoneNumberId: '123456789',
        whatsappAccessToken: 'EAAG_token',
      });
      (global.fetch as jest.Mock).mockRejectedValue(new Error('network down'));

      const result = await service.sendForAgency('agency-1', options);
      expect(result.sent).toBe(false);
    });
  });

  describe('send', () => {
    it('envia texto com preview desativado e recipient individual', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      const result = await service.send('999', 'token', options);
      expect(result.sent).toBe(true);

      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.messaging_product).toBe('whatsapp');
      expect(body.recipient_type).toBe('individual');
      expect(body.type).toBe('text');
      expect(body.text).toEqual({ preview_url: false, body: 'Mensagem de teste' });
    });
  });
});
