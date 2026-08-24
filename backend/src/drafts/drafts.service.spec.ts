import { Test, TestingModule } from '@nestjs/testing';
import { DraftsService } from './drafts.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('DraftsService', () => {
  let service: DraftsService;
  let prisma: {
    flyerDraft: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      flyerDraft: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [DraftsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<DraftsService>(DraftsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all drafts for an agency', async () => {
      const mockDrafts = [{ id: '1', name: 'Draft 1' }];
      prisma.flyerDraft.findMany.mockResolvedValue(mockDrafts);

      const result = await service.findAll('agency-1');

      expect(result).toEqual(mockDrafts);
      expect(prisma.flyerDraft.findMany).toHaveBeenCalledWith({
        where: { agencyId: 'agency-1' },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, name: true, layoutStyle: true, createdAt: true, updatedAt: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a draft if found', async () => {
      const mockDraft = { id: '1', name: 'Draft 1', data: {} };
      prisma.flyerDraft.findFirst.mockResolvedValue(mockDraft);

      const result = await service.findOne('1', 'agency-1');
      expect(result).toEqual(mockDraft);
    });

    it('should throw NotFoundException if draft not found', async () => {
      prisma.flyerDraft.findFirst.mockResolvedValue(null);
      await expect(service.findOne('nonexistent', 'agency-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new draft', async () => {
      const body = { name: 'Test', layoutStyle: 'elegante-minimal', data: { title: 'X' } };
      const created = { id: 'new', ...body, agencyId: 'agency-1', userId: 'user-1' };
      prisma.flyerDraft.create.mockResolvedValue(created);

      const result = await service.create(body, 'agency-1', 'user-1');
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update an existing draft', async () => {
      prisma.flyerDraft.findFirst.mockResolvedValue({ id: '1' });
      prisma.flyerDraft.update.mockResolvedValue({ id: '1', name: 'Updated' });

      const result = await service.update('1', { name: 'Updated' }, 'agency-1');
      expect(result.name).toBe('Updated');
    });

    it('should throw if draft not found', async () => {
      prisma.flyerDraft.findFirst.mockResolvedValue(null);
      await expect(service.update('x', {}, 'agency-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a draft', async () => {
      prisma.flyerDraft.findFirst.mockResolvedValue({ id: '1' });
      prisma.flyerDraft.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1', 'agency-1');
      expect(result).toHaveProperty('id', '1');
    });

    it('should throw if draft not found', async () => {
      prisma.flyerDraft.findFirst.mockResolvedValue(null);
      await expect(service.remove('x', 'agency-1')).rejects.toThrow(NotFoundException);
    });
  });
});
