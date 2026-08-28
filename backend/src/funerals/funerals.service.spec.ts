import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FuneralsService } from './funerals.service';
import { PrismaService } from '../prisma/prisma.service';
import { PlanLimitsService } from '../subscriptions/plan-limits.service';

describe('FuneralsService', () => {
  let service: FuneralsService;
  let prisma: {
    funeral: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    deceased: { findFirst: jest.Mock };
    condolence: { findMany: jest.Mock; findFirst: jest.Mock; update: jest.Mock; delete: jest.Mock };
  };
  let planLimits: { assertCanCreateFuneral: jest.Mock };

  const user = { id: 'user-1', agencyId: 'agency-1' };

  beforeEach(async () => {
    prisma = {
      funeral: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      deceased: { findFirst: jest.fn() },
      condolence: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    planLimits = { assertCanCreateFuneral: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FuneralsService,
        { provide: PrismaService, useValue: prisma },
        { provide: PlanLimitsService, useValue: planLimits },
      ],
    }).compile();

    service = module.get<FuneralsService>(FuneralsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('lista funerais da agência sem filtros', async () => {
      prisma.funeral.findMany.mockResolvedValue([]);
      await service.findAll(user as never, {});

      expect(prisma.funeral.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { agencyId: 'agency-1' } }),
      );
    });

    it('aplica status, intervalo de datas e pesquisa no nome do falecido', async () => {
      prisma.funeral.findMany.mockResolvedValue([]);
      await service.findAll(user as never, {
        status: 'SCHEDULED',
        from: '2026-01-01',
        to: '2026-02-01',
        search: 'silva',
      });

      expect(prisma.funeral.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            agencyId: 'agency-1',
            status: 'SCHEDULED',
            funeralDate: { gte: expect.any(Date), lte: expect.any(Date) },
            deceased: { fullName: { contains: 'silva', mode: 'insensitive' } },
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('devolve o funeral com documentos quando existe na agência', async () => {
      prisma.funeral.findFirst.mockResolvedValue({ id: 'f-1' });
      const result = await service.findOne(user as never, 'f-1');
      expect(result).toEqual({ id: 'f-1' });
      expect(prisma.funeral.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'f-1', agencyId: 'agency-1' } }),
      );
    });

    it('lança NotFoundException quando não existe', async () => {
      prisma.funeral.findFirst.mockResolvedValue(null);
      await expect(service.findOne(user as never, 'nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const dto = {
      deceasedId: 'd-1',
      serviceType: 'CERIMONIA' as const,
      funeralDate: new Date('2026-01-15'),
      funeralTime: '10:00',
      locationParish: 'Ventosa',
      publicNoticeEnabled: true,
    };

    it('cria funeral validando o limite do plano e o falecido da agência', async () => {
      prisma.deceased.findFirst.mockResolvedValue({ id: 'd-1' });
      prisma.funeral.create.mockResolvedValue({ id: 'f-1' });

      const result = await service.create(user as never, dto as never);

      expect(result).toEqual({ id: 'f-1' });
      expect(planLimits.assertCanCreateFuneral).toHaveBeenCalledWith('agency-1');
      expect(prisma.funeral.create).toHaveBeenCalled();
    });

    it('lança NotFoundException quando o falecido não pertence à agência', async () => {
      prisma.deceased.findFirst.mockResolvedValue(null);
      await expect(service.create(user as never, dto as never)).rejects.toThrow(NotFoundException);
      expect(prisma.funeral.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('atualiza funerais da própria agência', async () => {
      prisma.funeral.findFirst.mockResolvedValue({ id: 'f-1' });
      prisma.funeral.update.mockResolvedValue({ id: 'f-1' });

      const result = await service.update(user as never, 'f-1', { notes: 'x' } as never);
      expect(result).toEqual({ id: 'f-1' });
      expect(prisma.funeral.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'f-1' } }),
      );
    });

    it('lança NotFoundException para funerais de outra agência', async () => {
      prisma.funeral.findFirst.mockResolvedValue(null);
      await expect(service.update(user as never, 'f-x', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('elimina funerais da própria agência', async () => {
      prisma.funeral.findFirst.mockResolvedValue({ id: 'f-1' });
      const result = await service.remove(user as never, 'f-1');
      expect(result).toEqual({ success: true });
      expect(prisma.funeral.delete).toHaveBeenCalledWith({ where: { id: 'f-1' } });
    });

    it('lança NotFoundException quando não existe', async () => {
      prisma.funeral.findFirst.mockResolvedValue(null);
      await expect(service.remove(user as never, 'f-x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('historyByAgency', () => {
    it('devolve o histórico recente da agência', async () => {
      prisma.funeral.findMany.mockResolvedValue([]);
      await service.historyByAgency(user as never);
      expect(prisma.funeral.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { agencyId: 'agency-1' }, take: 50 }),
      );
    });
  });

  describe('condolencesQueue', () => {
    it('filtra pendentes quando approved=false', async () => {
      prisma.condolence.findMany.mockResolvedValue([]);
      await service.condolencesQueue(user as never, false);
      expect(prisma.condolence.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { funeral: { agencyId: 'agency-1' }, approved: false },
        }),
      );
    });

    it('não filtra por approved quando undefined', async () => {
      prisma.condolence.findMany.mockResolvedValue([]);
      await service.condolencesQueue(user as never);
      expect(prisma.condolence.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { funeral: { agencyId: 'agency-1' } },
        }),
      );
    });
  });

  describe('listCondolences', () => {
    it('lista condolências de um funeral da agência', async () => {
      prisma.funeral.findFirst.mockResolvedValue({ id: 'f-1' });
      prisma.condolence.findMany.mockResolvedValue([]);
      await service.listCondolences(user as never, 'f-1');
      expect(prisma.condolence.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { funeralId: 'f-1' } }),
      );
    });

    it('lança NotFoundException para funeral de outra agência', async () => {
      prisma.funeral.findFirst.mockResolvedValue(null);
      await expect(service.listCondolences(user as never, 'f-x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('setCondolenceApproval', () => {
    it('aprova uma condolência do funeral', async () => {
      prisma.funeral.findFirst.mockResolvedValue({ id: 'f-1' });
      prisma.condolence.findFirst.mockResolvedValue({ id: 'c-1' });
      prisma.condolence.update.mockResolvedValue({ id: 'c-1', approved: true });

      const result = await service.setCondolenceApproval(user as never, 'f-1', 'c-1', true);
      expect(prisma.condolence.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { approved: true } }),
      );
      expect(result).toEqual({ id: 'c-1', approved: true });
    });

    it('lança NotFoundException quando a condolência não existe', async () => {
      prisma.funeral.findFirst.mockResolvedValue({ id: 'f-1' });
      prisma.condolence.findFirst.mockResolvedValue(null);
      await expect(
        service.setCondolenceApproval(user as never, 'f-1', 'c-x', true),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeCondolence', () => {
    it('elimina a condolência do funeral', async () => {
      prisma.funeral.findFirst.mockResolvedValue({ id: 'f-1' });
      prisma.condolence.findFirst.mockResolvedValue({ id: 'c-1' });
      const result = await service.removeCondolence(user as never, 'f-1', 'c-1');
      expect(result).toEqual({ success: true });
      expect(prisma.condolence.delete).toHaveBeenCalledWith({ where: { id: 'c-1' } });
    });

    it('lança NotFoundException quando não existe', async () => {
      prisma.funeral.findFirst.mockResolvedValue({ id: 'f-1' });
      prisma.condolence.findFirst.mockResolvedValue(null);
      await expect(service.removeCondolence(user as never, 'f-1', 'c-x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
