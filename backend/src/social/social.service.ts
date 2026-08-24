import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PublicationsService } from '../publications/publications.service';

const GRAPH_API_VERSION = 'v21.0';

export interface PublishResult {
  success: boolean;
  postId?: string;
  error?: string;
  mock?: boolean;
}

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly publicationsService: PublicationsService,
  ) {}

  /**
   * Publica no Facebook Page via Graph API (real).
   * Requer: facebookPageId + facebookPageAccessToken na agência.
   */
  async publishToFacebook(agencyId: string, publicationId: string): Promise<PublishResult> {
    const agency = await this.prisma.agency.findUnique({ where: { id: agencyId } });
    if (!agency?.facebookPageId) {
      return {
        success: false,
        error: 'Facebook Page não configurada. Defina o ID da página nas configurações.',
      };
    }
    if (!agency.facebookPageAccessToken) {
      return {
        success: false,
        error:
          'Token de acesso do Facebook não configurado. Obtenha um Page Access Token no Meta for Developers.',
      };
    }

    const pub = await this.prisma.publication.findFirst({
      where: { id: publicationId, agencyId },
    });
    if (!pub) return { success: false, error: 'Publicação não encontrada.' };

    try {
      let postId: string;

      if (pub.imageBase64) {
        // Publicação com imagem via /photos
        const base64Data = pub.imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const params = new URLSearchParams({
          access_token: agency.facebookPageAccessToken,
          caption: `${pub.title}\n\n${pub.caption}`,
        });
        const res = await fetch(
          `https://graph.facebook.com/${GRAPH_API_VERSION}/${agency.facebookPageId}/photos?${params.toString()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photo: base64Data }),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
        postId = data.post_id || data.id;
      } else {
        // Publicação de texto/link via /feed
        const body: Record<string, any> = {
          access_token: agency.facebookPageAccessToken,
          message: `${pub.title}\n\n${pub.caption}`,
        };
        if (pub.imageUrl) body.link = pub.imageUrl;
        if (pub.funeralId) {
          const funeral = await this.prisma.funeral.findFirst({
            where: { id: pub.funeralId, agencyId },
          });
          if (funeral) {
            if (agency.slug) {
              body.link = `https://fune-sas.vercel.app/public/${agency.slug}/${funeral.id}`;
            }
          }
        }
        const res = await fetch(
          `https://graph.facebook.com/${GRAPH_API_VERSION}/${agency.facebookPageId}/feed`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
        postId = data.id;
      }

      await this.publicationsService.markPublished(publicationId, postId);
      return { success: true, postId };
    } catch (err: any) {
      this.logger.error(`Erro ao publicar no Facebook: ${err.message}`);
      await this.publicationsService.markFailed(publicationId, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Publica no Instagram via Graph API (real).
   * Requer: instagramBusinessId (IG User ID) + facebookPageAccessToken (com permissões instagram_basic/content_publish).
   */
  async publishToInstagram(agencyId: string, publicationId: string): Promise<PublishResult> {
    const agency = await this.prisma.agency.findUnique({ where: { id: agencyId } });
    if (!agency?.instagramBusinessId) {
      return {
        success: false,
        error: 'Instagram Business não configurado. Defina o IG User ID nas configurações.',
      };
    }
    if (!agency.facebookPageAccessToken) {
      return { success: false, error: 'Token de acesso do Facebook/Instagram não configurado.' };
    }

    const pub = await this.prisma.publication.findFirst({
      where: { id: publicationId, agencyId },
    });
    if (!pub) return { success: false, error: 'Publicação não encontrada.' };

    if (!pub.imageUrl && !pub.imageBase64) {
      return {
        success: false,
        error: 'O Instagram exige uma imagem. Adicione uma imagem (ex: flyer PNG) à publicação.',
      };
    }

    try {
      const imageUrl = pub.imageUrl || (await this.uploadTempImage(agencyId, pub.imageBase64!));

      // Passo 1: criar media container
      const containerRes = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${agency.instagramBusinessId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: imageUrl,
            caption: `${pub.title}\n\n${pub.caption}`,
            access_token: agency.facebookPageAccessToken,
          }),
        },
      );
      const containerData = await containerRes.json();
      if (!containerRes.ok)
        throw new Error(containerData?.error?.message || `HTTP ${containerRes.status}`);

      // Passo 2: publicar container
      const publishRes = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${agency.instagramBusinessId}/media_publish`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            creation_id: containerData.id,
            access_token: agency.facebookPageAccessToken,
          }),
        },
      );
      const publishData = await publishRes.json();
      if (!publishRes.ok)
        throw new Error(publishData?.error?.message || `HTTP ${publishRes.status}`);

      await this.publicationsService.markPublished(publicationId, publishData.id);
      return { success: true, postId: publishData.id };
    } catch (err: any) {
      this.logger.error(`Erro ao publicar no Instagram: ${err.message}`);
      await this.publicationsService.markFailed(publicationId, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Upload de imagem base64 para hospedagem temporária pública.
   * O Instagram exige image_url público — usa a PRÓPRIA agência (não de outra) como host.
   */
  private async uploadTempImage(agencyId: string, base64Data: string): Promise<string> {
    const agency = await this.prisma.agency.findUnique({ where: { id: agencyId } });
    if (!agency?.facebookPageId || !agency.facebookPageAccessToken) {
      throw new Error(
        'Não foi possível hospedar a imagem: configure o Facebook da sua agência primeiro.',
      );
    }

    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const params = new URLSearchParams({
      access_token: agency.facebookPageAccessToken,
      published: 'false',
      base64: 'true',
    });
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${agency.facebookPageId}/photos?${params.toString()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: cleanBase64 }),
      },
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
    return data.url || data.source || '';
  }

  async getSocialStatus(agencyId: string) {
    const agency = await this.prisma.agency.findUnique({ where: { id: agencyId } });
    return {
      facebook: {
        connected: !!agency?.facebookPageId && !!agency?.facebookPageAccessToken,
        configured: !!agency?.facebookPageId,
        hasToken: !!agency?.facebookPageAccessToken,
        pageId: agency?.facebookPageId,
        pageUrl: agency?.facebookPageUrl,
      },
      instagram: {
        connected: !!agency?.instagramBusinessId && !!agency?.facebookPageAccessToken,
        configured: !!agency?.instagramBusinessId,
        account: agency?.instagramAccount,
        pageUrl: agency?.instagramPageUrl,
      },
      linkedin: { connected: !!agency?.linkedinUrl, url: agency?.linkedinUrl },
      twitter: { connected: !!agency?.twitterUrl, url: agency?.twitterUrl },
      youtube: { connected: !!agency?.youtubeUrl, url: agency?.youtubeUrl },
      tiktok: { connected: !!agency?.tiktokUrl, url: agency?.tiktokUrl },
    };
  }

  async processScheduled() {
    const pending = await this.publicationsService.getScheduledForCron();
    let success = 0;
    let failed = 0;
    for (const pub of pending) {
      try {
        if (pub.platform === 'FACEBOOK') {
          const result = await this.publishToFacebook(pub.agencyId, pub.id);
          if (result.success) success++;
          else failed++;
        } else if (pub.platform === 'INSTAGRAM') {
          const result = await this.publishToInstagram(pub.agencyId, pub.id);
          if (result.success) success++;
          else failed++;
        } else {
          await this.publicationsService.markPublished(pub.id, `manual_${Date.now()}`);
          success++;
        }
      } catch (err) {
        await this.publicationsService.markFailed(pub.id, String(err));
        failed++;
      }
    }
    return { processed: pending.length, success, failed };
  }
}
