import { Injectable } from '@nestjs/common';
import { FlyerPlan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(plan?: FlyerPlan) {
    return this.prisma.flyerTemplate.findMany({
      where: plan ? { plan } : {},
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.flyerTemplate.findUnique({ where: { id } });
    return template;
  }
}
