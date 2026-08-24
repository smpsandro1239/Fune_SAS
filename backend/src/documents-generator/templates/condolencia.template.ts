import jsPDF from 'jspdf';
import {
  AgencyData,
  FuneralData,
  createDoc,
  addLetterhead,
  addFooter,
  addSignatureLine,
  formatDate,
  addParagraph,
  addSeparator,
} from '../pdf.helpers';

export interface CondolenciaData {
  familyName: string;
  message?: string;
}

export function generateCondolencia(
  funeral: FuneralData,
  agency: AgencyData,
  extra: CondolenciaData,
): jsPDF {
  const doc = createDoc();
  let y = addLetterhead(doc, agency);
  y += 4;

  const dateStr = new Date().toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`${agency.location || '___'}, ${dateStr}`, 170, y, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  y += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`Exmo(a). Sr(a). ${extra.familyName}`, 25, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text(`Assunto: Homenagem a ${funeral.deceasedName}`, 25, y);
  y += 10;

  y = addSeparator(doc, y);
  y += 4;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(`${extra.familyName},`, 25, y);
  y += 10;

  const opening = `A ${agency.name} deseja expressar as suas mais sinceras condolências pelo falecimento de ${funeral.deceasedName}, ocorrido em ${formatDate(funeral.dateOfDeath)}${funeral.age ? ', com a idade de ' + funeral.age + ' anos' : ''}.`;
  y = addParagraph(doc, opening, 25, y);
  y += 6;

  const msg =
    extra.message ||
    `Neste momento difícil, gostaríamos de lhe assegurar a nossa total disponibilidade e proximidade. ` +
      `Que a recordação de ${funeral.deceasedName} lhe traga conforto e paz, e que possam encontrar forças ` +
      `nas palavras de conforto e no apoio de todos quantos os rodeiam.`;
  y = addParagraph(doc, msg, 25, y);
  y += 16;

  doc.setFont('helvetica', 'italic');
  doc.setTextColor(60, 65, 80);
  doc.text('Com profundo pesar,', 25, y);
  y += 20;

  y = addSignatureLine(doc, 'Assinatura', y, 55);
  y += 4;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text(agency.name, 85, y, { align: 'center' });

  if (agency.phone || agency.email) {
    y += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const contact = [agency.phone, agency.email].filter(Boolean).join(' | ');
    doc.text(contact, 85, y, { align: 'center' });
  }
  doc.setTextColor(0, 0, 0);

  addFooter(doc, agency);
  return doc;
}
