import jsPDF from 'jspdf';
import { AgencyData, FuneralData, createDoc, addLetterhead, addFooter, addTitle, addField, formatDate } from '../pdf.helpers';

export interface TransporteData {
  origin: string;
  destination: string;
  vehicleType: string;
  vehiclePlate: string;
  driverName: string;
}

export function generateTransporte(funeral: FuneralData, agency: AgencyData, extra: TransporteData): jsPDF {
  const doc = createDoc();
  let y = addLetterhead(doc, agency);
  y = addTitle(doc, 'GUIA DE TRANSPORTE DE CADÁVER', y + 4);
  y += 8;

  y = addField(doc, 'Falecido(a)', funeral.deceasedName, 25, y);
  y = addField(doc, 'Data de Falecimento', formatDate(funeral.dateOfDeath), 25, y);
  y = addField(doc, 'Nº de Registo', `REG-${Date.now().toString().slice(-6)}`, 25, y);
  y += 4;

  doc.setDrawColor(180, 155, 80);
  doc.setLineWidth(0.3);
  doc.line(25, y, 185, y);
  y += 6;

  y = addField(doc, 'Origem', extra.origin, 25, y);
  y = addField(doc, 'Destino', extra.destination, 25, y);
  y += 4;

  doc.setDrawColor(180, 155, 80);
  doc.line(25, y, 185, y);
  y += 6;

  y = addField(doc, 'Tipo de Veículo', extra.vehicleType, 25, y);
  y = addField(doc, 'Matrícula', extra.vehiclePlate, 25, y);
  y = addField(doc, 'Condutor', extra.driverName, 25, y);
  y += 4;

  doc.setDrawColor(180, 155, 80);
  doc.line(25, y, 185, y);
  y += 6;

  y = addField(doc, 'Data de Transporte', formatDate(funeral.funeralDate), 25, y);
  y = addField(doc, 'Hora', funeral.funeralTime || '___:___', 25, y);

  addFooter(doc, agency);
  return doc;
}
