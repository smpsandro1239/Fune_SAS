import { FlyerData, FlyerFontFamily, PhotoTransform } from '@/lib/types';

export interface FlyerLayoutProps {
  data: FlyerData;
  previewRef?: React.RefObject<HTMLDivElement>;
}

export const CANVAS_CLASS =
  'w-[520px] h-[760px] relative overflow-hidden shadow-2xl';

export function photoSrc(data: FlyerData): string {
  return data.photoDataUrl || data.photoUrl;
}

export function photoImageStyle(transform?: PhotoTransform): React.CSSProperties {
  return {
    objectPosition: `${transform?.x ?? 50}% ${transform?.y ?? 50}%`,
    transform: transform && transform.zoom !== 1 ? `scale(${transform.zoom})` : undefined,
    transformOrigin: 'center center',
  };
}

export function resolveFontFamily(fontFamily?: FlyerFontFamily): string {
  switch (fontFamily) {
    case 'serif':
      return 'var(--font-cinzel), Georgia, serif';
    case 'display':
      return 'var(--font-display), Georgia, serif';
    case 'sans':
    default:
      return 'var(--font-inter), system-ui, sans-serif';
  }
}

export function canvasStyle(data: FlyerData): React.CSSProperties {
  return {
    ['--fs-accent' as string]: data.accentColor,
    ['--fs-primary' as string]: data.primaryColor,
    fontFamily: resolveFontFamily(data.fontFamily),
  };
}
