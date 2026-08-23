'use client';

import React from 'react';
import { CANVAS_CLASS, FlyerLayoutProps, canvasStyle } from './shared';
import PhotoImage from '../PhotoImage';

/* ============================ HORIZONTE SERENO (PREMIUM) ============================ */

export function HorizonteSerenoLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} text-white flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #1b2440 0%, #33415e 36%, #7d6b7f 56%, var(--fs-accent) 74%, #f4e3c2 88%, #fdf6ea 100%)',
        }} />
      <div className="absolute left-1/2 top-[60%] -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,236,190,0.6) 0%, transparent 65%)' }} />

      <div className="relative z-10 text-center space-y-1">
        <p className="text-[10px] tracking-[0.45em] uppercase text-white/90 font-semibold drop-shadow">{data.title}</p>
        <div className="w-24 h-px bg-white/50 mx-auto" />
      </div>

      <div className="relative z-10 text-center space-y-3">
        <div className="w-44 h-52 mx-auto overflow-hidden rounded-lg shadow-2xl ring-2 ring-white/40">
          <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover" />
        </div>

        <h1 className="text-[26px] font-bold uppercase tracking-wide leading-tight"
          style={{ textShadow: '0 2px 12px rgba(20,20,40,0.45)' }}>
          {data.deceasedName}
        </h1>
        <p className="text-[11px] tracking-[0.35em] uppercase text-white/85">{data.age} Anos</p>

        <div className="mx-auto max-w-xs bg-black/30 backdrop-blur-md rounded-lg p-4 space-y-2 text-left text-[12px] text-white/90 ring-1 ring-white/15">
          {[
            { label: 'Funeral', value: data.funeralDateFormatted },
            { label: 'Local', value: data.parishLocation },
            { label: 'Cemitério', value: data.cemeteryLocation },
          ].map((row) => (
            <div key={row.label}>
              <p className="text-[9px] uppercase tracking-[0.25em] text-white/70 font-bold mb-0.5">{row.label}</p>
              <p>{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center space-y-1 pt-3 border-t border-white/25">
        <p className="text-sm font-bold tracking-wider uppercase">{data.agencyName}</p>
        <p className="text-[10px] text-white/75">{data.agencyAddress} • {data.agencyWebsite}</p>
      </div>
    </div>
  );
}

/* ============================ NOITE ESTRELADA (ULTRA) ============================ */

export function NoiteEstreladaLayout({ data, previewRef }: FlyerLayoutProps) {
  const star = (x: number, y: number, r = 1.6, o = 0.9, delay = 0) => (
    <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff" opacity={o}
      className="fs-anim-star" style={{ animationDelay: `${delay}s` }} />
  );

  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} text-white flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #050816 0%, #0b1230 42%, #1a2452 68%, #2c3a6e 84%, #4a5590 100%)' }} />

      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 520 760">
        {star(48, 62, 1.5)}
        {star(120, 40, 1.2, 0.7, 0.6)}
        {star(210, 88, 1.8, 0.95, 1.2)}
        {star(320, 52, 1.3, 0.75, 0.3)}
        {star(420, 96, 1.7, 0.9, 0.9)}
        {star(480, 150, 1.2, 0.65, 1.5)}
        {star(70, 180, 1.4, 0.8, 0.4)}
        {star(460, 260, 1.1, 0.6, 1.1)}
        <ellipse cx="430" cy="140" rx="90" ry="34" fill="rgba(160,170,255,0.06)" />
        <ellipse cx="90" cy="240" rx="80" ry="28" fill="rgba(160,170,255,0.05)" />
      </svg>

      <div className="absolute bottom-0 left-0 right-0 h-44 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(8,10,26,0.92) 70%)' }} />

      <div className="relative z-10 text-center space-y-1.5">
        <p className="text-[10px] tracking-[0.45em] uppercase font-semibold" style={{ color: 'var(--fs-accent)' }}>
          {data.title}
        </p>
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-16" style={{ background: 'linear-gradient(to right, transparent, var(--fs-accent))' }} />
          <span className="text-[var(--fs-accent)]">✦</span>
          <div className="h-px w-16" style={{ background: 'linear-gradient(to left, transparent, var(--fs-accent))' }} />
        </div>
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="relative w-44 h-52 mx-auto">
          <div className="absolute -inset-2 rounded-xl pointer-events-none"
            style={{ boxShadow: '0 0 32px rgba(252,211,77,0.28)', border: '1px solid rgba(252,211,77,0.35)' }} />
          <div className="w-full h-full overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/20">
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover brightness-105" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-[27px] font-bold uppercase tracking-wide leading-tight"
            style={{
              backgroundImage: 'linear-gradient(180deg, #ffffff 20%, #fcd34d 130%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.5))',
            }}>
            {data.deceasedName}
          </h1>
          <p className="text-[11px] tracking-[0.35em] uppercase text-[var(--fs-accent)]">{data.age} Anos</p>
        </div>

        <div className="mx-auto max-w-xs rounded-lg p-4 space-y-2 text-left text-[12px] bg-[#0a1026]/80 backdrop-blur-sm ring-1 ring-white/10 text-slate-100">
          {[
            { label: 'Funeral', value: data.funeralDateFormatted },
            { label: 'Local', value: data.parishLocation },
            { label: 'Cemitério', value: data.cemeteryLocation },
          ].map((row) => (
            <div key={row.label}>
              <p className="text-[9px] uppercase tracking-[0.25em] font-bold mb-0.5" style={{ color: 'var(--fs-accent)' }}>{row.label}</p>
              <p>{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center space-y-1 pt-3">
        <p className="text-sm font-bold tracking-wider uppercase">{data.agencyName}</p>
        <p className="text-[10px] text-white/65">{data.agencyAddress} • {data.agencyWebsite}</p>
        {data.agencyFounded && <p className="text-[9px] tracking-[0.3em] uppercase" style={{ color: 'var(--fs-accent)' }}>{data.agencyFounded}</p>}
      </div>
    </div>
  );
}

/* ============================ MEMÓRIA VIVA (FREE — split moderno) ============================ */

export function MemoriaVivaLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-white text-[var(--fs-primary)] flex`}
    >
      <div className="w-[46%] h-full relative">
        <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover grayscale-[20%]" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(10,14,26,0.82) 100%)' }} />
        <div className="absolute bottom-5 left-4 right-4">
          <p className="text-[9px] tracking-[0.3em] uppercase font-semibold mb-1" style={{ color: 'var(--fs-accent)' }}>
            {data.title}
          </p>
          <h1 className="text-[19px] font-bold uppercase leading-snug text-white">{data.deceasedName}</h1>
          <p className="text-[10px] tracking-[0.25em] text-white/80 mt-0.5">{data.age} Anos</p>
        </div>
        <div className="absolute top-0 right-0 w-1 h-full" style={{ backgroundColor: 'var(--fs-accent)' }} />
      </div>

      <div className="w-[54%] h-full flex flex-col justify-between p-7">
        <div className="space-y-4">
          {[
            { label: 'Funeral', value: data.funeralDateFormatted },
            { label: 'Local da Cerimónia', value: data.parishLocation },
            { label: 'Cemitério', value: data.cemeteryLocation },
          ].map((row, i) => (
            <div key={row.label} className={i > 0 ? 'pt-4 border-t border-slate-100' : ''}>
              <p className="text-[9px] uppercase tracking-[0.28em] font-bold mb-1" style={{ color: 'var(--fs-accent)' }}>
                {row.label}
              </p>
              <p className="text-[12.5px] text-[var(--fs-primary)]/85 leading-relaxed">{row.value}</p>
            </div>
          ))}

          {data.wakeDetailsFormatted && (
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[9px] uppercase tracking-[0.28em] font-bold mb-1" style={{ color: 'var(--fs-accent)' }}>
                Velório
              </p>
              <p className="text-[12.5px] text-[var(--fs-primary)]/85 leading-relaxed">{data.wakeDetailsFormatted}</p>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-4 border-t-2" style={{ borderColor: 'var(--fs-accent)' }}>
          <p className="text-[13px] font-bold uppercase tracking-wide">{data.agencyName}</p>
          <p className="text-[10px] text-[var(--fs-primary)]/60 leading-relaxed">
            {data.agencyAddress}<br />{data.agencyWebsite}
          </p>
          {data.agencyFounded && (
            <p className="text-[9px] tracking-[0.3em] uppercase font-semibold" style={{ color: 'var(--fs-accent)' }}>
              {data.agencyFounded}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
