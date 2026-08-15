'use client';

import React from 'react';
import { Cross, Flower2 } from 'lucide-react';
import { CANVAS_CLASS, FlyerLayoutProps, canvasStyle } from './shared';
import PhotoImage from '../PhotoImage';

export function EleganteMinimalLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-white text-[var(--fs-primary)] flex flex-col justify-between p-10`}
    >
      <div className="absolute inset-4 border border-[var(--fs-accent)]/45 pointer-events-none"></div>
      <div className="absolute inset-6 border border-[var(--fs-accent)]/20 pointer-events-none"></div>

      <div className="text-center space-y-3 relative z-10">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[var(--fs-accent)] font-semibold">
          {data.title}
        </p>
        <div className="w-16 h-px bg-[var(--fs-accent)]/70 mx-auto"></div>
      </div>

      <div className="relative z-10 text-center space-y-5">
        <div className="w-44 h-52 mx-auto overflow-hidden rounded-sm border border-[var(--fs-accent)]/30 shadow-lg">
          <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-1.5">
          <h1 className="text-[26px] font-semibold tracking-wide text-[var(--fs-primary)] uppercase leading-tight">
            {data.deceasedName}
          </h1>
          <p className="text-xs text-[var(--fs-accent)] tracking-[0.2em] uppercase">{data.age} Anos</p>
        </div>

        <div className="w-24 h-px bg-[var(--fs-accent)]/70 mx-auto"></div>

        <div className="space-y-2.5 text-[13px] text-[var(--fs-primary)]/85 max-w-sm mx-auto">
          <p className="font-semibold uppercase tracking-widest text-[10px] text-[var(--fs-accent)]">
            Cerimónia Funerária
          </p>
          <p>{data.funeralDateFormatted}</p>
          <p className="text-[var(--fs-accent)]">{data.parishLocation}</p>
          <p className="pt-1">
            <span className="uppercase tracking-widest text-[10px] text-[var(--fs-accent)] block mb-1">Cemitério</span>
            {data.cemeteryLocation}
          </p>
        </div>
      </div>

      <div className="relative z-10 text-center border-t border-[var(--fs-accent)]/30 pt-4">
        <p className="text-sm font-medium text-[var(--fs-primary)]">{data.agencyName}</p>
        <p className="text-[10px] text-[var(--fs-accent)]/90 mt-0.5">
          {data.agencyAddress} • {data.agencyWebsite}
        </p>
      </div>
    </div>
  );
}

export function ClassicoSobrioLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-stone-50 text-[var(--fs-primary)] flex flex-col justify-between p-10`}
    >
      <div className="absolute inset-3 border border-[var(--fs-primary)]/80 pointer-events-none"></div>
      <div className="absolute inset-5 border border-[var(--fs-accent)]/60 pointer-events-none"></div>

      <div className="relative z-10 text-center space-y-2">
        <Cross className="w-6 h-6 mx-auto text-[var(--fs-primary)]" strokeWidth={1.5} />
        <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--fs-accent)] font-semibold">
          {data.title}
        </p>
      </div>

      <div className="relative z-10 text-center space-y-5">
        <div className="w-40 h-40 mx-auto rounded-full border border-[var(--fs-primary)] p-1.5 shadow-inner">
          <div className="w-full h-full rounded-full overflow-hidden">
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover grayscale-[15%]" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold uppercase tracking-wide">{data.deceasedName}</h1>
          <p className="text-xs tracking-[0.25em] text-[var(--fs-accent)]">{data.age} ANOS</p>
        </div>

        <div className="max-w-sm mx-auto border border-[var(--fs-accent)]/70 p-5 space-y-3 text-[12px] text-[var(--fs-primary)]/85 leading-relaxed">
          <div>
            <p className="font-bold tracking-widest text-[10px] uppercase mb-0.5">Funeral</p>
            <p>{data.funeralDateFormatted}</p>
            <p>{data.parishLocation}</p>
          </div>
          <div>
            <p className="font-bold tracking-widest text-[10px] uppercase mb-0.5">Cemitério</p>
            <p>{data.cemeteryLocation}</p>
          </div>
          {data.wakeDetailsFormatted && (
            <div>
              <p className="font-bold tracking-widest text-[10px] uppercase mb-0.5">Velório</p>
              <p>{data.wakeDetailsFormatted}</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 text-center space-y-2">
        <div className="flex items-center justify-center gap-3 text-[var(--fs-accent)]">
          <div className="h-px w-12 bg-[var(--fs-accent)]"></div>
          <Cross className="w-3.5 h-3.5" strokeWidth={1.5} />
          <div className="h-px w-12 bg-[var(--fs-accent)]"></div>
        </div>
        <p className="text-sm font-semibold">{data.agencyName}</p>
        <p className="text-[10px] text-[var(--fs-accent)]">
          {data.agencyAddress} • {data.agencyWebsite}
        </p>
      </div>
    </div>
  );
}

export function FloralSuaveLayout({ data, previewRef }: FlyerLayoutProps) {
  const petal = (cx: number, cy: number, r = 10, opacity = 0.55) => (
    <g transform={`translate(${cx},${cy})`} opacity={opacity}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse
          key={a}
          cx={r}
          cy={0}
          rx={r * 0.55}
          ry={r * 0.8}
          style={{ fill: 'var(--fs-accent)' }}
          transform={`rotate(${a})`}
        />
      ))}
      <circle r={r * 0.45} style={{ fill: 'var(--fs-accent)' }} />
    </g>
  );

  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-[#fdfbf7] text-[var(--fs-primary)] flex flex-col justify-between p-10`}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 520 760" preserveAspectRatio="none">
        {petal(52, 52)}
        {petal(468, 52)}
        {petal(52, 708, 9, 0.4)}
        {petal(468, 708, 9, 0.4)}
      </svg>

      <div className="relative z-10 text-center space-y-1.5">
        <Flower2 className="w-5 h-5 mx-auto text-[var(--fs-accent)]" strokeWidth={1.5} />
        <p className="text-[10px] tracking-[0.35em] uppercase text-[var(--fs-accent)] font-semibold">
          {data.title}
        </p>
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="w-40 h-52 mx-auto overflow-hidden rounded-t-[90px] rounded-b-md border border-[var(--fs-accent)]/70 shadow-md">
          <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover sepia-[12%]" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-[var(--fs-primary)] uppercase tracking-wide">{data.deceasedName}</h1>
          <p className="text-[11px] tracking-[0.3em] uppercase text-[var(--fs-accent)]">{data.age} Anos</p>
        </div>

        <div className="flex items-center justify-center gap-3 text-[var(--fs-accent)]">
          <div className="h-px w-16 bg-[var(--fs-accent)]/60"></div>
          <Flower2 className="w-4 h-4" strokeWidth={1.5} />
          <div className="h-px w-16 bg-[var(--fs-accent)]/60"></div>
        </div>

        <div className="max-w-sm mx-auto space-y-3 text-[12.5px] leading-relaxed text-[var(--fs-primary)]/85">
          <div>
            <p className="font-semibold tracking-widest text-[10px] uppercase text-[var(--fs-accent)] mb-0.5">Cerimónia</p>
            <p>{data.funeralDateFormatted}</p>
            <p>{data.parishLocation}</p>
          </div>
          <div>
            <p className="font-semibold tracking-widest text-[10px] uppercase text-[var(--fs-accent)] mb-0.5">Cemitério</p>
            <p>{data.cemeteryLocation}</p>
          </div>
          <div>
            <p className="font-semibold tracking-widest text-[10px] uppercase text-[var(--fs-accent)] mb-0.5">Velório</p>
            <p className="text-[var(--fs-primary)]/75">{data.wakeDetailsFormatted}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center border-t border-[var(--fs-accent)]/40 pt-3">
        <p className="text-[13px] font-semibold text-[var(--fs-primary)] italic">{data.agencyName}</p>
        <p className="text-[10px] text-[var(--fs-accent)]">{data.agencyAddress} • {data.agencyWebsite}</p>
      </div>
    </div>
  );
}
