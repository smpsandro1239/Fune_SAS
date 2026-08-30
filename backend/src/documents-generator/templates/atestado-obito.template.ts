import jsPDF from 'jspdf';
import {
  AgencyData,
  FuneralData,
  createDoc,
  addLetterhead,
  addFooter,
  addTitle,
  addField,
  addSignatureLine,
  formatDate,
  addBox,
  addSeparator,
} from '../pdf.helpers';

export interface AtestadoObitoData {
  doctorName?: string;
  doctorLicense?: string;
  causeOfDeath?: string;
}

export function generateAtestadoObito(
  funeral: FuneralData,
  agency: AgencyData,
  extra: AtestadoObitoData,
  sharedDoc?: jsPDF,
): jsPDF {
  const doc = sharedDoc ?? createDoc();
  let y = addLetterhead(doc, agency);
  y = addTitle(doc, 'ATESTADO DE ÓBITO', y);
  y += 4;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Ref: AOB-${Date.now().toString().slice(-6)}`, 170, y - 4);
  doc.setTextColor(0, 0, 0);
  y += 4;

  addBox(doc, 25, y, 160, 42);
  let fy = y + 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`Nome Completo: ${funeral.deceasedName}`, 32, fy);
  if (funeral.age) doc.text(`Idade: ${funeral.age} anos`, 140, fy);
  fy += 7;
  doc.text(`Data de Nascimento: ${formatDate(funeral.dateOfBirth)}`, 32, fy);
  doc.text(`Data do Óbito: ${formatDate(funeral.dateOfDeath)}`, 115, fy);
  fy += 7;
  doc.text(`Local do Óbito: ${funeral.placeOfDeath || '___'}`, 32, fy);
  fy += 7;
  doc.text(`Estado Civil: ________________`, 32, fy);
  doc.text(`Nacionalidade: ________________`, 115, fy);
  fy += 7;
  doc.text(`Filiation: ________________ / ________________`, 32, fy);
  doc.setTextColor(0, 0, 0);
  y += 50;

  y = addSeparator(doc, y);
  y += 2;

  if (extra.causeOfDeath) {
    y = addField(doc, 'Causa de Morte', extra.causeOfDeath, 30, y);
    y += 4;
    y = addSeparator(doc, y);
    y += 2;
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text('Declaro que:', 25, y);
  y += 8;

  const declText = `O(A) Sr(a). ${funeral.deceasedName}${funeral.age ? ', com ' + funeral.age + ' anos de idade' : ''}, faleceu no dia ${formatDate(funeral.dateOfDeath)}${funeral.placeOfDeath ? ', em ' + funeral.placeOfDeath : ''}. O corpo encontra-se na ${agency.name} para os devidos funerais.`;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  const lines = doc.splitTextToSize(declText, 160);
  doc.text(lines, 25, y);
  y += lines.length * 5.5 + 12;

  const dateStr = new Date().toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.setFontSize(10);
  doc.text(`${agency.location || '___'}, ${dateStr}.`, 25, y);
  y += 20;

  if (extra.doctorName) {
    y = addSignatureLine(
      doc,
      `Dr(a). ${extra.doctorName}${extra.doctorLicense ? ' — Mº ' + extra.doctorLicense : ''}`,
      y,
      35,
    );
  } else {
    y = addSignatureLine(doc, 'Assinatura do Declarante', y, 35);
  }
  y += 4;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text(agency.name, 65, y);
  doc.setTextColor(0, 0, 0);

  addFooter(doc, agency);
  return doc;
}
