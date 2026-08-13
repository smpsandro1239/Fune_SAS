'use client';

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Palette, 
  Users, 
  Building2, 
  Calendar,
  Sparkles
} from 'lucide-react';

export default function AnalyticsPage() {
  const metrics = [
    { title: 'Funerais Executados (2026)', value: '42', growth: '+14% vs ano anterior' },
    { title: 'Participações/Flyers Gerados', value: '128', growth: 'Média de 3 flyers por funeral' },
    { title: 'Visualizações de Obituários', value: '3,840', growth: 'Através de código QR e partilhas' },
    { title: 'Taxa de Satisfação Familiar', value: '99.4%', growth: 'Avaliação média 4.9/5' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gold-400" />
          Relatórios & Métricas Operacionais
        </h1>
        <p className="text-xs text-navy-300">
          Estatísticas da agência funerária, produção gráfica e desempenho dos serviços.
        </p>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.title} className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-2 shadow-lg">
            <span className="text-xs font-semibold text-navy-300">{m.title}</span>
            <div className="text-2xl font-bold text-white">{m.value}</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{m.growth}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Chart Placeholder Card */}
      <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              Distribuição de Serviços por Mês (2026)
            </h2>
            <p className="text-xs text-navy-300">Comparativo mensal de cerimónias e participações impressas</p>
          </div>
          <span className="text-xs text-gold-400 font-semibold px-2.5 py-1 rounded-lg bg-gold-500/15 border border-gold-500/30">
            Relatório Anual
          </span>
        </div>

        {/* Mock Chart Graphic Bars */}
        <div className="h-48 flex items-end justify-between gap-2 pt-8 px-4 border-b border-navy-800">
          {[
            { month: 'Jan', val: '60%' },
            { month: 'Fev', val: '45%' },
            { month: 'Mar', val: '75%' },
            { month: 'Abr', val: '50%' },
            { month: 'Mai', val: '65%' },
            { month: 'Jun', val: '80%' },
            { month: 'Jul', val: '95%' },
            { month: 'Ago', val: '70%' },
          ].map((bar) => (
            <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="w-full bg-navy-800 rounded-t-lg relative overflow-hidden flex items-end h-32">
                <div 
                  className="w-full bg-gradient-to-t from-gold-600 via-gold-500 to-amber-300 rounded-t-lg transition-all group-hover:brightness-125"
                  style={{ height: bar.val }}
                ></div>
              </div>
              <span className="text-[10px] font-bold text-navy-300">{bar.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
