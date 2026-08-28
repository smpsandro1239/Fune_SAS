import {
  parseDateValue,
  toISODate,
  toISOTime,
  formatPTDate,
  combineDateAndTime,
} from './date-utils';

describe('parseDateValue', () => {
  it('devolve null para valores vazios', () => {
    expect(parseDateValue(null)).toBeNull();
    expect(parseDateValue(undefined)).toBeNull();
    expect(parseDateValue('')).toBeNull();
  });

  it('devolve null para datas inválidas', () => {
    expect(parseDateValue('não é uma data')).toBeNull();
    expect(parseDateValue('2026-99-99')).toBeNull();
  });

  it('faz parse de datas válidas', () => {
    const result = parseDateValue('2026-07-08');
    expect(result).not.toBeNull();
    expect(result!.getFullYear()).toBe(2026);
    expect(result!.getMonth()).toBe(6);
    expect(result!.getDate()).toBe(8);
  });
});

describe('toISODate', () => {
  it('formata ano-mês-dia com zeros à esquerda', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toISODate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('toISOTime', () => {
  it('formata HH:mm com zeros à esquerda', () => {
    expect(toISOTime(new Date(2026, 0, 1, 9, 5))).toBe('09:05');
    expect(toISOTime(new Date(2026, 0, 1, 14, 30))).toBe('14:30');
  });
});

describe('formatPTDate', () => {
  it('devolve string vazia quando a data é nula', () => {
    expect(formatPTDate(null)).toBe('');
    expect(formatPTDate(undefined)).toBe('');
  });

  it('formata dia da semana, dia e mês em português', () => {
    // 8 de julho de 2026 é uma quarta-feira
    const date = new Date(2026, 6, 8);
    expect(formatPTDate(date)).toBe('Quarta-feira, dia 8 de julho');
  });

  it('inclui a hora quando withTime é true', () => {
    const date = new Date(2026, 6, 8, 17, 0);
    expect(formatPTDate(date, true)).toBe('Quarta-feira, dia 8 de julho, 17:00 horas');
  });
});

describe('combineDateAndTime', () => {
  it('devolve null quando a data não existe', () => {
    expect(combineDateAndTime(null)).toBeNull();
    expect(combineDateAndTime('', '10:00')).toBeNull();
  });

  it('combina data e hora quando esta é fornecida', () => {
    const result = combineDateAndTime('2026-07-08', '17:30');
    expect(result).not.toBeNull();
    expect(result!.getHours()).toBe(17);
    expect(result!.getMinutes()).toBe(30);
  });

  it('mantém a hora original quando não é fornecida', () => {
    const result = combineDateAndTime('2026-07-08');
    expect(result!.getHours()).toBe(parseDateValue('2026-07-08')!.getHours());
  });

  it('ignora hora inválida', () => {
    const result = combineDateAndTime('2026-07-08', 'abc');
    expect(result!.getHours()).toBe(parseDateValue('2026-07-08')!.getHours());
  });
});
