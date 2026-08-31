import { Test, TestingModule } from '@nestjs/testing';
import { AgendaService } from './agenda.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AgendaService', () => {
  let service: AgendaService;
  let prisma: {
    agendaItem: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      agendaItem: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AgendaService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AgendaService>(AgendaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should list agenda items for an agency within a date range', async () => {
      const mock = [{ id: '1', title: 'Reunião' }];
      prisma.agendaItem.findMany.mockResolvedValue(mock);

      const result = await service.findAll('agency-1', '2026-09-01', '2026-09-30');

      expect(result).toEqual(mock);
      expect(prisma.agendaItem.findMany).toHaveBeenCalledWith({
        where: {
          agencyId: 'agency-1',
          date: { gte: new Date('2026-09-01'), lte: new Date('2026-09-30') },
        },
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
      });
    });

    it('should list agenda items without range when not provided', async () => {
      prisma.agendaItem.findMany.mockResolvedValue([]);
      await service.findAll('agency-1');
      expect(prisma.agendaItem.findMany).toHaveBeenCalledWith({
        where: { agencyId: 'agency-1' },
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
      });
    });
  });

  describe('findOne', () => {
    it('should return an item if found', async () => {
      prisma.agendaItem.findFirst.mockResolvedValue({ id: '1' });
      const result = await service.findOne('1', 'agency-1');
      expect(result).toEqual({ id: '1' });
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.agendaItem.findFirst.mockResolvedValue(null);
      await expect(service.findOne('x', 'agency-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new item with defaults', async () => {
      const dto = { date: '2026-09-01', title: 'Reunião' };
      const created = { id: 'new', ...dto, agencyId: 'agency-1', createdById: 'user-1' };
      prisma.agendaItem.create.mockResolvedValue(created);

      const result = await service.create(dto as any, 'agency-1', 'user-1');
      expect(result).toEqual(created);
      expect(prisma.agendaItem.create).toHaveBeenCalledWith({
        data: {
          agencyId: 'agency-1',
          createdById: 'user-1',
          date: new Date('2026-09-01'),
          time: null,
          title: 'Reunião',
          description: null,
          color: 'gold',
        },
      });
    });
  });

  describe('update', () => {
    it('should update an existing item', async () => {
      prisma.agendaItem.findFirst.mockResolvedValue({ id: '1' });
      prisma.agendaItem.update.mockResolvedValue({ id: '1', title: 'Novo' });

      const result = await service.update('1', { title: 'Novo' }, 'agency-1');
      expect(result.title).toBe('Novo');
    });

    it('should throw if not found', async () => {
      prisma.agendaItem.findFirst.mockResolvedValue(null);
      await expect(service.update('x', {}, 'agency-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an item', async () => {
      prisma.agendaItem.findFirst.mockResolvedValue({ id: '1' });
      prisma.agendaItem.delete.mockResolvedValue({ id: '1' });
      const result = await service.remove('1', 'agency-1');
      expect(result).toHaveProperty('id', '1');
    });

    it('should throw if not found', async () => {
      prisma.agendaItem.findFirst.mockResolvedValue(null);
      await expect(service.remove('x', 'agency-1')).rejects.toThrow(NotFoundException);
    });
  });
});
