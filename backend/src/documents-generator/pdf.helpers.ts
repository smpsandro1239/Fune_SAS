import jsPDF from 'jspdf';

export interface AgencyData {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  location?: string | null;
  website?: string | null;
  logoUrl?: string | null;
}

export interface FuneralData {
  deceasedName: string;
  age?: number | null;
  dateOfBirth?: string | null;
  dateOfDeath?: string | null;
  placeOfDeath?: string | null;
  funeralDate: string;
  funeralTime?: string | null;
  locationParish?: string | null;
  cemeteryLocation?: string | null;
  wakeLocation?: string | null;
  wakeDate?: string | null;
  wakeTime?: string | null;
  serviceType?: string;
}

export function createDoc(): jsPDF {
  return new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '___/___/______';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '___/___/______';
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateLong(dateStr?: string | null): string {
  if (!dateStr) return '___ de __________ de ________';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '___ de __________ de ________';
  return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Devolve o valor ou uma linha em branco para preenchimento manual quando vazio */
export function orBlank(value?: string | null): string {
  return value && value.trim() ? value.trim() : '______________';
}

const GOLD_R = 180;
const GOLD_G = 155;
const GOLD_B = 80;

export function addLetterhead(doc: jsPDF, agency: AgencyData, y: number = 20): number {
  doc.setFillColor(GOLD_R, GOLD_G, GOLD_B);
  doc.rect(0, 0, 210, 3, 'F');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text(agency.name, 105, y, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const parts = [agency.address, agency.location].filter(Boolean);
  if (parts.length > 0) {
    doc.text(parts.join(' — '), 105, y + 6, { align: 'center' });
  }
  const contactParts = [agency.phone, agency.email].filter(Boolean);
  if (contactParts.length > 0) {
    doc.text(contactParts.join(' | '), 105, y + 11, { align: 'center' });
  }
  if (agency.website) {
    doc.text(agency.website, 105, y + 16, { align: 'center' });
  }

  doc.setDrawColor(GOLD_R, GOLD_G, GOLD_B);
  doc.setLineWidth(0.8);
  doc.line(20, y + 20, 190, y + 20);

  doc.setTextColor(0, 0, 0);
  return y + 28;
}

export function addFooter(doc: jsPDF, agency: AgencyData): void {
  const h = doc.internal.pageSize.getHeight();
  doc.setDrawColor(GOLD_R, GOLD_G, GOLD_B);
  doc.setLineWidth(0.5);
  doc.line(20, h - 16, 190, h - 16);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(`${agency.name} — Documento gerado automaticamente`, 105, h - 12, { align: 'center' });
  doc.text(`Emitido em: ${formatDate(new Date().toISOString())}`, 105, h - 8, { align: 'center' });
  doc.setTextColor(0, 0, 0);
}

export function addTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFillColor(GOLD_R, GOLD_G, GOLD_B);
  doc.roundedRect(60, y - 5, 90, 10, 2, 2, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(title, 105, y + 2, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  return y + 14;
}

export function addField(doc: jsPDF, label: string, value: string, x: number, y: number): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 65, 80);
  doc.text(label + ':', x, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(value || '___', x + 50, y);
  return y + 7;
}

export function addSignatureLine(doc: jsPDF, label: string, y: number, x: number = 60): number {
  doc.setDrawColor(60, 65, 80);
  doc.setLineWidth(0.3);
  doc.line(x, y, x + 60, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(label, x + 30, y + 5, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  return y + 14;
}

export function addParagraph(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number = 160,
): number {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  doc.setTextColor(0, 0, 0);
  return y + lines.length * 5.5;
}

export function addBox(doc: jsPDF, x: number, y: number, w: number, h: number): void {
  doc.setFillColor(248, 246, 240);
  doc.setDrawColor(GOLD_R, GOLD_G, GOLD_B);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 3, 3, 'FD');
}

export function addSeparator(doc: jsPDF, y: number): number {
  doc.setDrawColor(GOLD_R, GOLD_G, GOLD_B);
  doc.setLineWidth(0.3);
  doc.setLineDashPattern([3, 2], 0);
  doc.line(25, y, 185, y);
  doc.setLineDashPattern([], 0);
  return y + 6;
}
