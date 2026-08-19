import jsPDF from 'jspdf';
import { AgencyData, FuneralData, createDoc, addLetterhead, addFooter, addTitle, formatDate } from '../pdf.helpers';

export interface ProgramaData {
  officiant?: string;
  readings?: string[];
  songs?: string[];
}

export function generatePrograma(funeral: FuneralData, agency: AgencyData, extra: ProgramaData): jsPDF {
  const doc = createDoc();
  let y = addLetterhead(doc, agency);
  y += 2;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.text('Em Memória de', 105, y, { align: 'center' });
  y += 8;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(funeral.deceasedName.toUpperCase(), 105, y, { align: 'center' });
  y += 8;

  if (funeral.dateOfBirth || funeral.dateOfDeath) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const born = formatDate(funeral.dateOfBirth);
    const died = formatDate(funeral.dateOfDeath);
    doc.text(`${born} — ${died}`, 105, y, { align: 'center' });
    y += 8;
  }

  if (funeral.age) {
    doc.text(`${funeral.age} anos`, 105, y, { align: 'center' });
    y += 10;
  }

  y = addTitle(doc, 'CERIMÓNIA FÚNEBRE', y);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${formatDate(funeral.funeralDate)}`, 25, y);
  doc.text(`Hora: ${funeral.funeralTime || '___:___'}`, 120, y);
  y += 6;
  doc.text(`Local: ${funeral.locationParish || '___'}`, 25, y);
  y += 10;

  y = addTitle(doc, 'ORDEM DA CERIMÓNIA', y);

  const order = [
    'Abertura',
    extra.officiant ? `Oficiante: ${extra.officiant}` : 'Oficiante: ___',
    ...((extra.readings && extra.readings.length > 0) ? extra.readings.map((r, i) => `Leitura ${i + 1}: ${r}`) : ['Leitura: ___']),
    ...((extra.songs && extra.songs.length > 0) ? extra.songs.map((s, i) => `Música ${i + 1}: ${s}`) : ['Música: ___']),
    'Oração',
    'Homenagem',
    'Despedida',
  ];

  order.forEach((item, i) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${i + 1}. ${item}`, 30, y);
    y += 6;
  });

  y += 4;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`Local de Sepultamento: ${funeral.cemeteryLocation || '___'}`, 25, y);

  addFooter(doc, agency);
  return doc;
}
