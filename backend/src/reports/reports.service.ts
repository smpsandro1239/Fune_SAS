import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../common/types/authenticated-user';

export interface ReportQuery {
  from?: string;
  to?: string;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildDateRange(query: ReportQuery) {
    const from = query.from
      ? new Date(query.from)
      : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const to = query.to ? new Date(query.to) : new Date();
    return { from, to };
  }

  async funeralsPerPeriod(
    user: AuthenticatedUser,
    groupBy: 'day' | 'month' | 'year',
    query: ReportQuery,
  ) {
    const { from, to } = this.buildDateRange(query);
    const funerals = await this.prisma.funeral.findMany({
      where: { agencyId: user.agencyId, funeralDate: { gte: from, lte: to } },
      select: { funeralDate: true },
    });

    const fmt = (date: Date) => {
      if (groupBy === 'year') return `${date.getFullYear()}`;
      if (groupBy === 'month')
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const counts = new Map<string, number>();
    for (const f of funerals) {
      const key = fmt(new Date(f.funeralDate));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return {
      groupBy,
      from,
      to,
      total: funerals.length,
      periods: Array.from(counts.entries())
        .map(([period, count]) => ({ period, count }))
        .sort((a, b) => a.period.localeCompare(b.period)),
    };
  }

  async servicesUsage(user: AuthenticatedUser, query: ReportQuery) {
    const { from, to } = this.buildDateRange(query);
    const grouped = await this.prisma.funeral.groupBy({
      by: ['serviceType'],
      where: { agencyId: user.agencyId, funeralDate: { gte: from, lte: to } },
      _count: { serviceType: true },
    });

    const total = grouped.reduce((sum, g) => sum + g._count.serviceType, 0);
    return {
      total,
      services: grouped.map((g) => ({
        serviceType: g.serviceType,
        count: g._count.serviceType,
        percentage: total ? Math.round((g._count.serviceType / total) * 100) : 0,
      })),
    };
  }

  async dashboardSummary(user: AuthenticatedUser) {
    const [funerals, completed, scheduled, documents, templates] = await Promise.all([
      this.prisma.funeral.count({ where: { agencyId: user.agencyId } }),
      this.prisma.funeral.count({ where: { agencyId: user.agencyId, status: 'COMPLETED' } }),
      this.prisma.funeral.count({ where: { agencyId: user.agencyId, status: 'SCHEDULED' } }),
      this.prisma.document.count({ where: { agencyId: user.agencyId } }),
      this.prisma.flyerTemplate.count(),
    ]);

    return { funerals, completed, scheduled, documents, templates };
  }

  /**
   * Gera um CSV completo dos funerais da agência no intervalo (todos os registos,
   * sem paginação), pronto para download em Excel/planilhas (BOM + separador ;).
   */
  async exportFunerals(user: AuthenticatedUser, query: ReportQuery) {
    const { from, to } = this.buildDateRange(query);

    const funerals = await this.prisma.funeral.findMany({
      where: { agencyId: user.agencyId, funeralDate: { gte: from, lte: to } },
      orderBy: { funeralDate: 'asc' },
      select: {
        id: true,
        serviceType: true,
        status: true,
        funeralDate: true,
        funeralTime: true,
        locationParish: true,
        cemeteryLocation: true,
        wakeLocation: true,
        publicNoticeEnabled: true,
        createdAt: true,
        deceased: { select: { fullName: true, age: true, dateOfDeath: true } },
        _count: { select: { condolences: true, documents: true } },
      },
    });

    const csv = (value: unknown): string => {
      const s = value === null || value === undefined ? '' : String(value);
      if (/[";\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const headers = [
      'ID',
      'Falecido',
      'Idade',
      'Data de Falecimento',
      'Tipo de Serviço',
      'Estado',
      'Data do Funeral',
      'Hora',
      'Paróquia',
      'Cemitério',
      'Velório',
      'Nota Pública',
      'Condolências',
      'Documentos',
      'Criado em',
    ];

    const rows = funerals.map((f) =>
      [
        f.id,
        f.deceased.fullName,
        f.deceased.age ?? '',
        f.deceased.dateOfDeath ? new Date(f.deceased.dateOfDeath).toISOString().slice(0, 10) : '',
        f.serviceType,
        f.status,
        f.funeralDate.toISOString().slice(0, 10),
        f.funeralTime ?? '',
        f.locationParish ?? '',
        f.cemeteryLocation ?? '',
        f.wakeLocation ?? '',
        f.publicNoticeEnabled ? 'Sim' : 'Não',
        f._count.condolences,
        f._count.documents,
        f.createdAt.toISOString().slice(0, 10),
      ]
        .map(csv)
        .join(';'),
    );

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    return {
      filename: `funerais-${from.toISOString().slice(0, 10)}-${to.toISOString().slice(0, 10)}.csv`,
      content: csvContent,
      count: funerals.length,
      from,
      to,
    };
  }
}
