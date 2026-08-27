import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: {
    funeral: { findMany: jest.Mock; count: jest.Mock; groupBy: jest.Mock };
    document: { count: jest.Mock };
    flyerTemplate: { count: jest.Mock };
  };

  const user = { id: 'user-1', agencyId: 'agency-1' };

  const funeralRow = {
    id: 'f-1',
    serviceType: 'CERIMONIA',
    status: 'COMPLETED',
    funeralDate: new Date('2026-01-15T10:00:00Z'),
    funeralTime: '10:00',
    locationParish: 'Ventosa',
    cemeteryLocation: 'Cemitério de Ventosa',
    wakeLocation: null,
    publicNoticeEnabled: true,
    createdAt: new Date('2026-01-10T09:00:00Z'),
    deceased: { fullName: 'JOÃO; SILVA', age: 82, dateOfDeath: new Date('2026-01-09T00:00:00Z') },
    _count: { condolences: 3, documents: 2 },
  };

  beforeEach(async () => {
    prisma = {
      funeral: { findMany: jest.fn(), count: jest.fn(), groupBy: jest.fn() },
      document: { count: jest.fn() },
      flyerTemplate: { count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('exportFunerals', () => {
    it('gera CSV com BOM, separador ; e campos escapados com aspas', async () => {
      prisma.funeral.findMany.mockResolvedValue([funeralRow]);

      const result = await service.exportFunerals(user as never, {});

      expect(result.count).toBe(1);
      expect(result.content.startsWith('\uFEFF')).toBe(true);

      const lines = result.content.replace(/^\uFEFF/, '').split('\r\n');
      expect(lines[0]).toContain('Falecido');
      expect(lines[0]).toContain('Tipo de Serviço');

      // Falecido tem ; no nome → deve estar entre aspas
      expect(lines[1]).toContain('"JOÃO; SILVA"');
      expect(lines[1]).toContain('CERIMONIA');
      expect(lines[1]).toContain('COMPLETED');
      // Nota pública Sim
      expect(lines[1]).toContain('Sim;3;2');
    });

    it('usa intervalo de datas quando fornecido', async () => {
      prisma.funeral.findMany.mockResolvedValue([]);

      await service.exportFunerals(user as never, { from: '2026-01-01', to: '2026-02-01' });

      expect(prisma.funeral.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            agencyId: 'agency-1',
          }),
        }),
      );
    });
  });

  describe('funeralsPerPeriod', () => {
    it('agrupa funerais por mês', async () => {
      prisma.funeral.findMany.mockResolvedValue([
        { funeralDate: new Date('2026-01-05T00:00:00Z') },
        { funeralDate: new Date('2026-01-20T00:00:00Z') },
        { funeralDate: new Date('2026-02-01T00:00:00Z') },
      ]);

      const result = await service.funeralsPerPeriod(user as never, 'month', {});

      expect(result.total).toBe(3);
      expect(result.periods).toEqual([
        { period: '2026-01', count: 2 },
        { period: '2026-02', count: 1 },
      ]);
    });
  });

  describe('servicesUsage', () => {
    it('devolve totais e percentagens por tipo de serviço', async () => {
      prisma.funeral.groupBy.mockResolvedValue([
        { serviceType: 'CERIMONIA', _count: { serviceType: 2 } },
        { serviceType: 'CREMACAO', _count: { serviceType: 1 } },
      ]);

      const result = await service.servicesUsage(user as never, {});

      expect(result.total).toBe(3);
      expect(result.services).toEqual([
        { serviceType: 'CERIMONIA', count: 2, percentage: 67 },
        { serviceType: 'CREMACAO', count: 1, percentage: 33 },
      ]);
    });
  });

  describe('dashboardSummary', () => {
    it('devolve contagens resumidas', async () => {
      prisma.funeral.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(5);
      prisma.document.count.mockResolvedValue(20);
      prisma.flyerTemplate.count.mockResolvedValue(4);

      const result = await service.dashboardSummary(user as never);

      expect(result).toEqual({
        funerals: 10,
        completed: 3,
        scheduled: 5,
        documents: 20,
        templates: 4,
      });
    });
  });
});
