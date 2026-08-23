'use client';

import React from 'react';
import { Cross, Flower2, Bird } from 'lucide-react';
import { CANVAS_CLASS, FlyerLayoutProps, canvasStyle } from './shared';
import PhotoImage from '../PhotoImage';

/* ============================ CRUZ DOURADA (FREE) ============================ */

export function CruzDouradaLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-gradient-to-b from-[var(--fs-primary)] via-[#1a2233] to-[var(--fs-primary)] text-white flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, var(--fs-accent) 0%, transparent 60%)' }} />
      <div className="absolute inset-3 border border-[var(--fs-accent)]/40 rounded-sm pointer-events-none" />

      <div className="relative z-10 text-center space-y-2">
        <Cross className="w-10 h-10 mx-auto text-[var(--fs-accent)] drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]" strokeWidth={1.2} />
        <p className="text-[11px] tracking-[0.45em] uppercase text-[var(--fs-accent)] font-semibold">{data.title}</p>
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-14 bg-[var(--fs-accent)]/70" />
          <div className="w-1 h-1 rotate-45 bg-[var(--fs-accent)]" />
          <div className="h-px w-14 bg-[var(--fs-accent)]/70" />
        </div>
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="relative w-44 h-56 mx-auto">
          <div className="absolute -inset-2 border border-[var(--fs-accent)]/50 rounded-t-[110px] rounded-b-sm" />
          <div className="w-full h-full overflow-hidden rounded-t-[100px] rounded-b-sm shadow-xl ring-1 ring-[var(--fs-accent)]/30">
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-[27px] font-bold uppercase tracking-wide leading-tight text-white"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
            {data.deceasedName}
          </h1>
          <p className="text-[11px] tracking-[0.35em] text-[var(--fs-accent)] uppercase font-medium">{data.age} Anos</p>
        </div>

        <div className="mx-auto max-w-xs space-y-2.5 bg-black/25 backdrop-blur-sm border border-[var(--fs-accent)]/25 rounded-md p-4 text-left text-[12px] text-white/90">
          {[
            { label: 'Funeral', value: data.funeralDateFormatted },
            { label: 'Local', value: data.parishLocation },
            { label: 'Cemitério', value: data.cemeteryLocation },
          ].map((row) => (
            <div key={row.label}>
              <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--fs-accent)] font-bold mb-0.5">{row.label}</p>
              <p>{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center space-y-1.5 pt-3 border-t border-[var(--fs-accent)]/30">
        <p className="text-sm font-bold tracking-wider text-white uppercase">{data.agencyName}</p>
        <p className="text-[10px] text-white/70">{data.agencyAddress} • {data.agencyLocation}</p>
        {data.agencyFounded && <p className="text-[9px] tracking-[0.3em] text-[var(--fs-accent)] uppercase">{data.agencyFounded}</p>}
      </div>
    </div>
  );
}

/* ============================ ROSA ETERNA (PREMIUM) ============================ */

export function RosaEternaLayout({ data, previewRef }: FlyerLayoutProps) {
  const rose = (cx: number, cy: number, s = 1, o = 0.6) => (
    <g transform={`translate(${cx},${cy}) scale(${s})`} opacity={o}>
      {[0, 60, 120].map((a) => (
        <ellipse key={`o${a}`} cx={0} cy={-7} rx={5} ry={9}
          style={{ fill: 'var(--fs-accent)' }} transform={`rotate(${a})`} />
      ))}
      <circle r={4.5} style={{ fill: 'var(--fs-accent)', opacity: 0.85 }} />
    </g>
  );

  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-[#fdf6f4] text-[var(--fs-primary)] flex flex-col justify-between p-9`}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 520 760" preserveAspectRatio="none">
        <rect x="14" y="14" width="492" height="732" fill="none" stroke="var(--fs-accent)" strokeOpacity="0.35" strokeWidth="1" />
        <rect x="20" y="20" width="480" height="720" fill="none" stroke="var(--fs-accent)" strokeOpacity="0.18" strokeWidth="1" />
        {rose(46, 46, 0.9)}
        {rose(474, 46, 0.9)}
        {rose(46, 714, 0.75, 0.45)}
        {rose(474, 714, 0.75, 0.45)}
      </svg>

      <div className="relative z-10 text-center space-y-1.5">
        <Flower2 className="w-5 h-5 mx-auto text-[var(--fs-accent)]" strokeWidth={1.5} />
        <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--fs-accent)] font-semibold">{data.title}</p>
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="relative w-48 h-60 mx-auto">
          <div className="absolute -inset-2.5 border-2 border-[var(--fs-accent)]/60 rounded-t-[120px] rounded-b-lg" />
          <div className="w-full h-full overflow-hidden rounded-t-[110px] rounded-b shadow-lg">
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover sepia-[8%]" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-[26px] font-semibold uppercase tracking-wide text-[var(--fs-primary)]">{data.deceasedName}</h1>
          <p className="text-[11px] tracking-[0.35em] text-[var(--fs-accent)] uppercase italic">com {data.age} anos</p>
        </div>

        <div className="max-w-xs mx-auto space-y-3 text-[12.5px] text-[var(--fs-primary)]/85">
          <div className="space-y-1">
            <p className="font-semibold tracking-[0.25em] text-[10px] uppercase text-[var(--fs-accent)]">Cerimónia</p>
            <p className="italic">{data.funeralDateFormatted}</p>
            <p>{data.parishLocation}</p>
          </div>
          <div>
            <p className="font-semibold tracking-[0.25em] text-[10px] uppercase text-[var(--fs-accent)] mb-0.5">Cemitério</p>
            <p>{data.cemeteryLocation}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center space-y-1">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="h-px w-16 bg-[var(--fs-accent)]/50" />
          <Flower2 className="w-3 h-3 text-[var(--fs-accent)]" strokeWidth={1.5} />
          <div className="h-px w-16 bg-[var(--fs-accent)]/50" />
        </div>
        <p className="text-[13px] font-semibold text-[var(--fs-primary)]">{data.agencyName}</p>
        <p className="text-[10px] text-[var(--fs-primary)]/60">{data.agencyAddress} • {data.agencyWebsite}</p>
      </div>
    </div>
  );
}

/* ============================ POMBA DA PAZ (PREMIUM) ============================ */

export function PombaPazLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-[#f7fafc] text-[var(--fs-primary)] flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 22%, rgba(255,255,255,0.95) 0%, transparent 55%), linear-gradient(180deg, #eef3f8 0%, #ffffff 45%)' }} />

      <svg className="absolute top-6 left-0 w-full h-24 pointer-events-none opacity-90" viewBox="0 0 520 96">
        <path d="M260 78 C 236 40, 196 34, 168 44 C 190 20, 232 16, 258 38 L 262 30 L 270 44 C 300 24, 340 28, 356 48 C 330 42, 292 50, 264 80 Z"
          style={{ fill: 'var(--fs-accent)', opacity: 0.75 }} />
        <circle cx="262" cy="52" r="3" style={{ fill: 'var(--fs-accent)' }} />
      </svg>

      <div className="relative z-10 text-center space-y-1.5 mt-14">
        <Bird className="w-5 h-5 mx-auto text-[var(--fs-accent)]" strokeWidth={1.5} />
        <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--fs-accent)] font-semibold">{data.title}</p>
        <div className="w-20 h-px bg-gradient-to-r from-transparent via-[var(--fs-accent)] to-transparent mx-auto" />
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="relative w-44 h-52 mx-auto">
          <div className="absolute -inset-2 bg-white rounded-full shadow-xl ring-1 ring-[var(--fs-accent)]/25" />
          <div className="absolute -inset-1 rounded-full overflow-hidden ring-2 ring-[var(--fs-accent)]/40">
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-[25px] font-semibold uppercase tracking-wide text-[var(--fs-primary)] leading-tight">{data.deceasedName}</h1>
          <p className="text-[11px] tracking-[0.3em] text-[var(--fs-accent)] uppercase">{data.age} Anos</p>
        </div>

        <div className="max-w-xs mx-auto grid grid-cols-1 gap-2 text-[11.5px]">
          {[
            { label: 'Funeral', value: data.funeralDateFormatted },
            { label: 'Local', value: data.parishLocation },
            { label: 'Cemitério', value: data.cemeteryLocation },
          ].map((row) => (
            <div key={row.label} className="bg-white/85 backdrop-blur-sm rounded-md px-3 py-1.5 shadow-sm ring-1 ring-slate-200/70 text-left">
              <span className="text-[9px] uppercase tracking-widest text-[var(--fs-accent)] font-bold mr-2">{row.label}:</span>
              <span className="text-[var(--fs-primary)]/85">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center space-y-1 pt-3 border-t border-[var(--fs-accent)]/25">
        <p className="text-[13px] font-semibold text-[var(--fs-primary)]">{data.agencyName}</p>
        <p className="text-[10px] text-[var(--fs-primary)]/60">{data.agencyAddress} • {data.agencyWebsite}</p>
        <p className="text-[9px] tracking-[0.25em] text-[var(--fs-accent)] uppercase italic">A nossa gratidão e pesar</p>
      </div>
    </div>
  );
}
