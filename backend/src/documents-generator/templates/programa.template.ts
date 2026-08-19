import jsPDF from 'jspdf';
import { AgencyData, FuneralData, createDoc, addLetterhead, addFooter, addTitle, formatDate, addBox } from '../pdf.helpers';

export interface ProgramaData {
  officiant?: string;
  readings?: string[];
  songs?: string[];
}

export function generatePrograma(funeral: FuneralData, agency: AgencyData, extra: ProgramaData): jsPDF {
  const doc = createDoc();
  let y = addLetterhead(doc, agency);
  y += 2;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text('Em Memória de', 105, y, { align: 'center' });
  y += 8;

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text(funeral.deceasedName.toUpperCase(), 105, y, { align: 'center' });
  y += 10;

  if (funeral.age) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 155, 80);
    doc.text(`${funeral.age} anos`, 105, y, { align: 'center' });
    y += 8;
  }

  if (funeral.dateOfBirth || funeral.dateOfDeath) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const born = formatDate(funeral.dateOfBirth);
    const died = formatDate(funeral.dateOfDeath);
    doc.text(`${born}  —  ${died}`, 105, y, { align: 'center' });
    y += 10;
  }

  y = addTitle(doc, 'CERIMÓNIA FÚNEBRE', y);
  y += 2;

  addBox(doc, 25, y, 160, 24);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`Data: ${formatDate(funeral.funeralDate)}`, 32, y + 7);
  doc.text(`Hora: ${funeral.funeralTime || '___:___'}`, 120, y + 7);
  doc.text(`Local: ${funeral.locationParish || '___'}`, 32, y + 16);
  y += 32;

  y = addTitle(doc, 'ORDEM DA CERIMÓNIA', y);
  y += 2;

  const order = [
    { icon: '1.', text: 'Abertura e Boas-vindas' },
    { icon: '2.', text: extra.officiant ? `Oficiante: ${extra.officiant}` : 'Oficiante: _______________' },
    { icon: '3.', text: extra.readings && extra.readings.length > 0 ? `Leitura: ${extra.readings[0]}` : 'Leitura: _______________' },
    { icon: '4.', text: extra.songs && extra.songs.length > 0 ? `Música: ${extra.songs[0]}` : 'Música: _______________' },
    { icon: '5.', text: 'Oração' },
    { icon: '6.', text: 'Homenagem e Palavras de Despedida' },
    { icon: '7.', text: 'Última Despedida' },
  ];

  order.forEach((item, i) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 155, 80);
    doc.text(item.icon, 30, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(item.text, 38, y);
    y += 8;
  });

  y += 6;
  doc.setDrawColor(180, 155, 80);
  doc.setLineWidth(0.3);
  doc.line(25, y, 185, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(`Local de Sepultamento: ${funeral.cemeteryLocation || '___'}`, 25, y);
  doc.setTextColor(0, 0, 0);

  addFooter(doc, agency);
  return doc;
}
