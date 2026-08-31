'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Eye, Gem, LayoutGrid, Sparkles, Star, X } from 'lucide-react';
import { FlyerData, FlyerTemplateConfig, FlyerPlan } from '@/lib/types';
import { PLAN_LABELS } from '@/lib/templates-preset';
import { SAMPLE_FLYER_DATA } from '@/lib/flyer-sample';
import TemplateMiniature from './TemplateMiniature';
import FlyerScaledView from './FlyerScaledView';
import FlyerCanvasPreview from './FlyerCanvasPreview';

type FilterKey = 'TODOS' | FlyerPlan;
type CategoryKey = 'TODAS' | string;

const FILTERS: { key: FilterKey; label: string; icon: React.ReactNode }[] = [
  { key: 'TODOS', label: 'Todos', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { key: 'FREE', label: 'Free', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { key: 'PREMIUM', label: 'Premium', icon: <Star className="w-3.5 h-3.5" /> },
  { key: 'ULTRA', label: 'Ultra', icon: <Gem className="w-3.5 h-3.5" /> },
];

const CATEGORY_LABELS: Record<string, string> = {
  PARTICIPACAO: 'Participação',
  MISSA_7DIA: 'Missa de 7º Dia',
  AGRADECIMENTO: 'Agradecimento',
};

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
  previewData?: FlyerData;
}

export default function TemplateGallery({ templates, selectedId, onSelect, previewData }: TemplateGalleryProps) {
  const [filter, setFilter] = useState<FilterKey>('TODOS');
  const [category, setCategory] = useState<CategoryKey>('TODAS');
  const [preview, setPreview] = useState<FlyerTemplateConfig | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>(templates.map((t) => t.category));
    return Array.from(set);
  }, [templates]);

  const visibleTemplates = useMemo(() => {
    let list = filter === 'TODOS' ? templates : templates.filter((t) => t.plan === filter);
    if (category !== 'TODAS') list = list.filter((t) => t.category === category);
    return list;
  }, [templates, filter, category]);

  const openPreview = (tmpl: FlyerTemplateConfig) => {
    onSelect(tmpl);
    setPreview(tmpl);
  };

  useEffect(() => {
    if (!preview) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreview(null);
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [preview]);

  const modalData = previewData || SAMPLE_FLYER_DATA;

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

      {categories.length > 1 && (
        <div role="group" aria-label="Filtrar por categoria" className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategory('TODAS')}
            aria-pressed={category === 'TODAS'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
              category === 'TODAS'
                ? 'bg-gold-500/15 text-gold-300 border-gold-500/30'
                : 'bg-navy-950 text-navy-400 border-navy-800 hover:text-white'
            }`}
          >
            Todas as categorias
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
                category === c
                  ? 'bg-gold-500/15 text-gold-300 border-gold-500/30'
                  : 'bg-navy-950 text-navy-400 border-navy-800 hover:text-white'
              }`}
            >
              {CATEGORY_LABELS[c] || c}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
        {visibleTemplates.map((tmpl, i) => {
          const isSelected = tmpl.id === selectedId;
          const badge = PLAN_BADGE[tmpl.plan];
          return (
            <motion.button
              key={tmpl.id}
              type="button"
              onClick={() => openPreview(tmpl)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.25 }}
              aria-pressed={isSelected}
              aria-label={`Pré-visualizar modelo ${tmpl.name} (${PLAN_LABELS[tmpl.plan]})`}
              className={`group relative text-left rounded-2xl overflow-hidden border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                isSelected
                  ? 'border-gold-400 ring-2 ring-gold-400/40 shadow-lg shadow-gold-500/10'
                  : 'border-navy-700 hover:border-navy-500 hover:-translate-y-0.5'
              }`}
            >
              <div className="relative w-full bg-navy-950">
                <TemplateMiniature template={tmpl} />

                {isSelected && (
                  <div className="absolute bottom-2 right-2 z-10 w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center">
                    <svg viewBox="0 0 12 12" className="w-3 h-3 text-navy-950" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2 6.5L4.5 9L10 3.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}

                <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-1.5">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${badge.className}`}>
                    {badge.icon}
                    {PLAN_LABELS[tmpl.plan]}
                  </span>
                  {tmpl.plan === 'ULTRA' && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold text-white bg-black/50 backdrop-blur-sm border border-white/20">
                      <Gem className="w-2.5 h-2.5" />
                      TOP
                    </span>
                  )}
                </div>

                <div className="absolute inset-0 z-10 flex items-center justify-center bg-navy-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-[1px]">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-500 text-navy-950 text-[11px] font-bold shadow-lg">
                    <Eye className="w-3.5 h-3.5" />
                    Ver modelo
                  </span>
                </div>
              </div>

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

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-sm"
            onClick={() => setPreview(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Pré-visualização do modelo ${preview.name}`}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-navy-900 border border-navy-700 shadow-2xl p-4 sm:p-6"
            >
              <button
                type="button"
                onClick={() => setPreview(null)}
                aria-label="Fechar pré-visualização"
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-navy-800 hover:bg-navy-700 border border-navy-600 flex items-center justify-center text-navy-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 pr-10 mb-4">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${PLAN_BADGE[preview.plan].className}`}>
                  {PLAN_BADGE[preview.plan].icon}
                  {PLAN_LABELS[preview.plan]}
                </span>
                <h3 className="text-sm font-bold text-white">{preview.name}</h3>
              </div>

              <p className="text-xs text-navy-300 leading-relaxed mb-4">{preview.description}</p>

              <div className="w-full max-w-[480px] mx-auto bg-navy-950/60 rounded-2xl border border-navy-800 p-3">
                <FlyerScaledView maxScale={0.85} minScale={0.2}>
                  <FlyerCanvasPreview data={modalData} template={preview} />
                </FlyerScaledView>
              </div>

              <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="px-4 py-2 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-600 text-xs font-medium text-white transition-colors"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(preview);
                    setPreview(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 text-xs font-bold transition-all shadow-md shadow-gold-500/20"
                >
                  Usar este modelo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
