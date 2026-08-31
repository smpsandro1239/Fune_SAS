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
  addParagraph,
  orBlank,
  formatDate,
} from '../pdf.helpers';

export interface AutorizacaoTransporteData {
  requesterName: string;
  requesterId: string;
  requesterRelation: string;
  destination: string;
  vehicleType?: string;
  vehiclePlate?: string;
  notes?: string;
}

export function generateAutorizacaoTransporte(
  funeral: FuneralData,
  agency: AgencyData,
  extra: AutorizacaoTransporteData,
  sharedDoc?: jsPDF,
): jsPDF {
  const doc = sharedDoc ?? createDoc();
  let y = addLetterhead(doc, agency);
  y = addTitle(doc, 'AUTORIZAÇÃO DE TRANSPORTE DE RESTOS MORTAIS', y);
  y += 4;

  const refNum = `TRP-${Date.now().toString().slice(-6)}`;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Ref: ${refNum}`, 170, y - 4);
  doc.setTextColor(0, 0, 0);
  y += 2;

  y = addParagraph(
    doc,
    `O(A) Sr(a). ${orBlank(extra.requesterName)}, titular do documento de identificação nº ${orBlank(extra.requesterId)}, na qualidade de ${orBlank(extra.requesterRelation)} do(a) falecido(a),`,
    25,
    y,
  );
  y += 2;

  y = addParagraph(
    doc,
    `autoriza a ${agency.name} a proceder ao transporte dos restos mortais de ${funeral.deceasedName}, falecido(a) a ${formatDate(funeral.dateOfDeath)},`,
    25,
    y,
  );
  y += 2;

  y = addParagraph(
    doc,
    `desde ${funeral.wakeLocation || funeral.locationParish || 'o local de velório'} até ${orBlank(extra.destination)},`,
    25,
    y,
  );
  y += 2;

  if (funeral.funeralDate) {
    y = addParagraph(
      doc,
      `realizando-se o transporte no dia ${formatDate(funeral.funeralDate)}, no âmbito da cerimónia fúnebre.`,
      25,
      y,
    );
  } else {
    y = addParagraph(doc, 'no âmbito da cerimónia fúnebre decretada.', 25, y);
  }
  y += 12;

  y = addField(doc, 'Destino', extra.destination || '___', 25, y);
  if (extra.vehicleType) y = addField(doc, 'Tipo de Veículo', extra.vehicleType, 25, y);
  if (extra.vehiclePlate) y = addField(doc, 'Matrícula', extra.vehiclePlate, 25, y);

  if (extra.notes) {
    y += 4;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    const noteLines = doc.splitTextToSize(`Observações: ${extra.notes}`, 160);
    doc.text(noteLines, 25, y);
    doc.setTextColor(0, 0, 0);
  }

  y += 16;
  const dateStr = new Date().toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  y = addParagraph(doc, `${agency.location || '___'}, ${dateStr}.`, 25, y);
  y += 20;

  y = addSignatureLine(doc, 'Assinatura do Requerente', y, 85);
  y += 18;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(extra.requesterName || '___', 115, y, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  addFooter(doc, agency);
  return doc;
}
