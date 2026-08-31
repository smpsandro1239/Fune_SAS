import jsPDF from 'jspdf';
import {
  AgencyData,
  FuneralData,
  createDoc,
  addLetterhead,
  addFooter,
  addTitle,
  addSignatureLine,
  addParagraph,
  addSeparator,
  orBlank,
} from '../pdf.helpers';

export interface PresencaData {
  presentName: string;
  presentRelation: string;
}

export function generatePresenca(
  funeral: FuneralData,
  agency: AgencyData,
  extra: PresencaData,
  sharedDoc?: jsPDF,
): jsPDF {
  const doc = sharedDoc ?? createDoc();
  let y = addLetterhead(doc, agency);
  y = addTitle(doc, 'DECLARAÇÃO DE PRESENÇA', y);
  y += 4;

  y = addParagraph(
    doc,
    `A ${agency.name}, com sede em ${agency.address || '___'}, ${agency.location || '___'},`,
    25,
    y,
  );
  y += 2;

  y = addParagraph(
    doc,
    `declara para todos os efeitos legais que o(a) Sr(a). ${orBlank(extra.presentName, 32)}, na qualidade de ${orBlank(extra.presentRelation, 18)},`,
    25,
    y,
  );
  y += 2;

  y = addParagraph(
    doc,
    `esteve presente no acto fúnebre de ${funeral.deceasedName}${funeral.age ? `, com ${funeral.age} anos de idade` : ''},`,
    25,
    y,
  );
  y += 2;

  y = addParagraph(
    doc,
    `realizado no dia ${formatDateLong(funeral.funeralDate)}${funeral.funeralTime ? ', pelas ' + funeral.funeralTime : ''},`,
    25,
    y,
  );
  y += 2;

  y = addParagraph(
    doc,
    `em ${funeral.locationParish || 'local a definir'}${funeral.cemeteryLocation ? ', com_sepultamento no ' + funeral.cemeteryLocation : ''}.`,
    25,
    y,
  );
  y += 12;

  y = addSeparator(doc, y);
  y += 4;

  y = addParagraph(
    doc,
    'A presente declaração é emitida a pedido do interessado para os fins que se fizerem necessários.',
    25,
    y,
  );
  y += 12;

  const dateStr = new Date().toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  y = addParagraph(doc, `${agency.location || '___'}, ${dateStr}.`, 25, y);
  y += 20;

  y = addSignatureLine(doc, 'Assinatura do Responsável', y, 55);
  y += 4;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text(agency.name, 85, y, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  addFooter(doc, agency);
  return doc;
}

function formatDateLong(dateStr?: string | null): string {
  if (!dateStr) return '___ de __________ de ________';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '___ de __________ de ________';
  return d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
}
