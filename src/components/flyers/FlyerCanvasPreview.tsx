'use client';

import React from 'react';
import { FlyerData, FlyerTemplateConfig } from '@/lib/types';
import {
  CasaHortasLayout,
  ClassicoOuroLayout,
  SerenoMinimalLayout,
} from './layouts/LegacyLayouts';
import {
  EleganteMinimalLayout,
  ClassicoSobrioLayout,
  FloralSuaveLayout,
} from './layouts/FreeLayouts';
import {
  DouradoPremiumLayout,
  MarmorePremiumLayout,
  LuzRadianteLayout,
  JardimPremiumLayout,
  VelasPremiumLayout,
} from './layouts/PremiumLayouts';
import {
  Profundidade3DLayout,
  AquarelaUltraLayout,
  VideoUltraLayout,
} from './layouts/UltraLayouts';

interface FlyerCanvasPreviewProps {
  data: FlyerData;
  template: FlyerTemplateConfig;
  previewRef?: React.RefObject<HTMLDivElement>;
}

export default function FlyerCanvasPreview({ data, template, previewRef }: FlyerCanvasPreviewProps) {
  switch (template.layoutStyle) {
    case 'elegante-minimal':
      return <EleganteMinimalLayout data={data} previewRef={previewRef} />;
    case 'classico-sobrio':
      return <ClassicoSobrioLayout data={data} previewRef={previewRef} />;
    case 'floral-suave':
      return <FloralSuaveLayout data={data} previewRef={previewRef} />;
    case 'dourado-premium':
      return <DouradoPremiumLayout data={data} previewRef={previewRef} />;
    case 'marmore-premium':
      return <MarmorePremiumLayout data={data} previewRef={previewRef} />;
    case 'luz-radiante':
      return <LuzRadianteLayout data={data} previewRef={previewRef} />;
    case 'jardim-premium':
      return <JardimPremiumLayout data={data} previewRef={previewRef} />;
    case 'velas-premium':
      return <VelasPremiumLayout data={data} previewRef={previewRef} />;
    case 'profundidade-3d':
      return <Profundidade3DLayout data={data} previewRef={previewRef} />;
    case 'aquarela-ultra':
      return <AquarelaUltraLayout data={data} previewRef={previewRef} />;
    case 'video-ultra':
      return <VideoUltraLayout data={data} previewRef={previewRef} />;
    case 'classico-ouro':
      return <ClassicoOuroLayout data={data} previewRef={previewRef} />;
    case 'sereno-minimal':
      return <SerenoMinimalLayout data={data} previewRef={previewRef} />;
    case 'casa-hortas':
    default:
      return <CasaHortasLayout data={data} previewRef={previewRef} />;
  }
}
