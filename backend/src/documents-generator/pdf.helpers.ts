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

export function addLetterhead(doc: jsPDF, agency: AgencyData, y: number = 20): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(agency.name, 105, y, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const parts = [agency.address, agency.location, agency.phone, agency.email].filter(Boolean);
  if (parts.length > 0) {
    doc.text(parts.join(' | '), 105, y + 6, { align: 'center' });
  }
  if (agency.website) {
    doc.text(agency.website, 105, y + 11, { align: 'center' });
  }

  doc.setDrawColor(180, 155, 80);
  doc.setLineWidth(0.5);
  doc.line(20, y + 15, 190, y + 15);

  return y + 22;
}

export function addFooter(doc: jsPDF, agency: AgencyData): void {
  const h = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 120, 120);
  doc.text(`${agency.name} — Documento gerado automaticamente`, 105, h - 10, { align: 'center' });
  doc.text(`Emitido em: ${formatDate(new Date().toISOString())}`, 105, h - 6, { align: 'center' });
  doc.setTextColor(0, 0, 0);
}

export function addTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 105, y, { align: 'center' });
  doc.setDrawColor(180, 155, 80);
  doc.setLineWidth(0.3);
  doc.line(60, y + 2, 150, y + 2);
  return y + 10;
}

export function addField(doc: jsPDF, label: string, value: string, x: number, y: number): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(label + ':', x, y);
  doc.setFont('helvetica', 'normal');
  doc.text(value || '___', x + 45, y);
  return y + 6;
}

export function addSignatureLine(doc: jsPDF, label: string, y: number): number {
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.line(30, y, 90, y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(label, 60, y + 5, { align: 'center' });
  return y + 12;
}

export function addParagraph(doc: jsPDF, text: string, x: number, y: number, maxWidth: number = 170): number {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * 5;
}
