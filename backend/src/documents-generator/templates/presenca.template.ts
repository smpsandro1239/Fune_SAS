import jsPDF from 'jspdf';
import { AgencyData, FuneralData, createDoc, addLetterhead, addFooter, addTitle, addField, addSignatureLine, addParagraph } from '../pdf.helpers';

export interface PresencaData {
  presentName: string;
  presentRelation: string;
}

export function generatePresenca(funeral: FuneralData, agency: AgencyData, extra: PresencaData): jsPDF {
  const doc = createDoc();
  let y = addLetterhead(doc, agency);
  y = addTitle(doc, 'DECLARAÇÃO DE PRESENÇA', y + 4);
  y += 6;

  const text = `A ${agency.name}, declara que o(a) Sr(a). ${extra.presentName}, na qualidade de ${extra.presentRelation}, esteve presente no funeral de ${funeral.deceasedName}, realizado(a) no dia ${formatDatePtBR(funeral.funeralDate)}${funeral.funeralTime ? ' às ' + funeral.funeralTime : ''}, em ${funeral.locationParish || 'local a definir'}.`;
  y = addParagraph(doc, text, 25, y);

  y += 15;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ____/____/________`, 25, y);

  y += 20;
  y = addSignatureLine(doc, 'Assinatura', 60);
  doc.text(agency.name, 60, y);

  addFooter(doc, agency);
  return doc;
}

function formatDatePtBR(dateStr?: string | null): string {
  if (!dateStr) return '___/___/______';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '___/___/______';
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' });
}
