import jsPDF from 'jspdf';
import { AgencyData, FuneralData, createDoc, addLetterhead, addFooter, addTitle, addField, addSignatureLine, formatDate, addParagraph, addSeparator } from '../pdf.helpers';

export interface AutorizacaoSepultamentoData {
  requesterName: string;
  requesterId: string;
  requesterRelation: string;
}

export function generateAutorizacaoSepultamento(funeral: FuneralData, agency: AgencyData, extra: AutorizacaoSepultamentoData): jsPDF {
  const doc = createDoc();
  let y = addLetterhead(doc, agency);
  y = addTitle(doc, 'AUTORIZAÇÃO DE SEPULTAMENTO', y);
  y += 6;

  const declText = `Eu, ${extra.requesterName}, portador(a) do Cartão de Cidadão nº ${extra.requesterId}, na qualidade de ${extra.requesterRelation} do(a) falecido(a), autorizo o sepultamento do corpo nos termos da lei.`;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  const lines = doc.splitTextToSize(declText, 160);
  doc.text(lines, 25, y);
  y += lines.length * 5.5 + 10;

  y = addSeparator(doc, y);
  y += 4;

  y = addField(doc, 'Falecido(a)', funeral.deceasedName, 30, y);
  y = addField(doc, 'Nascimento', formatDate(funeral.dateOfBirth), 30, y);
  y = addField(doc, 'Óbito', formatDate(funeral.dateOfDeath), 30, y);
  y = addField(doc, 'Local do Óbito', funeral.placeOfDeath || '___', 30, y);
  y += 4;

  y = addSeparator(doc, y);
  y += 4;

  y = addField(doc, 'Cemitério', funeral.cemeteryLocation || '___', 30, y);
  y = addField(doc, 'Data de Sepultamento', formatDate(funeral.funeralDate), 30, y);
  y = addField(doc, 'Hora', funeral.funeralTime || '___:___', 30, y);
  y += 4;

  y = addSeparator(doc, y);
  y += 4;

  y = addField(doc, 'Entidade Responsável', agency.name, 30, y);
  y = addField(doc, 'Contacto', agency.phone || '___', 30, y);
  y += 8;

  const dateStr = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 65, 80);
  doc.text(`${agency.location || '___'}, ${dateStr}.`, 25, y);
  doc.setTextColor(0, 0, 0);
  y += 20;

  y = addSignatureLine(doc, 'Assinatura do Requerente', y, 35);
  y += 8;
  y = addSignatureLine(doc, 'Assinatura da Agência', y, 110);

  addFooter(doc, agency);
  return doc;
}
