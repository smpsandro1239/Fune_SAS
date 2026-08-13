'use client';

import React from 'react';
import { FlyerData, FlyerTemplateConfig } from '@/lib/types';
import { 
  Heart, 
  User, 
  Flame, 
  Calendar, 
  MapPin, 
  Cross, 
  Info, 
  Clock 
} from 'lucide-react';

interface FlyerCanvasPreviewProps {
  data: FlyerData;
  template: FlyerTemplateConfig;
  previewRef?: React.RefObject<HTMLDivElement>;
}

export default function FlyerCanvasPreview({ data, template, previewRef }: FlyerCanvasPreviewProps) {
  const isCasaHortas = template.layoutStyle === 'casa-hortas';
  const isClassico = template.layoutStyle === 'classico-ouro';
  const isMinimal = template.layoutStyle === 'sereno-minimal';

  if (isClassico) {
    return (
      <div 
        ref={previewRef}
        className="w-[520px] h-[760px] bg-navy-950 text-white relative overflow-hidden shadow-2xl p-8 flex flex-col justify-between border-8 border-double border-gold-500 rounded-sm font-serif"
      >
        {/* Ornate corners */}
        <div className="absolute top-2 left-2 text-gold-400 text-xs">✦</div>
        <div className="absolute top-2 right-2 text-gold-400 text-xs">✦</div>
        <div className="absolute bottom-2 left-2 text-gold-400 text-xs">✦</div>
        <div className="absolute bottom-2 right-2 text-gold-400 text-xs">✦</div>

        <div className="text-center space-y-4">
          <div className="text-gold-400 tracking-[0.3em] text-xs uppercase font-semibold">
            {data.title}
          </div>

          <div className="w-24 h-24 mx-auto rounded-full border-2 border-gold-400 p-1 overflow-hidden shadow-xl">
            {/* Deceased photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={data.photoUrl} 
              alt={data.deceasedName} 
              className="w-full h-full object-cover rounded-full" 
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gold-300 tracking-wide">{data.deceasedName}</h1>
            <p className="text-sm text-navy-200 mt-1">{data.age} ANOS</p>
          </div>

          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto"></div>
        </div>

        <div className="space-y-4 text-xs text-navy-100 bg-navy-900/60 p-4 rounded border border-gold-500/20">
          <div>
            <span className="font-bold text-gold-400 block mb-1">FUNERAL:</span>
            <p>{data.funeralDateFormatted}</p>
            <p className="text-navy-300">{data.parishLocation}</p>
          </div>

          <div>
            <span className="font-bold text-gold-400 block mb-1">CEMITÉRIO:</span>
            <p>{data.cemeteryLocation}</p>
          </div>

          {data.wakeDetailsFormatted && (
            <div>
              <span className="font-bold text-gold-400 block mb-1">VELÓRIO:</span>
              <p>{data.wakeDetailsFormatted}</p>
            </div>
          )}
        </div>

        <div className="text-center pt-4 border-t border-gold-500/30">
          <p className="font-italic text-sm text-gold-300">{data.agencyName}</p>
          <p className="text-[10px] text-navy-400">{data.agencyAddress} • {data.agencyWebsite}</p>
        </div>
      </div>
    );
  }

  if (isMinimal) {
    return (
      <div 
        ref={previewRef}
        className="w-[520px] h-[760px] bg-white text-navy-900 relative overflow-hidden shadow-2xl p-8 flex flex-col justify-between border border-slate-200 font-sans"
      >
        <div className="border-b-2 border-navy-900 pb-4 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-navy-600 uppercase">{data.title}</p>
            <h1 className="text-2xl font-bold text-navy-950 mt-1">{data.deceasedName}</h1>
          </div>
          <div className="px-3 py-1 bg-navy-100 rounded text-xs font-bold text-navy-800">
            {data.age} ANOS
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 items-center my-4">
          <div className="col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={data.photoUrl} 
              alt={data.deceasedName} 
              className="w-full h-40 object-cover rounded border border-slate-200" 
            />
          </div>
          <div className="col-span-2 space-y-3 text-xs">
            <div>
              <p className="font-bold text-navy-900 uppercase">Cerimónia Funerária</p>
              <p className="text-navy-700">{data.funeralDateFormatted}</p>
              <p className="text-navy-600">{data.parishLocation}</p>
            </div>
            <div>
              <p className="font-bold text-navy-900 uppercase">Cemitério</p>
              <p className="text-navy-700">{data.cemeteryLocation}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded text-xs space-y-2 border-l-4 border-navy-900">
          <p className="font-bold text-navy-900">Velório & Outras Informações</p>
          <p className="text-navy-700">{data.wakeDetailsFormatted}</p>
          <p className="text-navy-600">Local do óbito: {data.deathLocation}</p>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-navy-600">
          <span className="font-bold">{data.agencyName}</span>
          <span>{data.agencyWebsite}</span>
        </div>
      </div>
    );
  }

  // DEFAULT & RECOMMENDED: "Modelo Casa Hortas" (Authentic Portuguese Funeral Notice Layout)
  return (
    <div 
      ref={previewRef}
      className="w-[520px] h-[760px] bg-slate-50 text-navy-900 relative overflow-hidden shadow-2xl flex flex-col justify-between font-sans selection:bg-gold-200"
    >
      {/* Top Header Badge Left */}
      <div className="pt-6 px-6 relative z-10 flex justify-between items-start">
        <div className="w-[62%] space-y-3">
          {/* Header Pill */}
          <div className="inline-flex items-center space-x-2 bg-[#0A192F] text-white px-3.5 py-1.5 rounded-r-full shadow-md -ml-6">
            <Heart className="w-3.5 h-3.5 text-white fill-none stroke-[2.5]" />
            <span className="text-[11px] font-extrabold tracking-wider uppercase">
              {data.title}
            </span>
          </div>

          {/* Deceased Name */}
          <h1 className="text-2xl font-black text-[#0A192F] leading-tight tracking-tight uppercase">
            {data.deceasedName}
          </h1>

          {/* Age Badge */}
          <div className="inline-flex items-center space-x-2 bg-[#0A192F] text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
            <User className="w-3.5 h-3.5 text-white" />
            <span>{data.age} ANOS</span>
          </div>
        </div>

        {/* Photo Top Right with Gold Curved Frame Arch */}
        <div className="w-[36%] relative">
          <div className="relative w-44 h-56 rounded-b-[70px] rounded-t-2xl overflow-hidden border-[3px] border-[#D4AF37] shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={data.photoUrl} 
              alt={data.deceasedName} 
              className="w-full h-full object-cover" 
            />
          </div>
          {/* Gold Decorative Arch Line */}
          <div className="absolute -top-3 -right-3 w-48 h-60 rounded-b-[75px] rounded-t-3xl border border-[#D4AF37]/50 pointer-events-none"></div>
        </div>
      </div>

      {/* Main Content Details Left & Middle */}
      <div className="px-6 grid grid-cols-12 gap-4 items-end mb-4">
        {/* Left Column Info */}
        <div className="col-span-7 space-y-4">
          {/* FUNERAL Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#0A192F] text-white flex items-center justify-center shadow">
                <Flame className="w-4 h-4 text-amber-300" />
              </div>
              <h2 className="text-lg font-black text-[#0A192F] tracking-wider uppercase">
                FUNERAL
              </h2>
            </div>
            
            {/* Heart Divider Line */}
            <div className="flex items-center space-x-2">
              <div className="h-[1px] bg-[#D4AF37] flex-1"></div>
              <Heart className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
              <div className="h-[1px] bg-[#D4AF37] flex-1"></div>
            </div>

            {/* Funeral Date & Time */}
            <div className="flex items-start space-x-2.5 text-xs text-navy-900 pt-1">
              <div className="p-1 rounded bg-amber-100/60 border border-amber-300/40 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-amber-800" />
              </div>
              <p className="leading-snug">
                {data.funeralDateFormatted}
              </p>
            </div>

            {/* Funeral Location */}
            <div className="flex items-start space-x-2.5 text-xs text-navy-900">
              <div className="p-1 rounded bg-amber-100/60 border border-amber-300/40 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-800" />
              </div>
              <p className="font-medium text-navy-800 leading-snug">
                {data.parishLocation}
              </p>
            </div>
          </div>

          {/* CEMITÉRIO Section */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#0A192F] text-white flex items-center justify-center shadow">
                <Cross className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-black text-[#0A192F] tracking-wider uppercase">
                CEMITÉRIO
              </h2>
            </div>
            <p className="text-xs font-medium text-navy-800 pl-9 leading-snug">
              {data.cemeteryLocation}
            </p>
          </div>

          {/* OUTRAS INFORMAÇÕES Section */}
          <div className="bg-[#0A192F] text-white rounded-xl p-3 space-y-2 shadow-md">
            <div className="flex items-center space-x-1.5 text-gold-400 font-bold text-xs">
              <Info className="w-3.5 h-3.5" />
              <span className="uppercase tracking-wider text-[11px]">OUTRAS INFORMAÇÕES</span>
            </div>
            <div className="text-[10px] space-y-1 text-slate-200">
              <p><span className="font-semibold text-white">Local do óbito:</span> {data.deathLocation}</p>
              <p><span className="font-semibold text-white">Velório:</span> {data.wakeDetailsFormatted}</p>
            </div>
          </div>
        </div>

        {/* Right Column Agency Card (Bottom Right) */}
        <div className="col-span-5">
          <div className="bg-[#0A192F] text-white rounded-2xl p-4 shadow-xl text-center space-y-3 border border-[#D4AF37]/30">
            {/* Address */}
            <div className="flex items-start justify-center space-x-1 text-[10px] text-slate-200">
              <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0 mt-0.5" />
              <span className="leading-tight">{data.agencyAddress}</span>
            </div>

            {/* Dots Divider */}
            <div className="flex justify-center space-x-1 text-[#D4AF37] text-[10px]">
              <span>•</span><span>•</span><span>•</span>
            </div>

            {/* Location */}
            <p className="text-[10px] text-slate-200 font-medium">
              {data.agencyLocation}
            </p>

            {/* Heart Divider */}
            <div className="flex justify-center">
              <Heart className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
            </div>

            {/* Agency Script Name */}
            <p className="font-serif italic text-xs text-gold-300 font-semibold">
              {data.agencyName}
            </p>

            {/* Medallion Monogram Logo */}
            <div className="w-16 h-16 mx-auto relative flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-2 border-gold-400 flex flex-col items-center justify-center p-1 bg-navy-950/80">
                <span className="font-serif font-black text-sm text-gold-300 leading-none">CH</span>
              </div>
            </div>

            <div className="text-[9px] text-slate-300 space-y-0.5">
              <p className="font-bold tracking-widest text-[#D4AF37]">{data.agencyFounded}</p>
              <p className="text-slate-400 underline">{data.agencyWebsite}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
