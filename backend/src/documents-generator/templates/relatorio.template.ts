import jsPDF from 'jspdf';
import { AgencyData, FuneralData, createDoc, addLetterhead, addFooter, addTitle, formatDate, addSeparator } from '../pdf.helpers';

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
  y = addTitle(doc, 'RELATÓRIO DE SERVIÇO', y);
  y += 4;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`Cliente: ${extra.clientName}`, 25, y);
  doc.text(`Falecido(a): ${funeral.deceasedName}`, 120, y);
  y += 6;
  doc.text(`Data do Serviço: ${formatDate(funeral.funeralDate)}`, 25, y);
  doc.text(`Referência: REL-${Date.now().toString().slice(-6)}`, 120, y);
  y += 8;

  y = addSeparator(doc, y);
  y += 4;

  const headers = ['Descrição', 'Qtd', 'Preço Unit.', 'Subtotal'];
  const colX = [25, 120, 140, 162];
  const colW = [95, 20, 22, 23];

  doc.setFillColor(40, 45, 65);
  doc.roundedRect(25, y - 4, 160, 9, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  headers.forEach((h, i) => doc.text(h, colX[i], y + 2));
  doc.setTextColor(0, 0, 0);
  y += 10;

  let subtotal = 0;
  extra.items.forEach((item, idx) => {
    const sub = item.qty * item.unitPrice;
    subtotal += sub;

    if (idx % 2 === 0) {
      doc.setFillColor(248, 246, 240);
      doc.rect(25, y - 4, 160, 7, 'F');
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(item.description.substring(0, 45), colX[0], y);
    doc.text(String(item.qty), colX[1], y);
    doc.text(`€${item.unitPrice.toFixed(2)}`, colX[2], y);
    doc.text(`€${sub.toFixed(2)}`, colX[3], y);
    y += 7;
  });

  doc.setTextColor(0, 0, 0);
  y += 4;

  doc.setDrawColor(180, 155, 80);
  doc.setLineWidth(0.5);
  doc.line(110, y, 185, y);
  y += 8;

  const iva = subtotal * 0.23;
  const total = subtotal + iva;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 65, 80);
  doc.text('Subtotal:', 120, y);
  doc.text(`€${subtotal.toFixed(2)}`, 165, y, { align: 'right' });
  y += 7;
  doc.text('IVA (23%):', 120, y);
  doc.text(`€${iva.toFixed(2)}`, 165, y, { align: 'right' });
  y += 8;

  doc.setDrawColor(40, 45, 65);
  doc.setLineWidth(0.8);
  doc.line(110, y, 185, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(40, 45, 65);
  doc.text('TOTAL:', 120, y);
  doc.text(`€${total.toFixed(2)}`, 165, y, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  if (extra.notes) {
    y += 14;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    const noteLines = doc.splitTextToSize(`Notas: ${extra.notes}`, 160);
    doc.text(noteLines, 25, y);
    doc.setTextColor(0, 0, 0);
  }

  addFooter(doc, agency);
  return doc;
}
