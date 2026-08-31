'use client';

import React from 'react';
import { Cross, Church, Flower2, Leaf, HandHeart, Sun, MoonStar } from 'lucide-react';
import { CANVAS_CLASS, FlyerLayoutProps, canvasStyle } from './shared';
import PhotoImage from '../PhotoImage';

/* ==================== MEMORIAL CAMPO (FREE) — Missa de 7º Dia ==================== */

export function MemorialCampoLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-[#f6f4ee] text-[var(--fs-primary)] flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-0 pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle at 80% 70%, rgba(125,155,118,0.28) 0%, transparent 55%), linear-gradient(180deg, #fbfaf6 0%, #f1eee5 100%)' }} />
      <svg className="absolute inset-x-0 bottom-0 w-full h-24 pointer-events-none opacity-30" viewBox="0 0 520 96" preserveAspectRatio="none">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <ellipse key={i} cx={40 + i * 66} cy={86} rx={26} ry={7}
            style={{ fill: 'var(--fs-accent)', opacity: 0.3 + (i % 3) * 0.15 }} />
        ))}
      </svg>

      <div className="relative z-10 text-center space-y-1.5">
        <Cross className="w-7 h-7 mx-auto text-[var(--fs-accent)]" strokeWidth={1.3} />
        <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--fs-accent)] font-semibold">{data.title}</p>
      </div>

      <div className="relative z-10 text-center space-y-3">
        <div className="w-36 h-44 mx-auto rounded-xl overflow-hidden ring-1 ring-[var(--fs-accent)]/30 shadow-lg sepia-[12%]">
          <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-1">
          <p className="text-[10px] tracking-[0.3em] text-[var(--fs-accent)] uppercase">{data.age} Anos</p>
          <h1 className="text-[24px] font-semibold uppercase tracking-wide text-[var(--fs-primary)] leading-tight">{data.deceasedName}</h1>
        </div>
      </div>

      <div className="relative z-10 text-center space-y-1.5">
        <p className="text-[13px] italic text-[var(--fs-primary)]/85">{data.funeralDateFormatted}</p>
        <p className="text-[11px] text-[var(--fs-primary)]/70">{data.parishLocation}</p>
        {data.wakeDetailsFormatted && (
          <p className="text-[10px] text-[var(--fs-primary)]/60">{data.wakeDetailsFormatted}</p>
        )}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="h-px w-14 bg-[var(--fs-accent)]/40" />
          <Leaf className="w-3.5 h-3.5 text-[var(--fs-accent)]" strokeWidth={1.5} />
          <div className="h-px w-14 bg-[var(--fs-accent)]/40" />
        </div>
        <p className="text-[12px] font-medium text-[var(--fs-primary)]">{data.agencyName}</p>
        <p className="text-[9px] tracking-[0.25em] text-[var(--fs-accent)] uppercase">Na memória, a presença.</p>
      </div>
    </div>
  );
}

/* ==================== GRATIDÃO (FREE) — Agradecimento ==================== */

export function GratidaoLuzLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-gradient-to-b from-[#fffdf5] to-[#f7efe0] text-[var(--fs-primary)] flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-3 border border-[var(--fs-accent)]/30 rounded-sm pointer-events-none" />
      <div className="absolute inset-6 border border-[var(--fs-accent)]/15 rounded-sm pointer-events-none" />

      <div className="relative z-10 text-center space-y-1.5">
        <HandHeart className="w-6 h-6 mx-auto text-[var(--fs-accent)]" strokeWidth={1.4} />
        <p className="text-[10px] tracking-[0.45em] uppercase text-[var(--fs-accent)] font-semibold">{data.title}</p>
      </div>

      <div className="relative z-10 text-center space-y-3">
        <div className="w-36 h-40 mx-auto rounded-md overflow-hidden ring-1 ring-[var(--fs-accent)]/30 shadow-lg">
          <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover sepia-[15%]" />
        </div>
        <h1 className="text-[22px] font-semibold uppercase tracking-wide text-[var(--fs-primary)] leading-tight">{data.deceasedName}</h1>
        <p className="max-w-sm mx-auto text-[12px] italic text-[var(--fs-primary)]/75 leading-relaxed">
          A {data.agencyName} agradece a presença e as condolências na despedida de quem ficou na nossa memória.
        </p>
      </div>

      <div className="relative z-10 text-center space-y-1.5">
        <div className="w-20 h-px bg-[var(--fs-accent)]/40 mx-auto" />
        <p className="text-[12px] font-medium text-[var(--fs-primary)]">{data.agencyName}</p>
        <p className="text-[11px] text-[var(--fs-primary)]/75">{data.parishLocation}</p>
        <p className="text-[10px] text-[var(--fs-primary)]/55">{data.agencyAddress} • {data.agencyWebsite}</p>
      </div>
    </div>
  );
}

/* ==================== VELADA ORQUÍDEA (PREMIUM) — Participação ==================== */

export function VeladaOrquideaLayout({ data, previewRef }: FlyerLayoutProps) {
  const orchid = (cx: number, cy: number, rotate: number, scale = 1) => (
    <g transform={`translate(${cx},${cy}) scale(${scale})`} opacity={0.85}>
      <g transform={`rotate(${rotate})`}>
        <ellipse cx={0} cy={-10} rx={7} ry={12} style={{ fill: 'var(--fs-accent)' }} />
        <ellipse cx={12} cy={4} rx={7} ry={12} style={{ fill: 'var(--fs-accent)', opacity: 0.75 }} transform="rotate(72)" />
        <ellipse cx={-12} cy={4} rx={7} ry={12} style={{ fill: 'var(--fs-accent)', opacity: 0.9 }} transform="rotate(-72)" />
        <circle r={6} style={{ fill: '#fff', opacity: 0.6 }} />
        <circle r={2.5} style={{ fill: 'var(--fs-primary)' }} />
      </g>
    </g>
  );

  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-[#faf6f2] text-[var(--fs-primary)] flex flex-col justify-between p-9`}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 520 760" preserveAspectRatio="none">
        <rect x="16" y="16" width="488" height="728" fill="none" stroke="var(--fs-accent)" strokeOpacity="0.3" strokeWidth="1" />
        <rect x="22" y="22" width="476" height="716" fill="none" stroke="var(--fs-accent)" strokeOpacity="0.12" strokeWidth="1" />
        {orchid(36, 40, -20, 0.9)}
        {orchid(484, 44, 15, 0.9)}
        {orchid(40, 714, 15, 0.7)}
      </svg>

      <div className="relative z-10 text-center space-y-1.5">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--fs-accent)] font-semibold">{data.title}</p>
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-12 bg-[var(--fs-accent)]/50" />
          <Flower2 className="w-3.5 h-3.5 text-[var(--fs-accent)]" strokeWidth={1.5} />
          <div className="h-px w-12 bg-[var(--fs-accent)]/50" />
        </div>
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="relative w-48 h-60 mx-auto">
          <div className="absolute -inset-2.5 border border-[var(--fs-accent)]/50 rounded-[130px_130px_20px_20px]" />
          <div className="w-full h-full overflow-hidden rounded-[120px_120px_12px_12px] shadow-xl">
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] tracking-[0.35em] text-[var(--fs-accent)] uppercase italic">em {data.age} anos</p>
          <h1 className="text-[26px] font-semibold uppercase tracking-wide text-[var(--fs-primary)] leading-tight">{data.deceasedName}</h1>
        </div>

        <div className="max-w-xs mx-auto space-y-2.5 text-[12px] text-[var(--fs-primary)]/85">
          <div className="space-y-0.5">
            <p className="font-semibold tracking-[0.25em] text-[10px] uppercase text-[var(--fs-accent)]">Velório</p>
            <p>{data.wakeDetailsFormatted || data.funeralDateFormatted}</p>
          </div>
          <div className="space-y-0.5">
            <p className="font-semibold tracking-[0.25em] text-[10px] uppercase text-[var(--fs-accent)]">Missa / Cerimónia</p>
            <p>{data.funeralDateFormatted}</p>
            <p>{data.parishLocation}</p>
          </div>
          <div>
            <p className="font-semibold tracking-[0.25em] text-[10px] uppercase text-[var(--fs-accent)] mb-0.5">Cemitério</p>
            <p>{data.cemeteryLocation}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center border-t border-[var(--fs-accent)]/30 pt-3 space-y-1">
        <p className="text-[13px] font-semibold text-[var(--fs-primary)]">{data.agencyName}</p>
        <p className="text-[10px] text-[var(--fs-primary)]/60">{data.agencyAddress} • {data.agencyWebsite}</p>
      </div>
    </div>
  );
}

/* ==================== MISSA 7º DIA (PREMIUM) ==================== */

export function MissaSetimoDiaLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-gradient-to-b from-[#1c2638] to-[#0f1626] text-white flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle at 50% 0%, var(--fs-accent) 0%, transparent 55%)' }} />
      <div className="absolute inset-3 border border-[var(--fs-accent)]/30 rounded-sm pointer-events-none" />

      <div className="relative z-10 text-center space-y-2">
        <Church className="w-8 h-8 mx-auto text-[var(--fs-accent)] drop-shadow-[0_0_14px_rgba(212,175,55,0.6)]" strokeWidth={1.2} />
        <p className="text-[11px] tracking-[0.45em] uppercase text-[var(--fs-accent)] font-semibold">{data.title}</p>
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-14 bg-[var(--fs-accent)]/50" />
          <div className="w-1 h-1 rotate-45 bg-[var(--fs-accent)]" />
          <div className="h-px w-14 bg-[var(--fs-accent)]/50" />
        </div>
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="w-40 h-48 mx-auto overflow-hidden rounded-full ring-2 ring-[var(--fs-accent)]/40 shadow-xl">
          <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-1">
          <h1 className="text-[26px] font-semibold uppercase tracking-wide leading-tight"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {data.deceasedName}
          </h1>
          <p className="text-[10px] tracking-[0.3em] text-[var(--fs-accent)] uppercase italic">Recordação do 7º dia</p>
        </div>

        <div className="max-w-xs mx-auto space-y-1.5 text-[12px] bg-black/25 backdrop-blur-sm border border-[var(--fs-accent)]/20 rounded-md p-4">
          <p className="font-semibold tracking-[0.25em] text-[10px] uppercase text-[var(--fs-accent)]">Missa de 7º dia</p>
          <p>{data.funeralDateFormatted}</p>
          <p>{data.parishLocation}</p>
        </div>
      </div>

      <div className="relative z-10 text-center border-t border-[var(--fs-accent)]/25 pt-3 space-y-1">
        <p className="text-[13px] font-semibold text-white uppercase">{data.agencyName}</p>
        <p className="text-[10px] text-white/70">{data.agencyAddress} • {data.agencyWebsite}</p>
      </div>
    </div>
  );
}

/* ==================== CEU ETERNO (ULTRA, animated) — Peregrinação ==================== */

export function CeuEternoLayout({ data, previewRef }: FlyerLayoutProps) {
  const stars = [15, 30, 45, 60, 78, 90, [24, 70], [66, 20], [50, 50], [38, 82], [82, 62]];
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-gradient-to-b from-[#04070f] via-[#0a1224] to-[#04070f] text-white flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 18%, rgba(212,175,55,0.16) 0%, transparent 55%)' }} />
      <div className="absolute inset-4 border border-white/10 rounded-md pointer-events-none" />

      {stars.map((s, i) => {
        const isArr = Array.isArray(s);
        const left = isArr ? (s as number[])[0] : (s as number);
        const top = isArr ? (s as number[])[1] : 12 + (i * 17) % 80;
        return (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[var(--fs-accent)] animate-pulse pointer-events-none"
            style={{ left: `${left}%`, top: `${top}%`, opacity: 0.4 + (i % 4) * 0.15, animationDelay: `${i * 0.5}s` }}
          />
        );
      })}

      <div className="relative z-10 text-center space-y-2">
        <MoonStar className="w-8 h-8 mx-auto text-[var(--fs-accent)] drop-shadow-[0_0_16px_rgba(212,175,55,0.6)]" strokeWidth={1.1} />
        <p className="text-[11px] tracking-[0.45em] uppercase text-[var(--fs-accent)] font-semibold">{data.title}</p>
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="relative mx-auto w-44 h-52">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-b from-[var(--fs-accent)] to-transparent opacity-40 blur-sm" />
          <div className="w-full h-full overflow-hidden rounded-full ring-2 ring-[var(--fs-accent)]/50 shadow-2xl">
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-[28px] font-bold uppercase tracking-wide leading-tight"
            style={{ backgroundImage: 'linear-gradient(180deg, #fde68a, var(--fs-accent))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
            {data.deceasedName}
          </h1>
          <p className="text-[11px] tracking-[0.35em] text-[var(--fs-accent)] uppercase italic">{data.age} Anos</p>
        </div>

        <div className="mx-auto max-w-xs space-y-2 text-[12px] bg-black/30 backdrop-blur-sm border border-white/10 rounded-md p-3.5">
          {[
            { label: 'Cerimónia', value: data.funeralDateFormatted },
            { label: 'Local', value: data.parishLocation },
            { label: 'Cemitério', value: data.cemeteryLocation },
          ].map((row) => (
            <div key={row.label} className="text-left">
              <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--fs-accent)] font-bold mb-0.5">{row.label}</p>
              <p className="text-white/90">{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 text-center space-y-1.5 pt-3 border-t border-white/10">
        <p className="text-sm font-bold tracking-wider text-white uppercase">{data.agencyName}</p>
        <p className="text-[10px] text-white/70">{data.agencyAddress} • {data.agencyLocation}</p>
        <p className="text-[9px] tracking-[0.3em] text-[var(--fs-accent)] uppercase">Que a sua luz brilhe eternamente</p>
      </div>
    </div>
  );
}
