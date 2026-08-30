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
  orBlank,
} from '../pdf.helpers';

export interface CremacaoData {
  requesterName: string;
  requesterId: string;
  requesterRelation: string;
  requesterAddress: string;
}

export function generateCremacao(
  funeral: FuneralData,
  agency: AgencyData,
  extra: CremacaoData,
  sharedDoc?: jsPDF,
): jsPDF {
  const doc = sharedDoc ?? createDoc();
  let y = addLetterhead(doc, agency);
  y = addTitle(doc, 'AUTORIZAÇÃO DE CREMAÇÃO', y);
  y += 6;

  const introLines = doc.splitTextToSize(
    `Eu, ${orBlank(extra.requesterName)}, portador(a) do Cartão de Cidadão nº ${orBlank(extra.requesterId)}, residente em ${orBlank(extra.requesterAddress)}, na qualidade de ${orBlank(extra.requesterRelation)} do(a) falecido(a):`,
    160,
  );
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text(introLines, 25, y);
  y += introLines.length * 5.5 + 6;

  addBox(doc, 55, y - 4, 100, 14);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text(funeral.deceasedName.toUpperCase(), 105, y + 5, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  y += 18;

  y = addField(doc, 'Nascido(a) em', formatDate(funeral.dateOfBirth), 30, y);
  y = addField(doc, 'Falecido(a) em', formatDate(funeral.dateOfDeath), 30, y);
  y = addField(doc, 'Local do óbito', funeral.placeOfDeath || '___', 30, y);
  y += 6;

  const authText =
    'Autorizo a cremação do corpo do(a) supracitado(a), em conformidade com a legislação em vigor, cedendo todos os direitos sobre as cinzas à instituição acima referida.';
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(60, 65, 80);
  const authLines = doc.splitTextToSize(authText, 160);
  doc.text(authLines, 25, y);
  y += authLines.length * 5.5 + 10;

  y = addSeparator(doc, y);
  y += 2;

  y = addField(doc, 'Data', formatDate(new Date().toISOString()), 30, y);
  y += 10;
  y = addSignatureLine(doc, 'Assinatura do Requerente', y, 35);

  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text(`Presença da Agência: ${agency.name}${agency.phone ? ' — ' + agency.phone : ''}`, 25, y);
  doc.setTextColor(0, 0, 0);

  addFooter(doc, agency);
  return doc;
}
