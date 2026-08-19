import jsPDF from 'jspdf';
import { AgencyData, FuneralData, createDoc, addLetterhead, addFooter, addTitle, formatDate } from '../pdf.helpers';

export interface RelatorioItem {
  description: string;
  qty: number;
  unitPrice: number;
}

export interface RelatorioData {
  clientName: string;
  items: RelatorioItem[];
  notes?: string;
}

export function generateRelatorio(funeral: FuneralData, agency: AgencyData, extra: RelatorioData): jsPDF {
  const doc = createDoc();
  let y = addLetterhead(doc, agency);
  y = addTitle(doc, 'RELATÓRIO DE SERVIÇO', y + 4);
  y += 4;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Cliente: ${extra.clientName}`, 25, y);
  doc.text(`Falecido(a): ${funeral.deceasedName}`, 120, y);
  y += 5;
  doc.text(`Data: ${formatDate(funeral.funeralDate)}`, 25, y);
  y += 8;

  const headers = ['Descrição', 'Qtd', 'Preço Unit.', 'Subtotal'];
  const colX = [25, 115, 135, 160];
  const colW = [90, 20, 25, 25];

  doc.setFillColor(40, 45, 65);
  doc.rect(25, y - 4, 160, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  headers.forEach((h, i) => doc.text(h, colX[i], y));
  doc.setTextColor(0, 0, 0);
  y += 8;

  let subtotal = 0;
  extra.items.forEach((item) => {
    const sub = item.qty * item.unitPrice;
    subtotal += sub;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(item.description, colX[0], y);
    doc.text(String(item.qty), colX[1], y);
    doc.text(`€${item.unitPrice.toFixed(2)}`, colX[2], y);
    doc.text(`€${sub.toFixed(2)}`, colX[3], y);
    y += 6;
  });

  y += 2;
  doc.setDrawColor(180, 155, 80);
  doc.setLineWidth(0.3);
  doc.line(110, y, 185, y);
  y += 6;

  const iva = subtotal * 0.23;
  const total = subtotal + iva;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 120, y);
  doc.text(`€${subtotal.toFixed(2)}`, 160, y);
  y += 6;
  doc.text('IVA (23%):', 120, y);
  doc.text(`€${iva.toFixed(2)}`, 160, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', 120, y);
  doc.text(`€${total.toFixed(2)}`, 160, y);

  if (extra.notes) {
    y += 12;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    const noteLines = doc.splitTextToSize(`Notas: ${extra.notes}`, 170);
    doc.text(noteLines, 25, y);
  }

  addFooter(doc, agency);
  return doc;
}
