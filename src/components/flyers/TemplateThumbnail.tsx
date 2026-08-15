'use client';

import React from 'react';
import { FlyerTemplateConfig } from '@/lib/types';
import { PLAN_LABELS } from '@/lib/templates-preset';

const PLAN_BADGE_STYLES: Record<string, string> = {
  FREE: 'bg-slate-200 text-slate-700',
  PREMIUM: 'bg-gold-500 text-navy-950',
  ULTRA: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white',
};

function ThumbShell({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} style={style}>
      {children}
    </div>
  );
}

export default function TemplateThumbnail({ template }: { template: FlyerTemplateConfig }) {
  const photo = (
    <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-slate-500/70">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );

  const nameBar = (
    <div className="space-y-1">
      <div className="h-1.5 w-3/4 rounded bg-current opacity-90"></div>
      <div className="h-1 w-1/2 rounded bg-current opacity-60"></div>
    </div>
  );

  switch (template.layoutStyle) {
    case 'elegante-minimal':
      return (
        <ThumbShell className="bg-white text-slate-900">
          <div className="absolute inset-1 border border-slate-300"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-between p-3 text-center">
            <div className="h-1 w-10 bg-slate-400"></div>
            <div className="w-12 h-14 bg-slate-300 border border-slate-400"></div>
            {nameBar}
            <div className="h-px w-8 bg-slate-300"></div>
          </div>
        </ThumbShell>
      );
    case 'classico-sobrio':
      return (
        <ThumbShell className="bg-stone-50 text-stone-900">
          <div className="absolute inset-1 border border-stone-800"></div>
          <div className="absolute inset-1.5 border border-stone-400"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-between p-3 text-center">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-stone-600" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M5 7l7-5 7 5M5 17l7 5 7-5" /></svg>
            <div className="w-12 h-12 rounded-full border border-stone-700 bg-stone-200"></div>
            {nameBar}
          </div>
        </ThumbShell>
      );
    case 'floral-suave':
      return (
        <ThumbShell className="bg-[#fdfbf7] text-[#8a7360]">
          <svg viewBox="0 0 24 24" className="absolute top-1.5 left-1.5 w-6 h-6 text-[#d6b8a0]" fill="currentColor">
            <circle cx="12" cy="12" r="3" />
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="12" cy="5" rx="2.6" ry="4" fill="currentColor" transform={`rotate(${a} 12 12)`} />
            ))}
          </svg>
          <svg viewBox="0 0 24 24" className="absolute bottom-1.5 right-1.5 w-6 h-6 text-[#d6b8a0]" fill="currentColor">
            <circle cx="12" cy="12" r="3" />
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx="12" cy="5" rx="2.6" ry="4" fill="currentColor" transform={`rotate(${a} 12 12)`} />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-between p-3 text-center">
            <div className="h-1 w-12 bg-[#d6b8a0]/70"></div>
            <div className="w-12 h-16 bg-[#e8dbc6] rounded-t-full border border-[#d6b8a0]/60"></div>
            {nameBar}
          </div>
        </ThumbShell>
      );
    case 'dourado-premium':
      return (
        <ThumbShell className="bg-[#111827] text-[#c9a227]">
          <div className="absolute inset-1 border border-[#c9a227]/70"></div>
          <div className="absolute top-1 left-1.5 text-[7px]">❖</div>
          <div className="absolute top-1 right-1.5 text-[7px]">❖</div>
          <div className="absolute bottom-1 left-1.5 text-[7px]">❖</div>
          <div className="absolute bottom-1 right-1.5 text-[7px]">❖</div>
          <div className="absolute inset-0 flex flex-col items-center justify-between p-3 text-center">
            <div className="h-1 w-14 bg-[#c9a227]/80 rounded"></div>
            <div className="w-12 h-14 bg-[#1a2438] border-2 border-[#c9a227] rounded-b-2xl"></div>
            {nameBar}
          </div>
        </ThumbShell>
      );
    case 'marmore-premium':
      return (
        <ThumbShell
          className="text-[#8a7353]"
          style={{ background: 'linear-gradient(155deg,#f7f4ee,#e7dfd2,#f2ede3)' }}
        >
          <div className="absolute inset-1 border border-[#b99b6b]/60"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-between p-3 text-center">
            <div className="h-1 w-10 bg-[#b99b6b]/80"></div>
            <div className="w-12 h-16 rounded-t-full border-[3px] border-[#b99b6b]/60 bg-[#eee6d8]"></div>
            {nameBar}
          </div>
        </ThumbShell>
      );
    case 'luz-radiante':
      return (
        <ThumbShell className="bg-[#0b1120] text-[#e8c96a]">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-[radial-gradient(circle,rgba(232,201,106,0.5),transparent_70%)]"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-between p-3 text-center">
            <div className="h-1 w-14 bg-[#e8c96a]/80 rounded"></div>
            <div className="w-11 h-11 rounded-full border border-[#e8c96a]/70 bg-[#0e1a2f]"></div>
            {nameBar}
          </div>
        </ThumbShell>
      );
    case 'jardim-premium':
      return (
        <ThumbShell className="bg-[#f7f5ee] text-[#5c7057]">
          <div className="absolute inset-1 border border-[#7d9b76]/50"></div>
          <svg viewBox="0 0 24 24" className="absolute top-1 left-1 w-5 h-5 text-[#7d9b76]" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3C7 6 6 12 12 21c6-9 5-15 0-18z" /></svg>
          <svg viewBox="0 0 24 24" className="absolute bottom-1 right-1 w-5 h-5 text-[#7d9b76]" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3C7 6 6 12 12 21c6-9 5-15 0-18z" /></svg>
          <div className="absolute inset-0 flex flex-col items-center justify-between p-3 text-center">
            <div className="h-1 w-12 bg-[#7d9b76]/70"></div>
            <div className="w-12 h-16 bg-white rounded-t-full border-2 border-[#7d9b76]/50"></div>
            {nameBar}
          </div>
        </ThumbShell>
      );
    case 'velas-premium':
      return (
        <ThumbShell className="bg-[#191208] text-[#e0a458]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(224,164,88,0.35),transparent_60%)]"></div>
          <div className="absolute bottom-0 left-2 w-2 h-7 bg-[#d9c9a8] rounded-t-sm"></div>
          <div className="absolute bottom-0 left-5 w-1.5 h-5 bg-[#d9c9a8] rounded-t-sm"></div>
          <div className="absolute bottom-0 right-2 w-2 h-7 bg-[#d9c9a8] rounded-t-sm"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-between p-3 text-center">
            <div className="h-1 w-14 bg-[#e0a458]/80 rounded"></div>
            <div className="w-11 h-11 rounded-full border border-[#e0a458]/60 bg-[#241a0c]"></div>
            {nameBar}
          </div>
        </ThumbShell>
      );
    case 'profundidade-3d':
      return (
        <ThumbShell className="bg-[#0c0a1d] text-[#c7b9ff]">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full border border-[#c7b9ff]/30"></div>
          <div className="absolute -left-8 top-6 w-20 h-20 rounded-full border border-[#c7b9ff]/25"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-between p-3 text-center">
            <div className="h-1 w-14 bg-[#a89bf0]/80 rounded"></div>
            <div className="w-12 h-14 bg-gradient-to-br from-[#2a2149] to-[#1a1435] border border-[#c7b9ff]/40 rounded-md shadow-lg"></div>
            {nameBar}
          </div>
        </ThumbShell>
      );
    case 'aquarela-ultra':
      return (
        <ThumbShell className="bg-[#f8fafc] text-[#64748b]">
          <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-[#7aa2c4]/50 blur-md"></div>
          <div className="absolute -bottom-5 -right-3 w-20 h-20 rounded-full bg-[#a4c4ac]/50 blur-md"></div>
          <div className="absolute top-8 right-6 w-14 h-14 rounded-full bg-[#d4bea3]/45 blur-md"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-between p-3 text-center">
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-[#7aa2c4] to-[#d4bea3]"></div>
            <div className="w-12 h-16 bg-white border border-[#7aa2c4]/40 rounded-t-[50%] rounded-b-sm"></div>
            {nameBar}
          </div>
        </ThumbShell>
      );
    case 'video-ultra':
      return (
        <ThumbShell className="bg-[#020617] text-[#fcd34d]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#1e3a5f,transparent_55%),radial-gradient(circle_at_75%_70%,#3b2a12,transparent_55%)]"></div>
          {[18, 40, 60, 78].map((l, i) => (
            <span key={i} className="absolute w-0.5 h-0.5 rounded-full bg-[#fcd34d]/80" style={{ top: `${20 + i * 16}%`, left: `${l}%` }}></span>
          ))}
          <div className="absolute inset-0 flex flex-col items-center justify-between p-3 text-center">
            <div className="h-1 w-14 bg-[#fcd34d]/80 rounded"></div>
            <div className="w-11 h-11 rounded-full border border-[#fcd34d]/60 bg-[#0b1220]"></div>
            {nameBar}
          </div>
        </ThumbShell>
      );
    case 'classico-ouro':
      return (
        <ThumbShell className="bg-navy-950 text-[#c5a059]">
          <div className="absolute inset-1 border-2 border-double border-[#c5a059]"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-between p-3 text-center">
            <div className="h-1 w-12 bg-[#c5a059]/80"></div>
            <div className="w-11 h-11 rounded-full border border-[#c5a059] bg-[#0f172a]"></div>
            {nameBar}
          </div>
        </ThumbShell>
      );
    case 'sereno-minimal':
      return (
        <ThumbShell className="bg-white text-navy-900">
          <div className="absolute inset-0 border-b-2 border-navy-900 p-2">
            <div className="h-1 w-8 bg-navy-500"></div>
            <div className="h-1.5 w-14 bg-navy-900 mt-1"></div>
          </div>
          <div className="absolute inset-0 flex items-center gap-2 px-2 pt-4">
            <div className="w-10 h-10 bg-slate-200 border border-slate-300"></div>
            <div className="space-y-1 flex-1">
              <div className="h-1 w-full bg-slate-300"></div>
              <div className="h-1 w-2/3 bg-slate-200"></div>
            </div>
          </div>
        </ThumbShell>
      );
    case 'casa-hortas':
    default:
      return (
        <ThumbShell className="bg-slate-50 text-navy-900">
          <div className="absolute top-0 left-0 w-full h-16 bg-[#0A192F] flex items-center px-2">
            <div className="h-1.5 w-16 bg-white rounded"></div>
          </div>
          <div className="absolute top-16 right-2 w-14 h-16 rounded-b-3xl border-2 border-[#D4AF37] bg-slate-200"></div>
          <div className="absolute inset-0 flex flex-col justify-end p-2 space-y-1">
            <div className="h-1 w-16 bg-[#0A192F]"></div>
            <div className="w-9 h-9 rounded-full border-2 border-[#D4AF37] bg-[#0A192F]"></div>
          </div>
        </ThumbShell>
      );
  }
}
