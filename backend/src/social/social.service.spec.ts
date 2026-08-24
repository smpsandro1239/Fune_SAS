import { Test, TestingModule } from '@nestjs/testing';
import { SocialService } from './social.service';
import { PrismaService } from '../prisma/prisma.service';
import { PublicationsService } from '../publications/publications.service';

describe('SocialService', () => {
  let service: SocialService;
  let prisma: {
    agency: { findUnique: jest.Mock; findFirst: jest.Mock };
    publication: { findFirst: jest.Mock };
    funeral: { findFirst: jest.Mock };
  };
  let publicationsService: {
    markPublished: jest.Mock;
    markFailed: jest.Mock;
    getScheduledForCron: jest.Mock;
  };

  const fullAgency = {
    id: 'agency-1',
    facebookPageId: '1234567890',
    facebookPageAccessToken: 'EAAG_test_token',
    instagramBusinessId: null,
    slug: 'casa-hortas',
  };

  beforeEach(async () => {
    prisma = {
      agency: { findUnique: jest.fn(), findFirst: jest.fn() },
      publication: { findFirst: jest.fn() },
      funeral: { findFirst: jest.fn() },
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

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
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

    it('should return error if access token is missing', async () => {
      prisma.agency.findUnique.mockResolvedValue({ id: 'agency-1', facebookPageId: '12345' });

      const result = await service.publishToFacebook('agency-1', 'pub-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Token de acesso');
    });

    it('should return error if publication not found', async () => {
      prisma.agency.findUnique.mockResolvedValue(fullAgency);
      prisma.publication.findFirst.mockResolvedValue(null);

      const result = await service.publishToFacebook('agency-1', 'nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toContain('não encontrada');
    });

    it('should publish successfully via Graph API', async () => {
      prisma.agency.findUnique.mockResolvedValue(fullAgency);
      prisma.publication.findFirst.mockResolvedValue({
        id: 'pub-1', title: 'Teste', caption: 'Legenda', imageBase64: null, imageUrl: null, funeralId: null,
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ id: '12345_98765' }),
      });

      const result = await service.publishToFacebook('agency-1', 'pub-1');
      expect(result.success).toBe(true);
      expect(result.postId).toBe('12345_98765');
      expect(publicationsService.markPublished).toHaveBeenCalledWith('pub-1', '12345_98765');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('graph.facebook.com'),
        expect.any(Object),
      );
    });

    it('should mark failed when Graph API returns error', async () => {
      prisma.agency.findUnique.mockResolvedValue(fullAgency);
      prisma.publication.findFirst.mockResolvedValue({
        id: 'pub-1', title: 'Teste', caption: 'x', imageBase64: null, imageUrl: null, funeralId: null,
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: { message: 'Invalid OAuth token' } }),
      });

      const result = await service.publishToFacebook('agency-1', 'pub-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid OAuth token');
      expect(publicationsService.markFailed).toHaveBeenCalled();
    });
  });

  describe('publishToInstagram', () => {
    it('should return error if Instagram Business not configured', async () => {
      prisma.agency.findUnique.mockResolvedValue({ id: 'agency-1', instagramBusinessId: null });

      const result = await service.publishToInstagram('agency-1', 'pub-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Instagram Business não configurado');
    });

    it('should return error if no image attached', async () => {
      prisma.agency.findUnique.mockResolvedValue({
        ...fullAgency,
        instagramBusinessId: '17841400000000000',
      });
      prisma.publication.findFirst.mockResolvedValue({
        id: 'pub-1', title: 'Teste', caption: 'x', imageBase64: null, imageUrl: null,
      });

      const result = await service.publishToInstagram('agency-1', 'pub-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('exige uma imagem');
    });

    it('should publish successfully via Graph API (2 steps)', async () => {
      prisma.agency.findUnique
        .mockResolvedValueOnce({ ...fullAgency, instagramBusinessId: '17841400000000000' })
        .mockResolvedValueOnce({ ...fullAgency, instagramBusinessId: '17841400000000000' });
      prisma.publication.findFirst.mockResolvedValue({
        id: 'pub-1', title: 'Teste', caption: 'x', imageBase64: null,
        imageUrl: 'https://example.com/flyer.png', funeralId: null,
      });
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'container-1' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'ig-post-1' }) });

      const result = await service.publishToInstagram('agency-1', 'pub-1');
      expect(result.success).toBe(true);
      expect(result.postId).toBe('ig-post-1');
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(publicationsService.markPublished).toHaveBeenCalledWith('pub-1', 'ig-post-1');
    });
  });

  describe('getSocialStatus', () => {
    it('should return social platform status with API readiness', async () => {
      prisma.agency.findUnique.mockResolvedValue({
        facebookPageId: '123',
        facebookPageAccessToken: 'token',
        facebookPageUrl: 'https://fb.com/test',
        instagramBusinessId: null,
        instagramAccount: null,
        instagramPageUrl: null,
        linkedinUrl: 'https://linkedin.com/test',
        twitterUrl: null, youtubeUrl: null, tiktokUrl: null,
      });

      const result = await service.getSocialStatus('agency-1');
      expect(result.facebook.connected).toBe(true);
      expect(result.facebook.hasToken).toBe(true);
      expect(result.facebook.pageUrl).toBe('https://fb.com/test');
      expect(result.instagram.connected).toBe(false);
      expect(result.instagram.configured).toBe(false);
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

    it('should attempt to process Facebook publications and record failures', async () => {
      prisma.agency.findUnique.mockResolvedValue({ id: 'agency-1', facebookPageId: null });
      publicationsService.getScheduledForCron.mockResolvedValue([
        { id: 'pub-1', agencyId: 'agency-1', platform: 'FACEBOOK', title: 'Test' },
      ]);

      const result = await service.processScheduled();
      expect(result.processed).toBe(1);
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
