'use client';

import React from 'react';
import { CANVAS_CLASS, FlyerLayoutProps, canvasStyle } from './shared';
import PhotoImage from '../PhotoImage';

/* ============================ ANJO GUARDIÃO (PREMIUM) ============================ */

export function AnjoGuardiaoLayout({ data, previewRef }: FlyerLayoutProps) {
  const wing = (flip = false) => (
    <g transform={flip ? 'translate(520,0) scale(-1,1)' : undefined} opacity="0.85">
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M ${18 + i * 4} ${150 + i * 46}
              C ${60 + i * 10} ${120 + i * 40}, ${110 - i * 6} ${140 + i * 42}, ${128 - i * 8} ${190 + i * 44}
              C ${96 - i * 4} ${172 + i * 40}, ${52 + i * 2} ${176 + i * 40}, ${18 + i * 4} ${150 + i * 46} Z`}
          style={{ fill: 'var(--fs-accent)', opacity: 0.28 + i * 0.08 }}
        />
      ))}
    </g>
  );

  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-[#fbf7ee] text-[var(--fs-primary)] flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(255,244,214,0.95) 0%, transparent 70%)' }} />

      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 520 760">
        {wing(false)}
        {wing(true)}
        <circle cx="260" cy="34" r="26" fill="none" stroke="var(--fs-accent)" strokeOpacity="0.5" strokeWidth="1" />
        <circle cx="260" cy="34" r="17" fill="none" stroke="var(--fs-accent)" strokeOpacity="0.3" strokeWidth="1" />
      </svg>

      <div className="relative z-10 text-center space-y-1">
        <p className="text-[10px] tracking-[0.45em] uppercase font-semibold" style={{ color: 'var(--fs-accent)' }}>
          {data.title}
        </p>
        <p className="text-[11px] italic text-[var(--fs-primary)]/50">sob a proteção do Senhor</p>
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="relative w-44 h-56 mx-auto">
          <div className="absolute -inset-3 rounded-t-full border border-[var(--fs-accent)]/45 pointer-events-none"
            style={{ boxShadow: '0 12px 34px rgba(180,150,80,0.22)' }} />
          <div className="w-full h-full overflow-hidden rounded-t-full shadow-lg ring-1 ring-[var(--fs-accent)]/30">
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover sepia-[10%]" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-[26px] font-semibold uppercase tracking-wide leading-tight text-[var(--fs-primary)]">
            {data.deceasedName}
          </h1>
          <p className="text-[11px] tracking-[0.35em] uppercase" style={{ color: 'var(--fs-accent)' }}>
            {data.age} Anos
          </p>
        </div>

        <div className="max-w-xs mx-auto space-y-3 text-[12px] text-[var(--fs-primary)]/85">
          {[
            { label: 'Cerimónia', value: `${data.funeralDateFormatted} · ${data.parishLocation}` },
            { label: 'Cemitério', value: data.cemeteryLocation },
            ...(data.wakeDetailsFormatted ? [{ label: 'Velório', value: data.wakeDetailsFormatted }] : []),
          ].map((row) => (
            <div key={row.label}>
              <p className="text-[9px] uppercase tracking-[0.28em] font-bold mb-0.5" style={{ color: 'var(--fs-accent)' }}>
                {row.label}
              </p>
              <p className="leading-relaxed">{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center space-y-0.5 pt-3 border-t border-[var(--fs-accent)]/30">
        <p className="text-[13px] font-semibold text-[var(--fs-primary)]">{data.agencyName}</p>
        <p className="text-[10px] text-[var(--fs-primary)]/55">{data.agencyAddress} • {data.agencyWebsite}</p>
      </div>
    </div>
  );
}

/* ============================ FOLHAS DE OUTONO (FREE) ============================ */

export function FolhasOutonoLayout({ data, previewRef }: FlyerLayoutProps) {
  const leafShape = (cx: number, cy: number, rot: number, s = 1, o = 0.5, anim?: string) => (
    <g key={`${cx}-${cy}`} transform={`translate(${cx},${cy}) rotate(${rot}) scale(${s})`} opacity={o}
      className={anim}>
      <path d="M0,-16 C10,-10 12,2 6,10 L0,16 L-6,10 C-12,2 -10,-10 0,-16 Z" style={{ fill: 'var(--fs-accent)' }} />
      <line x1="0" y1="-14" x2="0" y2="14" stroke="#fff" strokeWidth="0.8" strokeOpacity="0.5" />
    </g>
  );

  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-[#faf6ef] text-[var(--fs-primary)] flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(165deg, rgba(214,164,110,0.10) 0%, transparent 45%)' }} />

      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 520 760">
        {leafShape(58, 70, 40, 1.1)}
        {leafShape(462, 90, -30, 0.9, 0.45, 'fs-anim-float')}
        {leafShape(40, 300, 70, 0.8, 0.35, 'fs-anim-drift')}
        {leafShape(480, 340, -55, 1, 0.4)}
        {leafShape(70, 640, 25, 0.9, 0.4, 'fs-anim-float')}
        {leafShape(455, 668, -20, 1.05)}
      </svg>

      <div className="relative z-10 text-center space-y-1">
        <p className="text-[10px] tracking-[0.4em] uppercase font-semibold" style={{ color: 'var(--fs-accent)' }}>
          {data.title}
        </p>
        <div className="w-14 h-px mx-auto" style={{ backgroundColor: 'var(--fs-accent)', opacity: 0.6 }} />
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="w-44 h-54 h-[216px] mx-auto overflow-hidden rounded-xl shadow-md ring-1 ring-[var(--fs-accent)]/25 relative">
          <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover sepia-[15%]" />
        </div>

        <div className="space-y-0.5">
          <h1 className="text-[25px] font-bold uppercase tracking-wide leading-tight text-[var(--fs-primary)]">
            {data.deceasedName}
          </h1>
          <p className="text-[11px] tracking-[0.3em] uppercase" style={{ color: 'var(--fs-accent)' }}>
            · {data.age} anos ·
          </p>
        </div>

        <div className="max-w-xs mx-auto rounded-lg px-5 py-4 space-y-2.5 text-left text-[12px]"
          style={{ backgroundColor: 'rgba(214,164,110,0.10)' }}>
          {[
            { label: 'Funeral', value: data.funeralDateFormatted },
            { label: 'Local', value: data.parishLocation },
            { label: 'Cemitério', value: data.cemeteryLocation },
          ].map((row) => (
            <div key={row.label}>
              <p className="text-[9px] uppercase tracking-[0.25em] font-bold mb-0.5" style={{ color: 'var(--fs-accent)' }}>
                {row.label}
              </p>
              <p className="text-[var(--fs-primary)]/85">{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center pt-3">
        <p className="text-[13px] font-semibold text-[var(--fs-primary)]">{data.agencyName}</p>
        <p className="text-[10px] text-[var(--fs-primary)]/55">{data.agencyAddress} • {data.agencyWebsite}</p>
      </div>
    </div>
  );
}

/* ============================ CRISTAL AZUL (PREMIUM) ============================ */

export function CristalAzulLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} text-white flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, #0a1628 0%, #10233f 48%, #16304f 100%)' }} />
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(120,170,220,0.18), transparent 65%)' }} />
      <div className="absolute -bottom-20 -right-16 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--fs-accent), transparent 70%)', opacity: 0.16 }} />

      <div className="absolute top-24 right-8 w-20 h-px bg-white/15 rotate-45 pointer-events-none" />
      <div className="absolute top-32 right-16 w-10 h-px bg-white/10 rotate-45 pointer-events-none" />

      <div className="relative z-10 text-center space-y-1">
        <div className="inline-block px-4 py-1 rounded-full ring-1 ring-white/25 bg-white/10 backdrop-blur-sm">
          <p className="text-[10px] tracking-[0.4em] uppercase font-semibold text-white/95">
            {data.title}
          </p>
        </div>
      </div>

      <div className="relative z-10 text-center space-y-5">
        <div className="relative w-40 h-40 mx-auto">
          <div className="absolute -inset-2 rounded-full ring-1 pointer-events-none"
            style={{ borderColor: 'transparent', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)' }} />
          <div className="absolute -inset-2 rounded-full overflow-hidden opacity-60 pointer-events-none"
            style={{ background: `conic-gradient(from 200deg, transparent, var(--fs-accent), transparent 60%)` }} />
          <div className="w-full h-full rounded-full overflow-hidden shadow-2xl ring-2 ring-white/30">
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover brightness-105" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-[26px] font-light uppercase tracking-[0.08em] leading-tight text-white">
            {data.deceasedName}
          </h1>
          <p className="text-[10px] tracking-[0.4em] uppercase text-white/60">{data.age} Anos</p>
        </div>

        <div className="max-w-xs mx-auto rounded-2xl overflow-hidden ring-1 ring-white/15 backdrop-blur-md divide-y divide-white/10"
          style={{ background: 'rgba(255,255,255,0.07)' }}>
          {[
            { label: 'Funeral', value: data.funeralDateFormatted },
            { label: 'Local', value: data.parishLocation },
            { label: 'Cemitério', value: data.cemeteryLocation },
          ].map((row) => (
            <div key={row.label} className="px-5 py-2.5 flex items-baseline gap-3 text-left">
              <span className="text-[9px] uppercase tracking-[0.22em] font-bold shrink-0 w-20" style={{ color: 'var(--fs-accent)' }}>
                {row.label}
              </span>
              <span className="text-[11.5px] text-white/90 leading-snug">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center space-y-1">
        <div className="mx-auto mb-1 w-24 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <p className="text-sm font-medium tracking-wide text-white">{data.agencyName}</p>
        <p className="text-[10px] text-white/55">{data.agencyAddress} • {data.agencyWebsite}</p>
      </div>
    </div>
  );
}
