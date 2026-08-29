import { photoSrc, photoImageStyle, resolveFontFamily, canvasStyle } from './shared';

describe('photoSrc', () => {
  it('prioriza photoDataUrl sobre photoUrl', () => {
    expect(
      photoSrc({ photoDataUrl: 'data:image/png;base64,x', photoUrl: 'https://x/img.png' } as never),
    ).toBe('data:image/png;base64,x');
  });

  it('usa photoUrl quando não há photoDataUrl', () => {
    expect(photoSrc({ photoDataUrl: '', photoUrl: 'https://x/img.png' } as never)).toBe(
      'https://x/img.png',
    );
  });
});

describe('photoImageStyle', () => {
  it('usa valores por omissão (50/50) sem transformação', () => {
    const style = photoImageStyle();
    expect(style.objectPosition).toBe('50% 50%');
    expect(style.transform).toBeUndefined();
  });

  it('aplica posição e zoom quando especificados', () => {
    const style = photoImageStyle({ x: 25, y: 75, zoom: 1.5 });
    expect(style.objectPosition).toBe('25% 75%');
    expect(style.transform).toBe('scale(1.5)');
  });

  it('não aplica scale quando zoom é 1', () => {
    const style = photoImageStyle({ x: 10, y: 10, zoom: 1 });
    expect(style.transform).toBeUndefined();
  });
});

describe('resolveFontFamily', () => {
  it('resolve serif', () => {
    expect(resolveFontFamily('serif')).toContain('Georgia, serif');
  });
  it('resolve display', () => {
    expect(resolveFontFamily('display')).toContain('Georgia, serif');
  });
  it('resolve sans (default)', () => {
    expect(resolveFontFamily('sans')).toContain('system-ui, sans-serif');
    expect(resolveFontFamily(undefined)).toContain('system-ui, sans-serif');
  });
});

describe('canvasStyle', () => {
  it('define variáveis CSS e fonte', () => {
    const style = canvasStyle({
      accentColor: '#d4af37',
      primaryColor: '#0a192f',
      fontFamily: 'sans',
    } as never) as unknown as Record<string, string>;
    expect(style['--fs-accent']).toBe('#d4af37');
    expect(style['--fs-primary']).toBe('#0a192f');
    expect(style.fontFamily).toContain('system-ui, sans-serif');
  });
});
