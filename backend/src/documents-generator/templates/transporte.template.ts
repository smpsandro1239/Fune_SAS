import jsPDF from 'jspdf';
import {
  AgencyData,
  FuneralData,
  createDoc,
  addLetterhead,
  addFooter,
  addTitle,
  addField,
  formatDate,
  addBox,
  addSeparator,
} from '../pdf.helpers';

export interface TransporteData {
  origin: string;
  destination: string;
  vehicleType: string;
  vehiclePlate: string;
  driverName: string;
}

export function generateTransporte(
  funeral: FuneralData,
  agency: AgencyData,
  extra: TransporteData,
  sharedDoc?: jsPDF,
): jsPDF {
  const doc = sharedDoc ?? createDoc();
  let y = addLetterhead(doc, agency);
  y = addTitle(doc, 'GUIA DE TRANSPORTE DE CADÁVER', y);
  y += 6;

  y = addField(doc, 'Nº de Registo', `REG-${Date.now().toString().slice(-6)}`, 30, y);
  y = addField(doc, 'Data de Emissão', formatDate(new Date().toISOString()), 30, y);
  y += 4;

  y = addSeparator(doc, y);
  y += 2;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text('Dados do Falecido', 25, y);
  y += 8;

  y = addField(doc, 'Nome', funeral.deceasedName, 30, y);
  y = addField(doc, 'Data de Falecimento', formatDate(funeral.dateOfDeath), 30, y);
  if (funeral.age) {
    y = addField(doc, 'Idade', `${funeral.age} anos`, 30, y);
  }
  y += 4;

  y = addSeparator(doc, y);
  y += 2;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text('Itinerário', 25, y);
  y += 8;

  addBox(doc, 25, y - 3, 160, 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  doc.text('Origem:', 32, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(extra.origin || '___', 55, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text('Destino:', 32, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.text(extra.destination || '___', 55, y + 14);
  doc.setTextColor(0, 0, 0);
  y += 26;

  y = addSeparator(doc, y);
  y += 2;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text('Dados do Veículo e Condutor', 25, y);
  y += 8;

  y = addField(doc, 'Tipo de Veículo', extra.vehicleType || '___', 30, y);
  y = addField(doc, 'Matrícula', extra.vehiclePlate || '___', 30, y);
  y = addField(doc, 'Condutor', extra.driverName || '___', 30, y);
  y += 4;

  y = addSeparator(doc, y);
  y += 2;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 45, 65);
  doc.text('Data e Hora do Transporte', 25, y);
  y += 8;

  y = addField(doc, 'Data', formatDate(funeral.funeralDate), 30, y);
  y = addField(doc, 'Hora', funeral.funeralTime || '___:___', 30, y);

  addFooter(doc, agency);
  return doc;
}
