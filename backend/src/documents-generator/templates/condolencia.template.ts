import jsPDF from 'jspdf';
import { AgencyData, FuneralData, createDoc, addLetterhead, addFooter, addTitle, addSignatureLine, formatDate, addParagraph } from '../pdf.helpers';

export interface CondolenciaData {
  familyName: string;
  message?: string;
}

export function generateCondolencia(funeral: FuneralData, agency: AgencyData, extra: CondolenciaData): jsPDF {
  const doc = createDoc();
  let y = addLetterhead(doc, agency);
  y += 4;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Exmo(a). Sr(a). ${extra.familyName}`, 25, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.text(`Assunto: Homenagem a ${funeral.deceasedName}`, 25, y);
  y += 10;

  const greeting = `${extra.familyName},`;
  doc.setFont('helvetica', 'normal');
  doc.text(greeting, 25, y);
  y += 8;

  const opening = `A ${agency.name} deseja expressar as suas mais sinceras condolências pelo falecimento de ${funeral.deceasedName}, ocorrido em ${formatDate(funeral.dateOfDeath)}.`;
  y = addParagraph(doc, opening, 25, y);
  y += 4;

  const msg = extra.message || `Neste momento difícil, gostaríamos de lhe assegurar a nossa total disponibilidade e proximidade. Que a recordação de ${funeral.deceasedName} lhe traga conforto e paz.`;
  y = addParagraph(doc, msg, 25, y);
  y += 10;

  doc.setFont('helvetica', 'italic');
  doc.text('Com profundo pesar,', 25, y);
  y += 15;

  y = addSignatureLine(doc, 'Assinatura', y);
  doc.setFont('helvetica', 'bold');
  doc.text(agency.name, 60, y);

  addFooter(doc, agency);
  return doc;
}
