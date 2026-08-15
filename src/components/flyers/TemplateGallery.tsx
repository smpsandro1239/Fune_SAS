'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Gem, LayoutGrid, Sparkles, Star } from 'lucide-react';
import { FlyerTemplateConfig, FlyerPlan } from '@/lib/types';
import { PLAN_LABELS } from '@/lib/templates-preset';
import TemplateThumbnail from './TemplateThumbnail';

type FilterKey = 'TODOS' | FlyerPlan;

const FILTERS: { key: FilterKey; label: string; icon: React.ReactNode }[] = [
  { key: 'TODOS', label: 'Todos', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { key: 'FREE', label: 'Free', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { key: 'PREMIUM', label: 'Premium', icon: <Star className="w-3.5 h-3.5" /> },
  { key: 'ULTRA', label: 'Ultra', icon: <Gem className="w-3.5 h-3.5" /> },
];

const PLAN_BADGE: Record<FlyerPlan, { className: string; icon: React.ReactNode }> = {
  FREE: { className: 'bg-slate-700/80 text-slate-200 border border-slate-500/50', icon: <Sparkles className="w-3 h-3" /> },
  PREMIUM: { className: 'bg-gold-500 text-navy-950 border border-gold-400', icon: <Star className="w-3 h-3" /> },
  ULTRA: { className: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white border border-violet-300/50', icon: <Crown className="w-3 h-3" /> },
};

const PLAN_DESC: Record<FlyerPlan, string> = {
  FREE: '3 flyers por mês',
  PREMIUM: 'Ilimitado + premium',
  ULTRA: 'Topo de gama',
};

interface TemplateGalleryProps {
  templates: FlyerTemplateConfig[];
  selectedId: string;
  onSelect: (template: FlyerTemplateConfig) => void;
}

export default function TemplateGallery({ templates, selectedId, onSelect }: TemplateGalleryProps) {
  const [filter, setFilter] = useState<FilterKey>('TODOS');

  const visibleTemplates = useMemo(
    () => (filter === 'TODOS' ? templates : templates.filter((t) => t.plan === filter)),
    [templates, filter]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-gold-400" />
            Biblioteca de Modelos
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-navy-800 border border-navy-700 text-navy-300">
            {templates.length} modelos • HD
          </span>
        </div>

        <div role="group" aria-label="Filtrar por plano" className="flex rounded-xl bg-navy-950 p-1 border border-navy-800">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                filter === f.key
                  ? 'bg-navy-800 text-gold-300 shadow border border-gold-500/20'
                  : 'text-navy-400 hover:text-white'
              }`}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {visibleTemplates.map((tmpl, i) => {
          const isSelected = tmpl.id === selectedId;
          const badge = PLAN_BADGE[tmpl.plan];
          return (
            <motion.button
              key={tmpl.id}
              type="button"
              onClick={() => onSelect(tmpl)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.25 }}
              aria-pressed={isSelected}
              aria-label={`Selecionar modelo ${tmpl.name} (${PLAN_LABELS[tmpl.plan]})`}
              className={`group relative text-left rounded-2xl overflow-hidden border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                isSelected
                  ? 'border-gold-400 ring-2 ring-gold-400/40 shadow-lg shadow-gold-500/10'
                  : 'border-navy-700 hover:border-navy-500 hover:-translate-y-0.5'
              }`}
            >
              <div className="aspect-[3/2] w-full bg-navy-950">
                <TemplateThumbnail template={tmpl} />
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center">
                    <svg viewBox="0 0 12 12" className="w-3 h-3 text-navy-950" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2 6.5L4.5 9L10 3.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="absolute top-2 left-2">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${badge.className}`}>
                  {badge.icon}
                  {PLAN_LABELS[tmpl.plan]}
                </span>
              </div>

              {tmpl.plan === 'ULTRA' && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-white bg-black/50 backdrop-blur-sm border border-white/20">
                  <Gem className="w-2.5 h-2.5" />
                  TOP
                </div>
              )}

              <div className="p-2.5 bg-navy-900 border-t border-navy-800">
                <p className="text-[11px] font-semibold text-white truncate">{tmpl.name}</p>
                <p className="text-[9.5px] text-navy-400 mt-0.5 truncate">{PLAN_DESC[tmpl.plan]}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {visibleTemplates.length === 0 && (
        <div className="p-6 rounded-2xl border border-dashed border-navy-700 text-center text-navy-400 text-xs">
          Sem modelos disponíveis nesta categoria.
        </div>
      )}
    </div>
  );
}
