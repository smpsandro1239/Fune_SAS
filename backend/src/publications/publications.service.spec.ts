import { Test, TestingModule } from '@nestjs/testing';
import { PublicationsService } from './publications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PublicationsService', () => {
  let service: PublicationsService;
  let prisma: {
    publication: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    funeral: { findFirst: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      publication: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      funeral: {
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicationsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<PublicationsService>(PublicationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all publications for an agency', async () => {
      const mockPubs = [{ id: '1', title: 'Test Pub', status: 'DRAFT' }];
      prisma.publication.findMany.mockResolvedValue(mockPubs);

      const result = await service.findAll('agency-1');
      expect(result).toEqual(mockPubs);
      expect(prisma.publication.findMany).toHaveBeenCalledWith({
        where: { agencyId: 'agency-1' },
        include: {
          funeral: {
            select: { id: true, funeralDate: true, deceased: { select: { fullName: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by status', async () => {
      prisma.publication.findMany.mockResolvedValue([]);

      await service.findAll('agency-1', 'SCHEDULED');
      expect(prisma.publication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'SCHEDULED' }) }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a publication if found', async () => {
      const mockPub = { id: '1', title: 'Test', agencyId: 'agency-1' };
      prisma.publication.findFirst.mockResolvedValue(mockPub);

      const result = await service.findOne('agency-1', '1');
      expect(result).toEqual(mockPub);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.publication.findFirst.mockResolvedValue(null);
      await expect(service.findOne('agency-1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a DRAFT publication when no scheduledFor', async () => {
      const dto = { title: 'Test', caption: 'Caption', platform: 'FACEBOOK' };
      const created = { id: 'new', ...dto, agencyId: 'agency-1', status: 'DRAFT' };
      prisma.publication.create.mockResolvedValue(created);

      const result = await service.create('agency-1', 'user-1', dto);
      expect(result.status).toBe('DRAFT');
    });

    it('should create a SCHEDULED publication when scheduledFor is provided', async () => {
      const dto = {
        title: 'Test',
        caption: 'Caption',
        platform: 'FACEBOOK',
        scheduledFor: '2026-12-01T10:00:00Z',
      };
      prisma.publication.create.mockResolvedValue({ id: 'new', status: 'SCHEDULED' });

      const result = await service.create('agency-1', 'user-1', dto);
      expect(result.status).toBe('SCHEDULED');
    });

    it('should throw if funeral not found', async () => {
      prisma.funeral.findFirst.mockResolvedValue(null);
      const dto = { title: 'Test', caption: 'Caption', platform: 'FACEBOOK', funeralId: 'bad-id' };

      await expect(service.create('agency-1', 'user-1', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing publication', async () => {
      prisma.publication.findFirst.mockResolvedValue({ id: '1', agencyId: 'agency-1' });
      prisma.publication.update.mockResolvedValue({ id: '1', title: 'Updated' });

      const result = await service.update('agency-1', '1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('should throw if publication not found', async () => {
      prisma.publication.findFirst.mockResolvedValue(null);
      await expect(service.update('agency-1', 'x', {})).rejects.toThrow(NotFoundException);
    });

    it('should reject invalid status transitions', async () => {
      prisma.publication.findFirst.mockResolvedValue({ id: '1', agencyId: 'agency-1' });

      await expect(service.update('agency-1', '1', { status: 'PUBLISHED' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a publication', async () => {
      prisma.publication.findFirst.mockResolvedValue({ id: '1', agencyId: 'agency-1' });
      prisma.publication.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('agency-1', '1');
      expect(result).toHaveProperty('success', true);
    });

    it('should throw if publication not found', async () => {
      prisma.publication.findFirst.mockResolvedValue(null);
      await expect(service.remove('agency-1', 'x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markPublished / markFailed', () => {
    it('should mark as published with externalPostId', async () => {
      prisma.publication.update.mockResolvedValue({
        id: '1',
        status: 'PUBLISHED',
        externalPostId: 'fb_123',
      });

      const result = await service.markPublished('1', 'fb_123');
      expect(result.status).toBe('PUBLISHED');
      expect(result.externalPostId).toBe('fb_123');
    });

    it('should mark as failed with error message', async () => {
      prisma.publication.update.mockResolvedValue({
        id: '1',
        status: 'FAILED',
        errorMessage: 'API error',
      });

      const result = await service.markFailed('1', 'API error');
      expect(result.status).toBe('FAILED');
      expect(result.errorMessage).toBe('API error');
    });
  });
});
