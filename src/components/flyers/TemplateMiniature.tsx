'use client';

import React from 'react';
import { FlyerTemplateConfig } from '@/lib/types';
import { SAMPLE_FLYER_DATA } from '@/lib/flyer-sample';
import FlyerScaledView from './FlyerScaledView';
import FlyerCanvasPreview from './FlyerCanvasPreview';

function VideoUltraStaticThumb() {
  return (
    <div className="w-[520px] h-[760px] overflow-hidden bg-[#020617] relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#1e3a5f,transparent_55%),radial-gradient(circle_at_75%_70%,#3b2a12,transparent_55%)]"></div>
      {[18, 40, 60, 78].map((l, i) => (
        <span
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full bg-[#fcd34d]/80"
          style={{ top: `${20 + i * 16}%`, left: `${l}%` }}
        ></span>
      ))}
      <div className="absolute inset-0 flex flex-col items-center justify-between p-12 text-center">
        <div className="h-2 w-24 bg-[#fcd34d]/80 rounded"></div>
        <div className="w-24 h-24 rounded-full border-2 border-[#fcd34d]/60 bg-[#0b1220]"></div>
        <div className="space-y-3 w-40">
          <div className="h-2.5 w-3/4 rounded bg-[#fcd34d]/90 mx-auto"></div>
          <div className="h-2 w-1/2 rounded bg-[#fcd34d]/50 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

export default function TemplateMiniature({ template }: { template: FlyerTemplateConfig }) {
  return (
    <div className="relative w-full overflow-hidden">
      <FlyerScaledView>
        {template.layoutStyle === 'video-ultra' ? (
          <VideoUltraStaticThumb />
        ) : (
          <FlyerCanvasPreview data={SAMPLE_FLYER_DATA} template={template} />
        )}
      </FlyerScaledView>
    </div>
  );
}
