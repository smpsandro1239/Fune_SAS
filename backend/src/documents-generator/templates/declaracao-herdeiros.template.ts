import jsPDF from 'jspdf';
import { AgencyData, FuneralData, createDoc, addLetterhead, addFooter, addTitle, addField, addSignatureLine, formatDate, addParagraph, addSeparator, addBox } from '../pdf.helpers';

export interface Herdeiro {
  name: string;
  idNumber: string;
  relationship: string;
}

export interface DeclaracaoHerdeirosData {
  heirs: Herdeiro[];
  deceasedMaritalStatus?: string;
  deceasedAddress?: string;
}

export function generateDeclaracaoHerdeiros(funeral: FuneralData, agency: AgencyData, extra: DeclaracaoHerdeirosData): jsPDF {
  const doc = createDoc();
  let y = addLetterhead(doc, agency);
  y = addTitle(doc, 'DECLARAÇÃO DE HERDEIROS', y);
  y += 6;

  const opening = `Eu, abaixo assinado(a), na qualidade de declarante, venho por este meio declarar que o(a) falecido(a) ${funeral.deceasedName}, nascido(a) em ${formatDate(funeral.dateOfBirth)}${funeral.age ? ', com a idade de ' + funeral.age + ' anos' : ''}, falecido(a) em ${formatDate(funeral.dateOfDeath)}${extra.deceasedMaritalStatus ? ', estado civil ' + extra.deceasedMaritalStatus : ''}${extra.deceasedAddress ? ', residente em ' + extra.deceasedAddress : ''}, é(a) titular dos bens e direitos abaixo indicados, e que os seus herdeiros legais são os seguintes:`;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  const lines = doc.splitTextToSize(opening, 160);
  doc.text(lines, 25, y);
  y += lines.length * 5.5 + 10;

  y = addSeparator(doc, y);
  y += 4;

  const colX = [25, 95, 130, 165];
  doc.setFillColor(40, 45, 65);
  doc.roundedRect(25, y - 4, 160, 9, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  ['Nome', 'Nº ID', 'Parentesco'].forEach((h, i) => doc.text(h, colX[i], y + 2));
  doc.setTextColor(0, 0, 0);
  y += 10;

  extra.heirs.forEach((heir, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 246, 240);
      doc.rect(25, y - 4, 160, 7, 'F');
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(heir.name.substring(0, 40), colX[0], y);
    doc.text(heir.idNumber, colX[1], y);
    doc.text(heir.relationship, colX[2], y);
    y += 7;
  });

  doc.setTextColor(0, 0, 0);
  y += 6;

  y = addSeparator(doc, y);
  y += 4;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text('Declaro, ainda, que a presente declaração é emitida para todos os efeitos legais, nomeadamente para:', 25, y);
  y += 8;

  const purposes = [
    'Abertura de processo de inventário ou certidão de óbito',
    'Registo da transferência de bens e direitos',
    'Liquidação de impostos e demais obrigações fiscais',
    'Outros efeitos legais que se apliquem'
  ];
  purposes.forEach(p => {
    doc.setFontSize(10);
    doc.text(`• ${p}`, 30, y);
    y += 6;
  });

  y += 10;

  const dateStr = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFontSize(10);
  doc.text(`${agency.location || '___'}, ${dateStr}.`, 25, y);
  y += 14;

  y = addSeparator(doc, y);
  y += 4;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('A presente declaração é assinada a oral e sob compromisso de honra do declarante, sob pena de responsabilidade civil e criminal.', 25, y);
  doc.setTextColor(0, 0, 0);
  y += 16;

  y = addSignatureLine(doc, 'Assinatura do Declarante', y, 35);
  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Carimbo / Firma da Agência Funerária', 100, y + 2);
  doc.text(agency.name, 100, y + 9);
  doc.setTextColor(0, 0, 0);

  addFooter(doc, agency);
  return doc;
}
