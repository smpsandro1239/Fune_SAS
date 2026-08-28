import {
  PRESET_TEMPLATES,
  FREE_TEMPLATES,
  PREMIUM_TEMPLATES,
  ULTRA_TEMPLATES,
  PLAN_LABELS,
  DEFAULT_FLYER_DATA,
} from './templates-preset';

describe('templates-preset', () => {
  it('define todos os planos', () => {
    expect(PLAN_LABELS.FREE).toBe('Free');
    expect(PLAN_LABELS.PREMIUM).toBe('Premium');
    expect(PLAN_LABELS.ULTRA).toBe('Ultra');
  });

  it('particiona os templates por plano coerente com o total', () => {
    const sum =
      FREE_TEMPLATES.length + PREMIUM_TEMPLATES.length + ULTRA_TEMPLATES.length;
    expect(sum).toBe(PRESET_TEMPLATES.length);
  });

  it('cada template exportado pertence à lista global', () => {
    const ids = new Set(PRESET_TEMPLATES.map((t) => t.id));
    expect(ids.size).toBe(PRESET_TEMPLATES.length);

    for (const t of FREE_TEMPLATES) expect(ids.has(t.id)).toBe(true);
    for (const t of PREMIUM_TEMPLATES) expect(ids.has(t.id)).toBe(true);
    for (const t of ULTRA_TEMPLATES) expect(ids.has(t.id)).toBe(true);
  });

  it('todos os templates têm IDs únicos e configuração completa', () => {
    for (const t of PRESET_TEMPLATES) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(['FREE', 'PREMIUM', 'ULTRA']).toContain(t.plan);
      expect(t.category).toBe('PARTICIPACAO');
      expect(t.primaryColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(t.secondaryColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(t.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(['serif', 'sans', 'display']).toContain(t.fontFamily);
    }
  });

  it('os templates animated estão no plano ULTRA', () => {
    for (const t of PRESET_TEMPLATES) {
      if (t.animated) {
        expect(t.plan).toBe('ULTRA');
      }
    }
  });

  it('DEFAULT_FLYER_DATA tem os valores esperados', () => {
    expect(DEFAULT_FLYER_DATA.deceasedName).toContain('LUÍS FILIPE');
    expect(DEFAULT_FLYER_DATA.agencyName).toContain('Casa Hortas');
    expect(DEFAULT_FLYER_DATA.agencyInitials).toBe('CH');
    expect(DEFAULT_FLYER_DATA.fontFamily).toBe('sans');
  });
});
