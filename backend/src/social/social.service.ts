import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PublicationsService } from '../publications/publications.service';

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly publicationsService: PublicationsService,
  ) {}

  async publishToFacebook(agencyId: string, publicationId: string): Promise<{ success: boolean; postId?: string; error?: string }> {
    const agency = await this.prisma.agency.findUnique({ where: { id: agencyId } });
    if (!agency?.facebookPageId) {
      return { success: false, error: 'Facebook Page não configurada.' };
    }

    const pub = await this.prisma.publication.findUnique({ where: { id: publicationId } });
    if (!pub) return { success: false, error: 'Publicação não encontrada.' };

    this.logger.log(`Publicação Facebook simulada: ${pub.title} na página ${agency.facebookPageId}`);

    await this.publicationsService.markPublished(publicationId, `fb_mock_${Date.now()}`);
    return { success: true, postId: `fb_mock_${Date.now()}` };
  }

  async publishToInstagram(agencyId: string, publicationId: string): Promise<{ success: boolean; postId?: string; error?: string }> {
    const agency = await this.prisma.agency.findUnique({ where: { id: agencyId } });
    if (!agency?.instagramAccount) {
      return { success: false, error: 'Instagram não configurado.' };
    }

    const pub = await this.prisma.publication.findUnique({ where: { id: publicationId } });
    if (!pub) return { success: false, error: 'Publicação não encontrada.' };

    this.logger.log(`Publicação Instagram simulada: ${pub.title} para @${agency.instagramAccount}`);

    await this.publicationsService.markPublished(publicationId, `ig_mock_${Date.now()}`);
    return { success: true, postId: `ig_mock_${Date.now()}` };
  }

  async getSocialStatus(agencyId: string) {
    const agency = await this.prisma.agency.findUnique({ where: { id: agencyId } });
    return {
      facebook: { connected: !!agency?.facebookPageId, pageId: agency?.facebookPageId, pageUrl: agency?.facebookPageUrl },
      instagram: { connected: !!agency?.instagramAccount, account: agency?.instagramAccount, pageUrl: agency?.instagramPageUrl },
      linkedin: { connected: !!agency?.linkedinUrl, url: agency?.linkedinUrl },
      twitter: { connected: !!agency?.twitterUrl, url: agency?.twitterUrl },
      youtube: { connected: !!agency?.youtubeUrl, url: agency?.youtubeUrl },
      tiktok: { connected: !!agency?.tiktokUrl, url: agency?.tiktokUrl },
    };
  }

  async processScheduled() {
    const pending = await this.publicationsService.getScheduledForCron();
    for (const pub of pending) {
      try {
        if (pub.platform === 'FACEBOOK') {
          await this.publishToFacebook(pub.agencyId, pub.id);
        } else if (pub.platform === 'INSTAGRAM') {
          await this.publishToInstagram(pub.agencyId, pub.id);
        } else {
          await this.publicationsService.markPublished(pub.id, `manual_${Date.now()}`);
        }
      } catch (err) {
        await this.publicationsService.markFailed(pub.id, String(err));
      }
    }
    return { processed: pending.length };
  }
}
