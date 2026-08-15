import { FlyerData } from './types';

const PORTRAIT_URI = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='520'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#d7dee8'/><stop offset='1' stop-color='#9aa7b8'/></linearGradient></defs><rect width='400' height='520' fill='url(#g)'/><circle cx='200' cy='185' r='72' fill='#f1f5f9' opacity='0.9'/><path d='M60 520c22-118 86-168 140-168s118 50 140 168z' fill='#e2e8f0' opacity='0.95'/></svg>`
)}`;

export const SAMPLE_FLYER_DATA: FlyerData = {
  title: 'PARTICIPAÇÃO DE FALECIMENTO',
  deceasedName: 'MARIA DE LURDES ANTUNES',
  age: 78,
  photoUrl: PORTRAIT_URI,
  funeralDate: '2026-08-18',
  funeralTime: '14:30',
  funeralDateFormatted: 'Terça-feira, dia 18 de agosto, 14:30 horas',
  parishLocation: 'Igreja Matriz de Barcelos',
  cemeteryLocation: 'Cemitério Municipal de Barcelos',
  deathLocation: 'Hospital de Braga',
  wakeDate: '2026-08-18',
  wakeTime: '10:00',
  wakeLocation: 'Capela Mortuária de Barcelos',
  wakeDetailsFormatted: 'Terça-feira, dia 18 de agosto, 10:00 horas, na Capela Mortuária de Barcelos',
  agencyName: 'Funerária Casa Hortas, Lda',
  agencyAddress: 'Rua das Maceirinhas, Cabreiros, Braga',
  agencyLocation: 'Ventosa, Vieira do Minho',
  agencyFounded: 'DESDE 1890',
  agencyWebsite: 'www.casahortas.com',
  agencyLogoUrl: '',
  agencyLogoType: 'INITIALS',
  agencyInitials: 'CH',
  primaryColor: '#0a192f',
  accentColor: '#d4af37',
  fontFamily: 'sans',
};
