import jsPDF from 'jspdf';
import { AgencyData, FuneralData, createDoc, addLetterhead, addFooter, addTitle, addSignatureLine, formatDate, addParagraph, addBox, addSeparator } from '../pdf.helpers';

export interface SepulturaData {
  plotNumber?: string;
  graveType?: string;
}

export function generateSepultura(funeral: FuneralData, agency: AgencyData, extra: SepulturaData): jsPDF {
  const doc = createDoc();
  let y = addLetterhead(doc, agency);
  y = addTitle(doc, 'CERTIDÃO DE SEPULTURA', y);
  y += 6;

  const certRef = `CERT-${Date.now().toString().slice(-6)}`;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Ref: ${certRef}`, 170, y - 4);
  doc.setTextColor(0, 0, 0);
  y += 2;

  addBox(doc, 25, y, 160, 36);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  let fy = y + 8;
  doc.text(`Nome: ${funeral.deceasedName}`, 32, fy);
  if (funeral.age) doc.text(`Idade: ${funeral.age} anos`, 130, fy);
  fy += 7;
  doc.text(`Nascimento: ${formatDate(funeral.dateOfBirth)}`, 32, fy);
  doc.text(`Óbito: ${formatDate(funeral.dateOfDeath)}`, 110, fy);
  fy += 7;
  doc.text(`Local de Sepultamento: ${funeral.cemeteryLocation || '___'}`, 32, fy);
  fy += 7;
  const graveInfo = [extra.graveType, extra.plotNumber ? `nº ${extra.plotNumber}` : ''].filter(Boolean).join(' ');
  if (graveInfo) {
    doc.text(`Sepultura: ${graveInfo}`, 32, fy);
  }
  doc.setTextColor(0, 0, 0);
  y += 44;

  y = addSeparator(doc, y);
  y += 4;

  y = addParagraph(doc,
    `Certificamos que o(a) Sr(a). ${funeral.deceasedName}${funeral.age ? `, com ${funeral.age} anos de idade` : ''}, ` +
    `nascido(a) em ${formatDate(funeral.dateOfBirth)}, falecido(a) em ${formatDate(funeral.dateOfDeath)}, ` +
    `encontra-se sepultado(a) no Cemitério de ${funeral.cemeteryLocation || '___'} ` +
    `${graveInfo ? '(' + graveInfo + ') ' : ''}desde ${formatDate(funeral.funeralDate)}.`,
    25, y);
  y += 16;

  const dateStr = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 65, 80);
  doc.text(`${agency.location || '___'}, ${dateStr}.`, 25, y);
  doc.setTextColor(0, 0, 0);
  y += 20;

  y = addSignatureLine(doc, 'Assinatura e Carimbo', y, 55);
  y += 4;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text(agency.name, 85, y, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  addFooter(doc, agency);
  return doc;
}
