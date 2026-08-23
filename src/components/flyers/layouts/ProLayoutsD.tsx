'use client';

import React from 'react';
import { CANVAS_CLASS, FlyerLayoutProps, canvasStyle } from './shared';
import PhotoImage from '../PhotoImage';

/* ============================ AURORA BOREAL (ULTRA) ============================ */

export function AuroraBorealLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} text-white flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #04101e 0%, #062033 45%, #0a2c40 75%, #0f3d50 100%)' }} />

      <div className="absolute -top-10 left-0 right-0 h-72 pointer-events-none fs-anim-aurora"
        style={{
          background: 'radial-gradient(ellipse 60% 55% at 30% 20%, rgba(94,234,212,0.35), transparent 60%), radial-gradient(ellipse 50% 50% at 70% 15%, rgba(129,140,248,0.32), transparent 62%), radial-gradient(ellipse 40% 40% at 50% 5%, rgba(52,211,153,0.25), transparent 65%)',
          filter: 'blur(18px)',
        }} />
      <div className="absolute top-24 left-1/4 w-40 h-64 pointer-events-none fs-anim-drift opacity-40"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(167,139,250,0.28), transparent 65%)',
          filter: 'blur(14px)',
        }} />

      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 520 760">
        <circle cx="80" cy="120" r="1.3" fill="#fff" opacity="0.8" />
        <circle cx="150" cy="70" r="1" fill="#fff" opacity="0.6" />
        <circle cx="240" cy="110" r="1.5" fill="#fff" opacity="0.9" className="fs-anim-star" />
        <circle cx="360" cy="80" r="1.1" fill="#fff" opacity="0.7" />
        <circle cx="450" cy="140" r="1.4" fill="#fff" opacity="0.85" className="fs-anim-star" style={{ animationDelay: '1.2s' }} />
        <circle cx="500" cy="60" r="1" fill="#fff" opacity="0.6" />
        <circle cx="30" cy="220" r="1.2" fill="#fff" opacity="0.7" />
      </svg>

      <div className="relative z-10 text-center space-y-1">
        <p className="text-[10px] tracking-[0.5em] uppercase font-semibold text-emerald-100/90">
          {data.title}
        </p>
        <div className="mx-auto w-20 h-px bg-gradient-to-r from-transparent via-emerald-200/70 to-transparent" />
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="relative w-44 h-54 mx-auto">
          <div className="absolute -inset-2 rounded-xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(94,234,212,0.6), transparent 40%, transparent 60%, rgba(129,140,248,0.6))',
              filter: 'blur(6px)',
            }} />
          <div className="w-full h-[216px] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/25">
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover brightness-105" />
          </div>
        </div>

        <h1 className="text-[26px] font-bold uppercase tracking-wide leading-tight"
          style={{
            backgroundImage: 'linear-gradient(90deg, #a7f3d0 0%, #ffffff 50%, #c7d2fe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
          {data.deceasedName}
        </h1>
        <p className="-mt-2 text-[11px] tracking-[0.4em] uppercase text-emerald-100/70">{data.age} Anos</p>

        <div className="max-w-xs mx-auto rounded-xl px-5 py-4 space-y-2.5 text-left text-[12px] ring-1 ring-white/12 backdrop-blur-sm"
          style={{ background: 'rgba(4,16,30,0.55)' }}>
          {[
            { label: 'Funeral', value: data.funeralDateFormatted },
            { label: 'Local', value: data.parishLocation },
            { label: 'Cemitério', value: data.cemeteryLocation },
          ].map((row) => (
            <div key={row.label}>
              <p className="text-[9px] uppercase tracking-[0.25em] font-bold mb-0.5 text-emerald-200/85">{row.label}</p>
              <p className="text-slate-100/95">{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center space-y-0.5 pt-3 border-t border-white/12">
        <p className="text-sm font-semibold tracking-wide">{data.agencyName}</p>
        <p className="text-[10px] text-white/60">{data.agencyAddress} • {data.agencyWebsite}</p>
      </div>
    </div>
  );
}

/* ============================ PERGAMINHO CLÁSSICO (PREMIUM) ============================ */

export function PergaminhoClassicoLayout({ data, previewRef }: FlyerLayoutProps) {
  const flourish = (x: number, y: number, flipX = false, flipY = false) => (
    <g transform={`translate(${x},${y}) scale(${flipX ? -1 : 1},${flipY ? -1 : 1})`} opacity="0.7">
      <path d="M0,34 C2,22 10,12 22,8 C14,14 10,22 9,34 Z" fill="var(--fs-accent)" />
      <path d="M0,34 C1,24 5,15 13,10 C8,17 5,25 4,34 Z" fill="var(--fs-accent)" opacity="0.6" />
      <circle cx="3" cy="37" r="1.6" fill="var(--fs-accent)" />
    </g>
  );

  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} text-[#3b2a1a] flex flex-col justify-between p-9`}
      >
      <div className="absolute inset-0"
        style={{
          background: '#f2e8d5',
        }} />
      <div className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 50% 0%, rgba(255,250,235,0.9), transparent 60%), radial-gradient(ellipse 80% 50% at 50% 105%, rgba(160,120,70,0.14), transparent 60%), radial-gradient(circle at 12% 88%, rgba(160,120,70,0.10), transparent 30%), radial-gradient(circle at 88% 12%, rgba(160,120,70,0.08), transparent 28%)',
        }} />

      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 520 760">
        <rect x="16" y="16" width="488" height="728" fill="none" stroke="var(--fs-accent)" strokeWidth="2.2" strokeOpacity="0.75" />
        <rect x="24" y="24" width="472" height="712" fill="none" stroke="var(--fs-accent)" strokeWidth="0.8" strokeOpacity="0.55" />
        {flourish(26, 26)}
        {flourish(494, 26, true)}
        {flourish(26, 734, false, true)}
        {flourish(494, 734, true, true)}
      </svg>

      <div className="relative z-10 text-center space-y-1">
        <p className="text-[11px] tracking-[0.42em] uppercase font-bold" style={{ color: 'var(--fs-accent)' }}>
          ✦ {data.title} ✦
        </p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="block h-px w-16 bg-[#8a6d46]/60" />
          <span className="w-1.5 h-1.5 rotate-45 border border-[#8a6d46]/70" />
          <span className="block h-px w-16 bg-[#8a6d46]/60" />
        </div>
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="relative w-44 h-56 mx-auto">
          <div className="absolute -inset-2.5 border-2 border-[#8a6d46]/70 rounded-[50%_50%_46%_46%/58%_58%_42%_42%]" />
          <div className="w-full h-full overflow-hidden shadow-lg ring-1 ring-[#8a6d46]/40"
            style={{ borderRadius: '50% 50% 46% 46% / 58% 58% 42% 42%' }}>
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover sepia-[30%]" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-[27px] font-bold uppercase leading-tight tracking-wide" style={{ fontFamily: 'Georgia, serif', color: '#332414' }}>
            {data.deceasedName}
          </h1>
          <p className="text-[11px] italic" style={{ color: '#7c6238' }}>
            faleceu com {data.age} anos de idade
          </p>
        </div>

        <div className="max-w-xs mx-auto text-[12px] leading-relaxed space-y-2" style={{ color: '#4a3620' }}>
          <p>
            <span className="font-bold uppercase text-[10px] tracking-[0.2em]" style={{ color: '#8a6d46' }}>O funeral</span>{' '}
            terá lugar em <em>{data.parishLocation}</em>, {data.funeralDateFormatted}.
          </p>
          <p>
            O corpo seguirá para o <span className="font-semibold">Cemitério de {data.cemeteryLocation}</span>.
          </p>
          {data.wakeDetailsFormatted && (
            <p className="italic" style={{ color: '#5d4728' }}>
              Velório: {data.wakeDetailsFormatted}.
            </p>
          )}
        </div>
      </div>

      <div className="relative z-10 text-center space-y-0.5 pt-3" style={{ borderTop: '1px solid rgba(138,109,70,0.45)' }}>
        <p className="text-[13px] font-bold uppercase tracking-widest" style={{ color: '#332414' }}>
          — {data.agencyName} —
        </p>
        <p className="text-[10px] italic" style={{ color: '#7c6238' }}>
          {data.agencyAddress} • {data.agencyWebsite}
        </p>
        {data.agencyFounded && (
          <p className="text-[9px] tracking-[0.35em] uppercase font-semibold" style={{ color: '#8a6d46' }}>
            {data.agencyFounded}
          </p>
        )}
      </div>
    </div>
  );
}

/* ============================ ONDAS DE SERENIDADE (ULTRA) ============================ */

export function OndasSerenidadeLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} text-[var(--fs-primary)] flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f3faf9 55%, #e6f4f2 100%)' }} />

      <svg className="absolute bottom-0 left-0 w-full h-56 pointer-events-none" viewBox="0 0 520 220" preserveAspectRatio="none">
        <path d="M0,90 C130,40 260,140 520,70 L520,220 L0,220 Z"
          fill="var(--fs-accent)" opacity="0.22" className="fs-anim-drift" />
        <path d="M0,120 C180,70 320,160 520,100 L520,220 L0,220 Z"
          fill="var(--fs-accent)" opacity="0.38" className="fs-anim-float" />
        <path d="M0,155 C150,115 330,185 520,135 L520,220 L0,220 Z"
          fill="var(--fs-accent)" opacity="0.6" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 h-44 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.35) 100%)' }} />

      <div className="absolute top-8 right-10 w-14 h-14 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle at 35% 35%, rgba(255,251,230,0.95), rgba(250,240,205,0.55) 60%, transparent 72%)' }} />

      <div className="relative z-10 text-center space-y-1">
        <p className="text-[10px] tracking-[0.45em] uppercase font-semibold text-teal-800/80">
          {data.title}
        </p>
        <div className="flex items-center justify-center gap-1.5">
          <span className="h-px w-12 bg-teal-700/40" />
          <svg width="14" height="8" viewBox="0 0 14 8"><path d="M0,6 Q3.5,0 7,4 T14,4" fill="none" stroke="currentColor" className="text-teal-700/60" strokeWidth="1.2" /></svg>
          <span className="h-px w-12 bg-teal-700/40" />
        </div>
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="relative w-44 h-52 mx-auto">
          <div className="absolute -inset-2 rounded-b-[80px] rounded-t-xl border border-teal-700/25 pointer-events-none" />
          <div className="w-full h-full overflow-hidden rounded-b-[72px] rounded-t-xl shadow-xl ring-1 ring-teal-700/15">
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover saturate-[92%]" />
          </div>
        </div>

        <div className="space-y-0.5">
          <h1 className="text-[25px] font-semibold uppercase tracking-wide leading-tight text-slate-800">
            {data.deceasedName}
          </h1>
          <p className="text-[11px] tracking-[0.32em] uppercase text-teal-800/70">{data.age} Anos</p>
        </div>

        <div className="max-w-xs mx-auto space-y-2 text-[11.5px]">
          {[
            { label: 'Funeral', value: data.funeralDateFormatted },
            { label: 'Local', value: data.parishLocation },
            { label: 'Cemitério', value: data.cemeteryLocation },
          ].map((row) => (
            <div key={row.label} className="rounded-md bg-white/75 backdrop-blur-[2px] px-3 py-1.5 text-left shadow-sm ring-1 ring-teal-900/8">
              <span className="text-[9px] uppercase tracking-[0.22em] font-bold text-teal-800/80 mr-2">{row.label}:</span>
              <span className="text-slate-700/90">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center space-y-0.5 pb-1">
        <p className="text-[13px] font-semibold text-slate-800">{data.agencyName}</p>
        <p className="text-[10px] text-slate-600/80">{data.agencyAddress} • {data.agencyWebsite}</p>
      </div>
    </div>
  );
}

/* ============================ LUZ ETERNA (PREMIUM) ============================ */

export function LuzEternaLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} text-white flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 120% 90% at 50% 108%, var(--fs-accent) 0%, #2a1a08 34%, #120b04 68%, #060402 100%)' }} />
      <div className="absolute inset-x-0 bottom-0 h-72 pointer-events-none"
        style={{ background: 'conic-gradient(from 270deg at 50% 115%, transparent 40%, rgba(255,215,140,0.16) 47%, transparent 53%, rgba(255,215,140,0.16) 57%, transparent 63%)', filter: 'blur(2px)', animation: 'none' }}
      />

      <div className="relative z-10 text-center space-y-1.5">
        <p className="text-[10px] tracking-[0.5em] uppercase font-semibold" style={{ color: '#f0d9a6' }}>
          {data.title}
        </p>
        <div className="mx-auto w-16 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(240,217,166,0.8), transparent)' }} />
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="relative w-44 h-52 mx-auto">
          <div className="absolute -inset-3 rounded-lg pointer-events-none"
            style={{ boxShadow: '0 0 46px rgba(255,208,120,0.35), inset 0 0 18px rgba(255,208,120,0.18)' }} />
          <div className="w-full h-full overflow-hidden rounded-lg shadow-2xl"
            style={{ outline: '1px solid rgba(240,217,166,0.5)', outlineOffset: '3px' }}>
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover brightness-105 contrast-105" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-[27px] font-serif font-semibold uppercase tracking-wide leading-tight text-[#fdf3dc]"
            style={{ textShadow: '0 0 22px rgba(255,210,130,0.45)' }}>
            {data.deceasedName}
          </h1>
          <p className="text-[11px] tracking-[0.4em] uppercase" style={{ color: 'rgba(240,217,166,0.85)' }}>
            {data.age} Anos
          </p>
        </div>

        <div className="max-w-xs mx-auto space-y-1.5 text-left text-[12px] text-amber-50/90">
          {[
            { label: 'Funeral', value: data.funeralDateFormatted },
            { label: 'Local', value: data.parishLocation },
            { label: 'Cemitério', value: data.cemeteryLocation },
          ].map((row) => (
            <div key={row.label} className="flex gap-2.5 items-baseline border-b border-amber-100/12 pb-1.5">
              <span className="text-[9px] uppercase tracking-[0.25em] font-bold shrink-0 w-[76px]" style={{ color: '#e3c98f' }}>
                {row.label}
              </span>
              <span className="leading-snug">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center space-y-0.5 pt-3">
        <p className="text-sm font-semibold tracking-wider uppercase text-amber-50">{data.agencyName}</p>
        <p className="text-[10px] text-amber-50/55">{data.agencyAddress} • {data.agencyWebsite}</p>
      </div>
    </div>
  );
}
