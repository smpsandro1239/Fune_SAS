import jsPDF from 'jspdf';
import { AgencyData, FuneralData, createDoc, addLetterhead, addFooter, addTitle, addField, addSignatureLine, formatDate } from '../pdf.helpers';

export interface CremacaoData {
  requesterName: string;
  requesterId: string;
  requesterRelation: string;
  requesterAddress: string;
}

export function generateCremacao(funeral: FuneralData, agency: AgencyData, extra: CremacaoData): jsPDF {
  const doc = createDoc();
  let y = addLetterhead(doc, agency);
  y = addTitle(doc, 'AUTORIZAÇÃO DE CREMAÇÃO', y + 4);
  y += 8;

  const lines = doc.splitTextToSize(
    `Eu, ${extra.requesterName}, portador do Cartão de Cidadão nº ${extra.requesterId}, residente em ${extra.requesterAddress}, na qualidade de ${extra.requesterRelation} do(a) falecido(a):`,
    170
  );
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(lines, 20, y);
  y += lines.length * 5 + 4;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(funeral.deceasedName.toUpperCase(), 105, y, { align: 'center' });
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  y = addField(doc, 'Nascido(a) em', formatDate(funeral.dateOfBirth), 25, y);
  y = addField(doc, 'Falecido(a) em', formatDate(funeral.dateOfDeath), 25, y);
  y = addField(doc, 'Local do óbito', funeral.placeOfDeath || '___', 25, y);
  y += 4;

  const authText = 'Autorizo a cremação do corpo do(a) supracitado(a), em conformidade com a legislação em vigor.';
  doc.setFontSize(11);
  doc.setFont('helvetica', 'italic');
  const authLines = doc.splitTextToSize(authText, 170);
  doc.text(authLines, 25, y);
  y += authLines.length * 5 + 6;

  y = addField(doc, 'Data', formatDate(new Date().toISOString()), 25, y);
  y += 6;
  y = addSignatureLine(doc, 'Assinatura do Requerente', y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`Presença da Agência: ${agency.name} — ${agency.phone || ''}`, 25, y);

  addFooter(doc, agency);
  return doc;
}
