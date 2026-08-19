import jsPDF from 'jspdf';
import { AgencyData, FuneralData, createDoc, addLetterhead, addFooter, addTitle, addField, addSignatureLine, formatDate } from '../pdf.helpers';

export interface SepulturaData {
  plotNumber?: string;
  graveType?: string;
}

export function generateSepultura(funeral: FuneralData, agency: AgencyData, extra: SepulturaData): jsPDF {
  const doc = createDoc();
  let y = addLetterhead(doc, agency);
  y = addTitle(doc, 'CERTIDÃO DE SEPULTURA', y + 4);
  y += 10;

  const text = `Certificamos que o(a) Sr(a). ${funeral.deceasedName}, nascido(a) em ${formatDate(funeral.dateOfBirth)}, falecido(a) em ${formatDate(funeral.dateOfDeath)}, encontra-se sepultado(a) no Cemitério de ${funeral.cemeteryLocation || '___'}${extra.graveType ? ', ' + extra.graveType : ''}${extra.plotNumber ? ' nº ' + extra.plotNumber : ''}, desde ${formatDate(funeral.funeralDate)}.`;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(text, 165);
  doc.text(lines, 25, y);
  y += lines.length * 5 + 15;

  y = addSignatureLine(doc, 'Assinatura', y);

  y += 4;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(agency.name, 60, y);

  addFooter(doc, agency);
  return doc;
}
