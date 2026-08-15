'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Palette,
  FileText,
  Calendar,
  Plus,
  ArrowUpRight,
  Clock,
  MapPin,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  DashboardSummary,
  ApiFuneral,
  apiErrorMessage,
  apiService,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useAgency } from '@/context/AgencyContext';

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendado',
  IN_PROGRESS: 'Em Curso',
  COMPLETED: 'Concluído',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentAgency } = useAgency();
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<ApiFuneral[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiService.reports.dashboard(), apiService.funerals.list()])
      .then(([dash, list]) => {
        if (cancelled) return;
        setDashboard(dash);
        setRecent(list.slice(-4).reverse());
      })
      .catch((err) => {
        if (!cancelled) setError(apiErrorMessage(err, 'Não foi possível carregar o painel.'));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = dashboard
    ? [
        { name: 'Funerais Registados', value: String(dashboard.funerals), change: 'Total na agência', icon: Users, color: 'text-blue-400' },
        { name: 'Agendados / Em Curso', value: String(dashboard.scheduled), change: 'Próximas cerimónias', icon: Calendar, color: 'text-amber-400' },
        { name: 'Concluídos', value: String(dashboard.completed), change: 'Serviços realizados', icon: Sparkles, color: 'text-emerald-400' },
        { name: 'Documentos Arquivados', value: String(dashboard.documents), change: 'Em conformidade RGPD', icon: FileText, color: 'text-gold-400' },
      ]
    : [];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Banner de boas-vindas */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 border border-gold-500/20 shadow-2xl">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {currentAgency?.name}
              {currentAgency?.foundedYear ? ` (${currentAgency.foundedYear})` : ''}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Painel de Gestão Funerária <span className="gold-gradient-text">FuneSAS</span>
          </h1>
          <p className="text-sm text-navy-200 leading-relaxed">
            Bem-vindo, {user?.name.split(' ')[0] || 'utilizador'}. Digitalização completa de processos
            funerários, participações gráficas e gestão documental centralizada.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/flyers"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-gold-500/10 transition-all"
            >
              <Palette className="w-4 h-4" />
              <span>Criar Flyer de Participação</span>
            </Link>

            <Link
              href="/funerals"
              className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-medium text-xs border border-navy-700 flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4 text-gold-400" />
              <span>Gerir Funerais</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Cartões de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!dashboard && !error ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
          </div>
        ) : (
          stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800/80 shadow-lg space-y-3 hover:border-gold-500/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-navy-300">{stat.name}</span>
                  <div className={`p-2.5 rounded-xl bg-navy-950 border border-navy-800 ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
                <p className="text-[11px] text-navy-400">{stat.change}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Funerais recentes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-gold-400" />
              Serviços Funerários Recentes
            </h2>
            <p className="text-xs text-navy-300">Registo de falecidos e estado das cerimónias</p>
          </div>

          <Link
            href="/funerals"
            className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center space-x-1"
          >
            <span>Ver Todos</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-xs text-navy-400">Sem funerais registados.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recent.map((funeral) => (
              <div
                key={funeral.id}
                className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 flex gap-4 hover:border-gold-500/30 transition-all shadow-md"
              >
                <div className="w-20 h-24 rounded-xl bg-navy-950 border border-gold-500/30 shrink-0 flex items-center justify-center">
                  <Users className="w-6 h-6 text-gold-400/60" />
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      funeral.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : funeral.status === 'IN_PROGRESS'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {STATUS_LABELS[funeral.status] || funeral.status}
                    </span>
                    {funeral.deceased.age != null && (
                      <span className="text-xs font-bold text-gold-400">{funeral.deceased.age} ANOS</span>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-sm truncate uppercase tracking-tight">
                    {funeral.deceased.fullName}
                  </h3>

                  <div className="space-y-1 text-xs text-navy-300">
                    {funeral.funeralDate && (
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-gold-400" />
                        <span>
                          {new Date(funeral.funeralDate).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {funeral.funeralTime ? `, ${funeral.funeralTime}` : ''}
                        </span>
                      </div>
                    )}
                    {funeral.locationParish && (
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-navy-400" />
                        <span className="truncate">{funeral.locationParish}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
