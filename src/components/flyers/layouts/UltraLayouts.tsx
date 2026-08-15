'use client';

import React from 'react';
import { Cloud, Sparkles } from 'lucide-react';
import { CANVAS_CLASS, FlyerLayoutProps, canvasStyle } from './shared';
import PhotoImage from '../PhotoImage';

export function Profundidade3DLayout({ data, previewRef }: FlyerLayoutProps) {
  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-[var(--fs-primary)] text-[#efeaff] flex flex-col justify-between p-9`}
    >
      <div
        className="absolute inset-0 fs-anim-parallax pointer-events-none"
        style={{
          background:
            'linear-gradient(160deg, #1a1435 0%, var(--fs-primary) 40%, #150f30 75%, #080617 100%)',
          transform: 'perspective(900px) rotateX(6deg)',
          transformOrigin: 'center',
        }}
      ></div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -left-20 top-10 w-72 h-72 rounded-full border border-[var(--fs-accent)]/20 fs-anim-drift"
          style={{ boxShadow: 'inset 0 0 60px rgba(199,185,255,0.12)' }}
        ></div>
        <div
          className="absolute -right-24 bottom-16 w-80 h-80 rounded-full border border-[var(--fs-accent)]/15 fs-anim-drift"
          style={{ animationDelay: '2.5s', boxShadow: 'inset 0 0 70px rgba(199,185,255,0.1)' }}
        ></div>
        {[
          { t: '18%', l: '14%', d: '0s' },
          { t: '26%', l: '82%', d: '1.4s' },
          { t: '42%', l: '6%', d: '2.2s' },
          { t: '64%', l: '88%', d: '0.8s' },
          { t: '76%', l: '10%', d: '1.9s' },
        ].map((s, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[var(--fs-accent)]/70 fs-anim-star"
            style={{ top: s.t, left: s.l, animationDelay: s.d }}
          ></span>
        ))}
      </div>

      <div className="relative z-10 text-center space-y-2">
        <p className="text-[10px] tracking-[0.5em] uppercase text-[#a89bf0] font-semibold">{data.title}</p>
        <Sparkles className="w-4 h-4 mx-auto text-[var(--fs-accent)]" />
      </div>

      <div className="relative z-10 text-center space-y-5">
        <div className="relative inline-block fs-anim-float">
          <div
            className="absolute -inset-4 rounded-2xl opacity-70"
            style={{ background: 'linear-gradient(135deg, rgba(199,185,255,0.35), transparent 70%)', filter: 'blur(24px)' }}
          ></div>
          <div
            className="relative w-44 h-52 overflow-hidden rounded-xl border border-[var(--fs-accent)]/40 shadow-2xl"
            style={{ transform: 'perspective(700px) rotateY(-7deg) rotateX(3deg)', boxShadow: '-14px 22px 50px rgba(0,0,0,0.55)' }}
          >
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h1
            className="text-[27px] font-bold uppercase tracking-wide leading-tight"
            style={{ background: 'linear-gradient(120deg, #ffffff 30%, var(--fs-accent) 60%, #8f7cf0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            {data.deceasedName}
          </h1>
          <p className="text-xs tracking-[0.4em] text-[#a89bf0]">{data.age} Anos</p>
        </div>

        <div
          className="max-w-sm mx-auto rounded-xl p-5 space-y-2.5 text-[12px] leading-relaxed text-[#d9d2ff] text-left"
          style={{ background: 'rgba(26,20,53,0.75)', border: '1px solid rgba(199,185,255,0.22)', backdropFilter: 'blur(6px)' }}
        >
          <p>
            <span className="font-semibold tracking-[0.25em] text-[10px] uppercase text-[var(--fs-accent)] block mb-0.5">Cerimónia</span>
            {data.funeralDateFormatted}
            <br />
            <span className="text-[#b9afe8]">{data.parishLocation}</span>
          </p>
          <p>
            <span className="font-semibold tracking-[0.25em] text-[10px] uppercase text-[var(--fs-accent)] block mb-0.5">Cemitério</span>
            {data.cemeteryLocation}
          </p>
          {data.wakeDetailsFormatted && (
            <p>
              <span className="font-semibold tracking-[0.25em] text-[10px] uppercase text-[var(--fs-accent)] block mb-0.5">Velório</span>
              {data.wakeDetailsFormatted}
            </p>
          )}
        </div>
      </div>

      <div
        className="relative z-10 flex items-center justify-between rounded-lg px-4 py-2.5"
        style={{ background: 'rgba(26,20,53,0.6)', border: '1px solid rgba(199,185,255,0.18)' }}
      >
        <p className="text-[12px] font-medium text-[#e6e0ff]">
          {data.agencyName}
          <span className="block text-[9.5px] text-[#9c8fe8]">{data.agencyAddress} • {data.agencyWebsite}</span>
        </p>
        <span className="text-[var(--fs-accent)] text-sm">{data.agencyInitials || 'AF'}</span>
      </div>
    </div>
  );
}

export function AquarelaUltraLayout({ data, previewRef }: FlyerLayoutProps) {
  const blob = (pos: React.CSSProperties, color: string, delay: string) => (
    <div
      className="absolute fs-anim-aurora pointer-events-none"
      style={{
        ...pos,
        width: 260,
        height: 260,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        animationDelay: delay,
      }}
    ></div>
  );

  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-[#f8fafc] text-[var(--fs-primary)] flex flex-col justify-between p-9`}
    >
      {blob({ top: -80, left: -70 }, 'rgba(122,162,196,0.5)', '0s')}
      {blob({ bottom: -90, right: -60 }, 'rgba(164,196,172,0.45)', '3s')}
      {blob({ top: '30%', left: '68%' }, 'rgba(212,190,163,0.4)', '6s')}
      {blob({ bottom: '22%', left: '-90px' }, 'rgba(150,162,212,0.4)', '9s')}

      <div className="absolute inset-5 pointer-events-none" style={{ border: '1.5px solid rgba(120,140,160,0.4)', borderRadius: '255px 18px 225px 25px / 25px 225px 25px 255px' }}></div>

      <div className="relative z-10 text-center space-y-1.5">
        <p className="text-[10px] tracking-[0.4em] uppercase text-[#64748b] font-semibold">{data.title}</p>
        <div className="w-16 h-1 mx-auto rounded-full" style={{ background: 'linear-gradient(90deg, var(--fs-accent), #a4c4ac, #d4bea3)' }}></div>
      </div>

      <div className="relative z-10 text-center space-y-4">
        <div className="w-44 h-52 mx-auto overflow-hidden border border-white shadow-lg"
          style={{ borderRadius: '185px 185px 18px 18px / 195px 195px 24px 24px' }}
        >
          <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover" />
        </div>

        <div className="space-y-1">
          <h1 className="text-[26px] font-bold uppercase tracking-wide text-[#1e293b]">{data.deceasedName}</h1>
          <p className="text-[11px] tracking-[0.35em] uppercase text-[var(--fs-accent)] font-semibold">{data.age} Anos</p>
        </div>

        <div className="max-w-sm mx-auto rounded-2xl p-5 space-y-2.5 text-[12.5px] leading-relaxed text-[#475569] text-left"
          style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(4px)', border: '1px solid rgba(122,162,196,0.3)' }}
        >
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

      <div className="relative z-10 flex items-center justify-between border-t pt-3.5" style={{ borderColor: 'rgba(122,162,196,0.35)' }}>
        <div>
          <p className="text-[13px] font-semibold italic text-[#1e293b]">{data.agencyName}</p>
          <p className="text-[10px] text-[#94a3b8]">{data.agencyAddress} • {data.agencyWebsite}</p>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, var(--fs-accent), #a4c4ac)' }}
        >
          {data.agencyInitials || 'AF'}
        </div>
      </div>
    </div>
  );
}

const DEMO_BG_VIDEOS = [
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
];

export function VideoUltraLayout({ data, previewRef }: FlyerLayoutProps) {
  const [videoUrl] = React.useState<string>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('fs-video-bg') : null;
    return saved && saved.startsWith('data:') ? saved : DEMO_BG_VIDEOS[0];
  });

  return (
    <div
      ref={previewRef}
      style={canvasStyle(data)}
      className={`${CANVAS_CLASS} bg-[var(--fs-primary)] text-white flex flex-col justify-between p-9`}
    >
      <div className="absolute inset-0 pointer-events-none">
        <video
          className="w-full h-full object-cover opacity-50"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          crossOrigin="anonymous"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--fs-primary)]/80 via-[var(--fs-primary)]/45 to-[var(--fs-primary)]/90"></div>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { t: '12%', l: '18%', d: '0s', s: 2 },
          { t: '20%', l: '72%', d: '1.1s', s: 1.5 },
          { t: '38%', l: '8%', d: '2.3s', s: 2.5 },
          { t: '55%', l: '88%', d: '0.7s', s: 1.8 },
          { t: '70%', l: '14%', d: '1.8s', s: 2 },
          { t: '82%', l: '70%', d: '2.8s', s: 1.4 },
        ].map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[var(--fs-accent)] fs-anim-star"
            style={{ top: s.t, left: s.l, width: s.s, height: s.s, animationDelay: s.d }}
          ></span>
        ))}
      </div>

      <div className="relative z-10 text-center space-y-2">
        <Cloud className="w-5 h-5 mx-auto text-[var(--fs-accent)]/80" />
        <p className="text-[11px] tracking-[0.5em] uppercase text-[var(--fs-accent)] font-semibold">{data.title}</p>
      </div>

      <div className="relative z-10 text-center space-y-5">
        <div className="w-40 h-40 mx-auto rounded-full border border-[var(--fs-accent)]/50 p-1 shadow-[0_0_50px_rgba(252,211,77,0.25)]">
          <div className="w-full h-full rounded-full overflow-hidden">
            <PhotoImage data={data} alt={data.deceasedName} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-[27px] font-bold uppercase tracking-widest text-white drop-shadow-lg">{data.deceasedName}</h1>
          <p className="text-xs tracking-[0.4em] text-[var(--fs-accent)]">{data.age} ANOS</p>
        </div>

        <div className="max-w-sm mx-auto rounded-xl p-5 space-y-2.5 text-[12px] leading-relaxed text-slate-100 text-left"
          style={{ background: 'rgba(2,6,23,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(252,211,77,0.25)' }}
        >
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

      <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-3.5">
        <p className="text-[12px] font-medium text-slate-100">
          {data.agencyName}
          <span className="block text-[9.5px] text-slate-400">{data.agencyAddress} • {data.agencyWebsite}</span>
        </p>
        <span className="w-9 h-9 rounded-full border border-[var(--fs-accent)]/50 flex items-center justify-center text-[var(--fs-accent)] font-bold text-xs">
          {data.agencyInitials || 'AF'}
        </span>
      </div>
    </div>
  );
}
