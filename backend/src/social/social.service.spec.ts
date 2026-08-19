import { Test, TestingModule } from '@nestjs/testing';
import { SocialService } from './social.service';
import { PrismaService } from '../prisma/prisma.service';
import { PublicationsService } from '../publications/publications.service';

describe('SocialService', () => {
  let service: SocialService;
  let prisma: {
    agency: { findUnique: jest.Mock };
    publication: { findUnique: jest.Mock };
  };
  let publicationsService: {
    markPublished: jest.Mock;
    markFailed: jest.Mock;
    getScheduledForCron: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      agency: { findUnique: jest.fn() },
      publication: { findUnique: jest.fn() },
    };
    publicationsService = {
      markPublished: jest.fn().mockResolvedValue({}),
      markFailed: jest.fn().mockResolvedValue({}),
      getScheduledForCron: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialService,
        { provide: PrismaService, useValue: prisma },
        { provide: PublicationsService, useValue: publicationsService },
      ],
    }).compile();

    service = module.get<SocialService>(SocialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publishToFacebook', () => {
    it('should return error if Facebook Page not configured', async () => {
      prisma.agency.findUnique.mockResolvedValue({ id: 'agency-1', facebookPageId: null });

      const result = await service.publishToFacebook('agency-1', 'pub-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Facebook Page não configurada');
    });

    it('should return error if publication not found', async () => {
      prisma.agency.findUnique.mockResolvedValue({ id: 'agency-1', facebookPageId: '12345' });
      prisma.publication.findUnique.mockResolvedValue(null);

      const result = await service.publishToFacebook('agency-1', 'nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toContain('não encontrada');
    });

    it('should publish successfully (mock)', async () => {
      prisma.agency.findUnique.mockResolvedValue({ id: 'agency-1', facebookPageId: '12345' });
      prisma.publication.findUnique.mockResolvedValue({ id: 'pub-1', title: 'Test' });

      const result = await service.publishToFacebook('agency-1', 'pub-1');
      expect(result.success).toBe(true);
      expect(result.postId).toMatch(/^fb_mock_/);
      expect(publicationsService.markPublished).toHaveBeenCalled();
    });
  });

  describe('publishToInstagram', () => {
    it('should return error if Instagram not configured', async () => {
      prisma.agency.findUnique.mockResolvedValue({ id: 'agency-1', instagramAccount: null });

      const result = await service.publishToInstagram('agency-1', 'pub-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Instagram não configurado');
    });

    it('should publish successfully (mock)', async () => {
      prisma.agency.findUnique.mockResolvedValue({ id: 'agency-1', instagramAccount: 'myaccount' });
      prisma.publication.findUnique.mockResolvedValue({ id: 'pub-1', title: 'Test' });

      const result = await service.publishToInstagram('agency-1', 'pub-1');
      expect(result.success).toBe(true);
      expect(result.postId).toMatch(/^ig_mock_/);
    });
  });

  describe('getSocialStatus', () => {
    it('should return social platform status', async () => {
      prisma.agency.findUnique.mockResolvedValue({
        facebookPageId: '123', facebookPageUrl: 'https://fb.com/test',
        instagramAccount: null, instagramPageUrl: null,
        linkedinUrl: 'https://linkedin.com/test',
        twitterUrl: null, youtubeUrl: null, tiktokUrl: null,
      });

      const result = await service.getSocialStatus('agency-1');
      expect(result.facebook.connected).toBe(true);
      expect(result.facebook.pageUrl).toBe('https://fb.com/test');
      expect(result.instagram.connected).toBe(false);
      expect(result.linkedin.connected).toBe(true);
      expect(result.twitter.connected).toBe(false);
    });
  });

  describe('processScheduled', () => {
    it('should process zero pending publications', async () => {
      publicationsService.getScheduledForCron.mockResolvedValue([]);

      const result = await service.processScheduled();
      expect(result.processed).toBe(0);
    });

    it('should process Facebook publications', async () => {
      prisma.agency.findUnique.mockResolvedValue({ facebookPageId: '123' });
      prisma.publication.findUnique.mockResolvedValue({ id: 'pub-1', title: 'Test' });
      publicationsService.getScheduledForCron.mockResolvedValue([
        { id: 'pub-1', agencyId: 'agency-1', platform: 'FACEBOOK', title: 'Test' },
      ]);

      const result = await service.processScheduled();
      expect(result.processed).toBe(1);
      expect(publicationsService.markPublished).toHaveBeenCalled();
    });

    it('should mark non-FB/IG publications as published manually', async () => {
      publicationsService.getScheduledForCron.mockResolvedValue([
        { id: 'pub-2', agencyId: 'agency-1', platform: 'TWITTER', title: 'Tweet' },
      ]);

      const result = await service.processScheduled();
      expect(result.processed).toBe(1);
      expect(publicationsService.markPublished).toHaveBeenCalledWith('pub-2', expect.stringMatching(/^manual_/));
    });
  });
});
