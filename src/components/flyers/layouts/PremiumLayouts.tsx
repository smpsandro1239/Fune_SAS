'use client';

import React from 'react';
import { Flame, Flower2, Sparkles, Sun } from 'lucide-react';
import { CANVAS_CLASS, FlyerLayoutProps, canvasStyle } from './shared';
import PhotoImage from '../PhotoImage';

export function DouradoPremiumLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-[var(--fs-primary)] text-[#f8f5ec] flex flex-col justify-between p-8`}
    >
      <div className="absolute inset-3 border border-[var(--fs-accent)]/70 pointer-events-none"></div>
      <div className="absolute inset-5 border border-[var(--fs-accent)]/30 pointer-events-none"></div>

      <div className="absolute top-6 left-6 text-[var(--fs-accent)] text-lg leading-none">❖</div>
      <div className="absolute top-6 right-6 text-[var(--fs-accent)] text-lg leading-none">❖</div>
      <div className="absolute bottom-6 left-6 text-[var(--fs-accent)] text-lg leading-none">❖</div>
      <div className="absolute bottom-6 right-6 text-[var(--fs-accent)] text-lg leading-none">❖</div>

      <div className="text-center space-y-2 relative z-10">
        <div className="flex items-center justify-center gap-4">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-[var(--fs-accent)]"></div>
          <Sparkles className="w-4 h-4 text-[var(--fs-accent)]" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-[var(--fs-accent)]"></div>
        </div>
        <p className="text-[11px] tracking-[0.45em] uppercase text-[var(--fs-accent)] font-semibold">
          {data.title}
        </p>
      </div>

      <div className="relative z-10 text-center space-y-5">
        <div className="relative w-44 h-52 mx-auto">
          <div className="absolute -inset-2 bg-[radial-gradient(circle,rgba(201,162,39,0.4),transparent_70%)]"></div>
          <div className="relative w-44 h-52 overflow-hidden rounded-b-[80px] rounded-t-xl border-2 border-[var(--fs-accent)] shadow-[0_0_40px_rgba(201,162,39,0.25)]">
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-[27px] font-bold uppercase tracking-wide text-[var(--fs-accent)]">
            {data.deceasedName}
          </h1>
          <p className="text-xs tracking-[0.35em] text-[var(--fs-accent)]">{data.age} ANOS</p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-[var(--fs-accent)]/70"></div>
          <span className="text-[var(--fs-accent)]">✦</span>
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-[var(--fs-accent)]/70"></div>
        </div>

        <div className="max-w-sm mx-auto bg-[#0d1424]/80 border border-[var(--fs-accent)]/25 rounded p-5 space-y-3 text-[12px] leading-relaxed text-[#e6e1d3] text-left">
          <div>
            <p className="font-bold tracking-[0.25em] text-[10px] text-[var(--fs-accent)] mb-1">FUNERAL</p>
            <p>{data.funeralDateFormatted}</p>
            <p className="text-[#b8b3a4]">{data.parishLocation}</p>
          </div>
          <div>
            <p className="font-bold tracking-[0.25em] text-[10px] text-[var(--fs-accent)] mb-1">CEMITÉRIO</p>
            <p>{data.cemeteryLocation}</p>
          </div>
          <div>
            <p className="font-bold tracking-[0.25em] text-[10px] text-[var(--fs-accent)] mb-1">VELÓRIO</p>
            <p className="text-[#b8b3a4]">{data.wakeDetailsFormatted}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-[var(--fs-accent)]/30 pt-4">
        <div>
          <p className="font-semibold text-[var(--fs-accent)]">{data.agencyName}</p>
          <p className="text-[10px] text-[#9a937f]">{data.agencyAddress} • {data.agencyWebsite}</p>
        </div>
        <div className="w-11 h-11 rounded-full border border-[var(--fs-accent)] flex items-center justify-center bg-[#0d1424]">
          <span className="font-serif font-bold text-[var(--fs-accent)]">{data.agencyInitials || 'AF'}</span>
        </div>
      </div>
    </div>
  );
}

export function MarmorePremiumLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      className={`${CANVAS_CLASS} text-[var(--fs-primary)] flex flex-col justify-between p-9`}
      style={{
        ...canvasStyle(data),
        background:
          'linear-gradient(155deg, #f7f4ee 0%, #efe9df 35%, #f9f6f0 62%, #e7dfd2 100%)',
      }}
    >
      <div className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 15%, rgba(185,155,107,0.25), transparent 45%), radial-gradient(ellipse at 85% 70%, rgba(185,155,107,0.18), transparent 50%), linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.35) 48%, transparent 56%), linear-gradient(70deg, transparent 65%, rgba(120,100,70,0.12) 72%, transparent 80%)',
        }}
      ></div>
      <div className="absolute inset-4 border border-[var(--fs-accent)]/50 pointer-events-none"></div>
      <div className="absolute inset-6 border border-[var(--fs-accent)]/25 pointer-events-none"></div>

      <div className="relative z-10 text-center space-y-1.5">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--fs-accent)] font-semibold">{data.title}</p>
        <div className="w-14 h-px bg-[var(--fs-accent)] mx-auto"></div>
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="w-44 h-52 mx-auto rounded-t-full rounded-b-md border-[5px] border-[var(--fs-accent)]/60 p-1 shadow-xl">
          <div className="w-full h-full rounded-t-full rounded-b-[4px] overflow-hidden">
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold uppercase tracking-wide text-[var(--fs-primary)]">{data.deceasedName}</h1>
          <p className="text-[11px] tracking-[0.3em] text-[var(--fs-accent)]">{data.age} Anos</p>
        </div>

        <div className="max-w-sm mx-auto text-[12.5px] leading-relaxed text-[var(--fs-primary)]/85 space-y-2.5">
          <p>
            <span className="uppercase tracking-[0.25em] text-[10px] text-[var(--fs-accent)] font-bold block">Cerimónia</span>
            {data.funeralDateFormatted}
          </p>
          <p className="text-[var(--fs-primary)]/80">{data.parishLocation}</p>
          <p>
            <span className="uppercase tracking-[0.25em] text-[10px] text-[var(--fs-accent)] font-bold block">Cemitério</span>
            {data.cemeteryLocation}
          </p>
          {data.wakeDetailsFormatted && (
            <p>
              <span className="uppercase tracking-[0.25em] text-[10px] text-[var(--fs-accent)] font-bold block">Velório</span>
              {data.wakeDetailsFormatted}
            </p>
          )}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-[var(--fs-accent)]/40 pt-4">
        <div>
          <p className="text-sm font-semibold text-[var(--fs-primary)] italic">{data.agencyName}</p>
          <p className="text-[10px] text-[var(--fs-accent)]/85">{data.agencyWebsite} • {data.agencyAddress}</p>
        </div>
        <div className="w-10 h-10 rounded-full border border-[var(--fs-accent)]/60 flex items-center justify-center bg-[#fdfbf6]">
          <span className="font-serif font-bold text-[var(--fs-accent)] text-sm">{data.agencyInitials || 'AF'}</span>
        </div>
      </div>
    </div>
  );
}

export function LuzRadianteLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} text-[#f1f5f9] flex flex-col justify-between p-9 bg-[var(--fs-primary)]`}
    >
      <div
        className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] opacity-60 fs-anim-rays"
        style={{
          background:
            'conic-gradient(from 0deg, rgba(232,201,106,0.22) 0deg, transparent 24deg, rgba(232,201,106,0.18) 46deg, transparent 70deg, rgba(232,201,106,0.2) 96deg, transparent 120deg, rgba(232,201,106,0.22) 150deg, transparent 174deg, rgba(232,201,106,0.18) 200deg, transparent 225deg, rgba(232,201,106,0.22) 255deg, transparent 280deg, rgba(232,201,106,0.18) 305deg, transparent 330deg)',
          borderRadius: '9999px',
        }}
      ></div>
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-[radial-gradient(circle,rgba(232,201,106,0.35),transparent_65%)] pointer-events-none"></div>

      {[
        { top: '22%', left: '12%', delay: '0s' },
        { top: '30%', left: '85%', delay: '1.2s' },
        { top: '48%', left: '8%', delay: '2.1s' },
        { top: '60%', left: '88%', delay: '0.6s' },
        { top: '72%', left: '16%', delay: '1.8s' },
        { top: '80%', left: '76%', delay: '2.6s' },
      ].map((s, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[var(--fs-accent)] fs-anim-star pointer-events-none"
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        ></span>
      ))}

      <div className="relative z-10 text-center space-y-2">
        <p className="text-[11px] tracking-[0.45em] uppercase text-[var(--fs-accent)] font-semibold">{data.title}</p>
        <Sun className="w-5 h-5 mx-auto text-[var(--fs-accent)]/80" />
      </div>

      <div className="relative z-10 text-center space-y-5">
        <div className="relative w-40 h-40 mx-auto">
          <div className="absolute -inset-3 rounded-full bg-[radial-gradient(circle,rgba(232,201,106,0.45),transparent_70%)]"></div>
          <div className="relative w-40 h-40 rounded-full border-2 border-[var(--fs-accent)]/60 p-1 bg-[#0e1a2f] shadow-2xl">
            <div className="w-full h-full rounded-full overflow-hidden">
              <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-[26px] font-bold uppercase tracking-wider text-white">{data.deceasedName}</h1>
          <p className="text-xs tracking-[0.35em] text-[var(--fs-accent)]">{data.age} ANOS</p>
        </div>

        <div className="max-w-sm mx-auto bg-[#0e1a2f]/70 backdrop-blur-sm border border-[var(--fs-accent)]/25 rounded-xl p-5 space-y-2.5 text-[12px] leading-relaxed text-slate-200 text-left">
          <div className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--fs-accent)] mt-1.5 shrink-0"></span>
            <p>
              <span className="font-semibold text-[var(--fs-accent)]">Cerimónia:</span> {data.funeralDateFormatted}
              <br />
              {data.parishLocation}
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--fs-accent)] mt-1.5 shrink-0"></span>
            <p>
              <span className="font-semibold text-[var(--fs-accent)]">Cemitério:</span> {data.cemeteryLocation}
            </p>
          </div>
          {data.wakeDetailsFormatted && (
            <div className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--fs-accent)] mt-1.5 shrink-0"></span>
              <p>
                <span className="font-semibold text-[var(--fs-accent)]">Velório:</span> {data.wakeDetailsFormatted}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4">
        <p className="text-sm font-medium text-slate-200">
          {data.agencyName}
          <span className="block text-[10px] text-slate-400">{data.agencyAddress} • {data.agencyWebsite}</span>
        </p>
        <span className="text-[var(--fs-accent)]">✦ ✦ ✦</span>
      </div>
    </div>
  );
}

export function JardimPremiumLayout({ data, previewRef }: FlyerLayoutProps) {
  const leaf = (x: number, y: number, flip = false) => (
    <svg
      className="absolute text-[var(--fs-accent)]/50 pointer-events-none"
      width="110"
      height="110"
      viewBox="0 0 100 100"
      style={{ left: x, top: y, transform: flip ? 'scaleX(-1)' : undefined }}
    >
      <path
        d="M50 5 C 20 25, 18 65, 50 95 C 82 65, 80 25, 50 5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path d="M50 15 C 40 40, 40 60, 50 85" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M50 30 C 60 40, 60 55, 50 70" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      <circle cx="50" cy="95" r="4" fill="currentColor" opacity="0.6" />
    </svg>
  );

  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-[#f7f5ee] text-[var(--fs-primary)] flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-4 border border-[var(--fs-accent)]/45 pointer-events-none"></div>
      {leaf(18, 18)}
      {leaf(388, 18, true)}
      {leaf(18, 636)}
      {leaf(388, 636, true)}

      <div className="relative z-10 text-center space-y-1.5">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[var(--fs-accent)] font-semibold">{data.title}</p>
        <div className="flex items-center justify-center gap-2 text-[var(--fs-accent)]">
          <div className="h-px w-14 bg-[var(--fs-accent)]/50"></div>
          <Flower2 className="w-4 h-4" strokeWidth={1.5} />
          <div className="h-px w-14 bg-[var(--fs-accent)]/50"></div>
        </div>
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="w-40 h-52 mx-auto overflow-hidden rounded-t-[90px] rounded-b-md border-2 border-[var(--fs-accent)]/60 shadow-md bg-white">
          <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold uppercase tracking-wide text-[var(--fs-primary)]">{data.deceasedName}</h1>
          <p className="text-[11px] tracking-[0.3em] text-[var(--fs-accent)]">{data.age} Anos</p>
        </div>

        <div className="max-w-sm mx-auto text-[12.5px] leading-relaxed text-[var(--fs-primary)]/85 space-y-2">
          <p>
            <span className="block font-semibold tracking-[0.25em] text-[10px] uppercase text-[var(--fs-accent)]">Cerimónia Funerária</span>
            {data.funeralDateFormatted}
            <br />
            <span className="text-[var(--fs-primary)]/75">{data.parishLocation}</span>
          </p>
          <p>
            <span className="block font-semibold tracking-[0.25em] text-[10px] uppercase text-[var(--fs-accent)]">Cemitério</span>
            {data.cemeteryLocation}
          </p>
          {data.wakeDetailsFormatted && (
            <p>
              <span className="block font-semibold tracking-[0.25em] text-[10px] uppercase text-[var(--fs-accent)]">Velório</span>
              {data.wakeDetailsFormatted}
            </p>
          )}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-[var(--fs-accent)]/40 pt-3.5">
        <div>
          <p className="text-[13px] font-semibold italic text-[var(--fs-primary)]">{data.agencyName}</p>
          <p className="text-[10px] text-[var(--fs-accent)]">{data.agencyAddress} • {data.agencyWebsite}</p>
        </div>
        <div className="w-10 h-10 rounded-full border border-[var(--fs-accent)]/60 flex items-center justify-center bg-white">
          <span className="text-[var(--fs-accent)] font-bold text-sm">{data.agencyInitials || 'AF'}</span>
        </div>
      </div>
    </div>
  );
}

export function VelasPremiumLayout({ data, previewRef }: FlyerLayoutProps) {
  const candle = (left: string, height: number, delay: string) => (
    <div className="absolute" style={{ left, bottom: 0 }}>
      <div className="w-3.5 mx-auto">
        <div
          className="w-3.5 h-6 rounded-full fs-anim-flicker"
          style={{
            background: 'radial-gradient(circle at 50% 30%, #ffe9b0 0%, #f0a04b 55%, rgba(240,160,75,0) 100%)',
            animationDelay: delay,
            filter: 'drop-shadow(0 0 14px rgba(240,160,75,0.55))',
          }}
        ></div>
      </div>
      <div
        className="w-12 rounded-t-sm mx-auto"
        style={{
          height,
          background: 'linear-gradient(180deg, #e9dcc3 0%, #d9c9a8 30%, #b09a76 100%)',
          boxShadow: 'inset -4px 0 8px rgba(90,70,40,0.35)',
        }}
      ></div>
    </div>
  );

  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-[var(--fs-primary)] text-[#f3e6d2] flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(224,164,88,0.22),transparent_60%)] pointer-events-none"></div>

      {candle('12%', 150, '0s')}
      {candle('22%', 105, '1.1s')}
      {candle('78%', 108, '0.5s')}
      {candle('88%', 155, '1.7s')}

      <div className="relative z-10 text-center space-y-2">
        <p className="text-[11px] tracking-[0.45em] uppercase text-[var(--fs-accent)] font-semibold">{data.title}</p>
        <div className="w-14 h-px bg-gradient-to-r from-transparent via-[var(--fs-accent)] to-transparent mx-auto"></div>
      </div>

      <div className="relative z-10 text-center space-y-5">
        <div className="relative w-40 h-40 mx-auto">
          <div className="absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(224,164,88,0.3),transparent_70%)]"></div>
          <div className="relative w-40 h-40 rounded-full border border-[var(--fs-accent)]/60 p-1 bg-[#241a0c] shadow-2xl">
            <div className="w-full h-full rounded-full overflow-hidden">
              <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-[26px] font-bold uppercase tracking-wider text-[var(--fs-accent)]">{data.deceasedName}</h1>
          <p className="text-xs tracking-[0.35em] text-[var(--fs-accent)]">{data.age} ANOS</p>
        </div>

        <div className="max-w-sm mx-auto bg-[#241a0c]/70 border border-[var(--fs-accent)]/20 rounded-xl p-5 space-y-2.5 text-[12px] leading-relaxed text-[var(--fs-accent)]/85 text-left">
          <p>
            <span className="font-semibold tracking-[0.25em] text-[10px] uppercase text-[var(--fs-accent)] block mb-0.5">Cerimónia</span>
            {data.funeralDateFormatted} — {data.parishLocation}
          </p>
          <p>
            <span className="font-semibold tracking-[0.25em] text-[10px] uppercase text-[var(--fs-accent)] block mb-0.5">Cemitério</span>
            {data.cemeteryLocation}
          </p>
          <p>
            <span className="font-semibold tracking-[0.25em] text-[10px] uppercase text-[var(--fs-accent)] block mb-0.5">Velório</span>
            {data.wakeDetailsFormatted}
          </p>
        </div>
      </div>

      <div className="relative z-10 text-center space-y-1.5">
        <Flame className="w-4 h-4 mx-auto text-[var(--fs-accent)]/70" />
        <p className="text-sm font-medium text-[var(--fs-accent)]">{data.agencyName}</p>
        <p className="text-[10px] text-[var(--fs-accent)]/75">{data.agencyAddress} • {data.agencyWebsite}</p>
      </div>
    </div>
  );
}
