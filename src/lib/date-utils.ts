const WEEKDAYS_PT = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const MONTHS_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

export function parseDateValue(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toISOTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function formatPTDate(date: Date | null | undefined, withTime = false): string {
  if (!date) return '';
  const weekday = WEEKDAYS_PT[date.getDay()];
  const month = MONTHS_PT[date.getMonth()];
  const time = withTime
    ? `, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} horas`
    : '';
  return `${weekday}, dia ${date.getDate()} de ${month}${time}`;
}

export function combineDateAndTime(dateValue?: string | null, timeValue?: string | null): Date | null {
  const date = parseDateValue(dateValue);
  if (!date) return null;
  if (timeValue) {
    const [hours, minutes] = timeValue.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      date.setHours(hours, minutes);
    }
  }
  return date;
}
