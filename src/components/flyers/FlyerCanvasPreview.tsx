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
import {
  CruzDouradaLayout,
  RosaEternaLayout,
  PombaPazLayout,
} from './layouts/ProLayoutsA';
import {
  HorizonteSerenoLayout,
  NoiteEstreladaLayout,
  MemoriaVivaLayout,
} from './layouts/ProLayoutsB';
import {
  AnjoGuardiaoLayout,
  FolhasOutonoLayout,
  CristalAzulLayout,
} from './layouts/ProLayoutsC';
import {
  AuroraBorealLayout,
  PergaminhoClassicoLayout,
  OndasSerenidadeLayout,
  LuzEternaLayout,
} from './layouts/ProLayoutsD';
import {
  MemorialCampoLayout,
  GratidaoLuzLayout,
  VeladaOrquideaLayout,
  MissaSetimoDiaLayout,
  CeuEternoLayout,
} from './layouts/ProLayoutsE';

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
    case 'cruz-dourada':
      return <CruzDouradaLayout data={data} previewRef={previewRef} />;
    case 'rosa-eterna':
      return <RosaEternaLayout data={data} previewRef={previewRef} />;
    case 'pomba-paz':
      return <PombaPazLayout data={data} previewRef={previewRef} />;
    case 'horizonte-sereno':
      return <HorizonteSerenoLayout data={data} previewRef={previewRef} />;
    case 'noite-estrelada':
      return <NoiteEstreladaLayout data={data} previewRef={previewRef} />;
    case 'memoria-viva':
      return <MemoriaVivaLayout data={data} previewRef={previewRef} />;
    case 'anjo-guardiao':
      return <AnjoGuardiaoLayout data={data} previewRef={previewRef} />;
    case 'folhas-outono':
      return <FolhasOutonoLayout data={data} previewRef={previewRef} />;
    case 'cristal-azul':
      return <CristalAzulLayout data={data} previewRef={previewRef} />;
    case 'aurora-boreal':
      return <AuroraBorealLayout data={data} previewRef={previewRef} />;
    case 'pergaminho-classico':
      return <PergaminhoClassicoLayout data={data} previewRef={previewRef} />;
    case 'ondas-serenidade':
      return <OndasSerenidadeLayout data={data} previewRef={previewRef} />;
    case 'luz-eterna':
      return <LuzEternaLayout data={data} previewRef={previewRef} />;
    case 'memorial-campo':
      return <MemorialCampoLayout data={data} previewRef={previewRef} />;
    case 'gratidao-luz':
      return <GratidaoLuzLayout data={data} previewRef={previewRef} />;
    case 'velada-orquidea':
      return <VeladaOrquideaLayout data={data} previewRef={previewRef} />;
    case 'missa-setimo-dia':
      return <MissaSetimoDiaLayout data={data} previewRef={previewRef} />;
    case 'ceu-eterno':
      return <CeuEternoLayout data={data} previewRef={previewRef} />;
    case 'classico-ouro':
      return <ClassicoOuroLayout data={data} previewRef={previewRef} />;
    case 'sereno-minimal':
      return <SerenoMinimalLayout data={data} previewRef={previewRef} />;
    case 'casa-hortas':
    default:
      return <CasaHortasLayout data={data} previewRef={previewRef} />;
  }
}
