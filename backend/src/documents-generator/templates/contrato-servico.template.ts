import jsPDF from 'jspdf';
import { AgencyData, FuneralData, createDoc, addLetterhead, addFooter, addTitle, addField, addSignatureLine, formatDate, addParagraph, addSeparator, addBox } from '../pdf.helpers';

export interface ContratoServicoData {
  clientName: string;
  clientId: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  items: { description: string; qty: number; unitPrice: number }[];
  paymentMethod?: string;
  notes?: string;
}

export function generateContratoServico(funeral: FuneralData, agency: AgencyData, extra: ContratoServicoData): jsPDF {
  const doc = createDoc();
  let y = addLetterhead(doc, agency);
  y = addTitle(doc, 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS', y);
  y += 4;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Ref: CTR-${Date.now().toString().slice(-6)}`, 170, y - 4);
  doc.setTextColor(0, 0, 0);
  y += 2;

  const dateStr = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`Celebrado entre:`, 25, y);
  y += 8;

  addBox(doc, 25, y, 160, 28);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text('ENTIDADE PRESTADORA:', 32, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`${agency.name} — ${agency.address || ''}, ${agency.location || ''}`, 32, y + 14);
  doc.text(`Tel: ${agency.phone || '___'} | Email: ${agency.email || '___'}`, 32, y + 21);
  doc.setTextColor(0, 0, 0);
  y += 34;

  addBox(doc, 25, y, 160, 28);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text('CLIENTE / CONTRATANTE:', 32, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`${extra.clientName} — CCº ${extra.clientId}`, 32, y + 14);
  doc.text(`${extra.clientAddress} | Tel: ${extra.clientPhone} | Email: ${extra.clientEmail}`, 32, y + 21);
  doc.setTextColor(0, 0, 0);
  y += 34;

  y = addSeparator(doc, y);
  y += 2;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text('Objeto do Contrato', 25, y);
  y += 8;

  const objText = `Prestação de serviços funerários referentes ao falecimento de ${funeral.deceasedName}, com data de óbito ${formatDate(funeral.dateOfDeath)}, a realizar-se no dia ${formatDate(funeral.funeralDate)}${funeral.funeralTime ? ', pelas ' + funeral.funeralTime : ''}, em ${funeral.locationParish || 'local a definir'}.`;
  y = addParagraph(doc, objText, 25, y);
  y += 8;

  y = addSeparator(doc, y);
  y += 2;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text('Detalhe dos Serviços', 25, y);
  y += 8;

  const colX = [25, 120, 140, 162];
  doc.setFillColor(40, 45, 65);
  doc.roundedRect(25, y - 4, 160, 9, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  ['Descrição', 'Qtd', 'Preço Unit.', 'Subtotal'].forEach((h, i) => doc.text(h, colX[i], y + 2));
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
  const iva = subtotal * 0.23;
  const total = subtotal + iva;

  doc.setDrawColor(180, 155, 80);
  doc.setLineWidth(0.5);
  doc.line(110, y, 185, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 65, 80);
  doc.text('Subtotal:', 120, y); doc.text(`€${subtotal.toFixed(2)}`, 165, y, { align: 'right' });
  y += 7;
  doc.text('IVA (23%):', 120, y); doc.text(`€${iva.toFixed(2)}`, 165, y, { align: 'right' });
  y += 8;
  doc.setDrawColor(40, 45, 65);
  doc.setLineWidth(0.8);
  doc.line(110, y, 185, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(40, 45, 65);
  doc.text('TOTAL:', 120, y); doc.text(`€${total.toFixed(2)}`, 165, y, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  y += 10;

  if (extra.paymentMethod) {
    y = addField(doc, 'Método de Pagamento', extra.paymentMethod, 25, y);
    y += 4;
  }

  if (extra.notes) {
    y = addSeparator(doc, y);
    y += 2;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    const noteLines = doc.splitTextToSize(`Notas: ${extra.notes}`, 160);
    doc.text(noteLines, 25, y);
    doc.setTextColor(0, 0, 0);
  }

  y += 12;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  const legalText = 'O presente contrato regula a prestação de serviços funerários nos termos do Decreto-Lei nº 190/2003, de 22 de agosto. O cliente declara ter tomado conhecimento e aceitar todas as condições aqui descritas.';
  const legalLines = doc.splitTextToSize(legalText, 160);
  doc.text(legalLines, 25, y);
  y += legalLines.length * 4.5 + 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 65, 80);
  doc.text(`${agency.location || '___'}, ${dateStr}.`, 25, y);
  doc.setTextColor(0, 0, 0);
  y += 20;

  y = addSignatureLine(doc, 'Assinatura da Agência', y, 30);
  y = addSignatureLine(doc, 'Assinatura do Cliente', y - 20, 115);

  addFooter(doc, agency);
  return doc;
}
