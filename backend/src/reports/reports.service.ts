import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../common/types/authenticated-user';
import jsPDF from 'jspdf';

export interface ReportQuery {
  from?: string;
  to?: string;
}

const PDF_COLUMNS = [
  { title: 'Falecido', width: 66 },
  { title: 'Idade', width: 15 },
  { title: 'Tipo de Serviço', width: 36 },
  { title: 'Estado', width: 30 },
  { title: 'Data do Funeral', width: 22 },
  { title: 'Hora', width: 13 },
];

const PDF_MARGIN = 14;
const PDF_ROW_HEIGHT = 7;
const PDF_MAX_Y = 270;

const PDF_SERVICE_LABELS: Record<string, string> = {
  CERIMONIA: 'Cerimónia',
  VELORIO: 'Velório',
  CREMACAO: 'Cremação',
  TRANSPORTE: 'Transporte',
  ACOLHIMENTO: 'Acolhimento',
  OUTRO: 'Outro',
};

const PDF_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendado',
  IN_PROGRESS: 'Em Curso',
  COMPLETED: 'Concluído',
};

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

  private async fetchFunerals(user: AuthenticatedUser, query: ReportQuery) {
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

    return { from, to, funerals };
  }

  /**
   * Gera um CSV completo dos funerais da agência no intervalo (todos os registos,
   * sem paginação), pronto para download em Excel/planilhas (BOM + separador ;).
   */
  async exportFunerals(user: AuthenticatedUser, query: ReportQuery) {
    const { from, to, funerals } = await this.fetchFunerals(user, query);

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

  /**
   * Gera um relatório PDF dos funerais da agência no intervalo,
   * com paginação automática quando a tabela excede uma página.
   */
  async exportPdf(user: AuthenticatedUser, query: ReportQuery) {
    const { from, to, funerals } = await this.fetchFunerals(user, query);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 45, 65);
    doc.text('Relatório de Funerais', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 90, 90);
    doc.text(`Período: ${this.formatPdfDate(from)} a ${this.formatPdfDate(to)}`, 105, 27, {
      align: 'center',
    });
    doc.text(`Total de funerais: ${funerals.length}`, 105, 33, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    let y = 45;
    this.drawPdfHeader(doc, y);
    y += PDF_ROW_HEIGHT;

    for (const funeral of funerals) {
      if (y > PDF_MAX_Y) {
        doc.addPage();
        y = 20;
        this.drawPdfHeader(doc, y);
        y += PDF_ROW_HEIGHT;
      }
      this.drawPdfRow(doc, this.funeralToPdfRow(funeral), y);
      y += PDF_ROW_HEIGHT;
    }

    const content = Buffer.from(doc.output('arraybuffer'));
    return {
      filename: `relatorio-funerais-${new Date().toISOString().slice(0, 10)}.pdf`,
      content,
      contentType: 'application/pdf',
      count: funerals.length,
    };
  }

  private drawPdfHeader(doc: jsPDF, y: number) {
    const tableWidth = PDF_COLUMNS.reduce((sum, col) => sum + col.width, 0);

    doc.setFillColor(45, 50, 70);
    doc.rect(PDF_MARGIN, y - 5, tableWidth, PDF_ROW_HEIGHT, 'F');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);

    let x = PDF_MARGIN;
    for (const col of PDF_COLUMNS) {
      doc.text(col.title, x + 1, y, { align: 'left' });
      x += col.width;
    }

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.2);
    doc.line(PDF_MARGIN, y + 2.5, PDF_MARGIN + tableWidth, y + 2.5);
    doc.setTextColor(0, 0, 0);
  }

  private drawPdfRow(doc: jsPDF, values: string[], y: number) {
    const tableWidth = PDF_COLUMNS.reduce((sum, col) => sum + col.width, 0);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);

    let x = PDF_MARGIN;
    for (let i = 0; i < PDF_COLUMNS.length; i++) {
      const col = PDF_COLUMNS[i];
      doc.text(this.fitPdfText(doc, values[i] ?? '', col.width - 3), x + 1, y, {
        align: 'left',
      });
      x += col.width;
    }

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.2);
    doc.line(PDF_MARGIN, y + 2.5, PDF_MARGIN + tableWidth, y + 2.5);
    doc.setTextColor(0, 0, 0);
  }

  private fitPdfText(doc: jsPDF, text: string, maxWidth: number): string {
    if (!text) return '';
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    const first = lines[0];
    if (lines.length <= 1) return first;
    return first.length > 1 ? `${first.slice(0, -1)}…` : first;
  }

  private formatPdfDate(date: Date): string {
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  }

  private funeralToPdfRow(funeral: {
    deceased: { fullName: string; age: number | null };
    serviceType: string;
    status: string;
    funeralDate: Date;
    funeralTime: string | null;
  }): string[] {
    return [
      funeral.deceased.fullName,
      funeral.deceased.age != null ? String(funeral.deceased.age) : '',
      PDF_SERVICE_LABELS[funeral.serviceType] || funeral.serviceType,
      PDF_STATUS_LABELS[funeral.status] || funeral.status,
      this.formatPdfDate(new Date(funeral.funeralDate)),
      funeral.funeralTime ?? '',
    ];
  }
}
