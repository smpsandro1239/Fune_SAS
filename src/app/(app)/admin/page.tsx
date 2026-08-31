'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  CalendarHeart,
  CreditCard,
  Euro,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import {
  AdminOverview,
  AdminAgency,
  apiErrorMessage,
  apiService,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const PLAN_BADGE: Record<string, { label: string; className: string }> = {
  FREE: { label: 'Free', className: 'bg-navy-800 text-navy-300 border-navy-700' },
  PRO: { label: 'PRO', className: 'bg-gold-500/15 text-gold-300 border-gold-500/30' },
  ENTERPRISE: { label: 'Enterprise', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
};

export default function AdminPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [agencies, setAgencies] = useState<AdminAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'SUPER_ADMIN') {
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([apiService.admin.overview(), apiService.admin.agencies()])
      .then(([ov, ag]) => {
        if (cancelled) return;
        setOverview(ov);
        setAgencies(ag);
      })
      .catch((err) => {
        if (!cancelled) setError(apiErrorMessage(err, 'Não foi possível carregar o painel de administração.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-3">
        <ShieldCheck className="w-10 h-10 text-navy-400" />
        <p className="text-sm font-semibold text-white">Sem permissões</p>
        <p className="text-xs text-navy-300">Apenas utilizadores com perfil de Super Admin podem aceder a este painel.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 animate-spin text-gold-400" />
      </div>
    );
  }

  const metrics = overview
    ? [
        { title: 'Agências', value: String(overview.totalAgencies), icon: Building2, color: 'text-blue-400' },
        { title: 'Utilizadores', value: String(overview.totalUsers), icon: Users, color: 'text-gold-400' },
        { title: 'Funerais', value: String(overview.totalFunerals), icon: CalendarHeart, color: 'text-amber-400' },
        { title: 'Subscrições Ativas', value: String(overview.activeSubscriptions), icon: CreditCard, color: 'text-emerald-400' },
        { title: 'Receita Estimada', value: `€${overview.revenueEstimate}/mês`, icon: Euro, color: 'text-gold-300' },
      ]
    : [];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-gold-400" />
          Administração Global
        </h1>
        <p className="text-xs text-navy-300">
          Visão geral de todas as agências, utilizadores e receitas da plataforma.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.title} className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-2 shadow-lg">
              <span className="text-xs font-semibold text-navy-300">{m.title}</span>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-white">{m.value}</div>
                <div className={`p-2.5 rounded-xl bg-navy-950 border border-navy-800 ${m.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-4 shadow-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gold-400" />
            Agências
          </h2>
          <p className="text-xs text-navy-300">
            {agencies.length} agência(s) registada(s) na plataforma.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-navy-400 border-b border-navy-800">
                <th className="pb-2 pr-4 font-semibold">Nome</th>
                <th className="pb-2 pr-4 font-semibold">Localização</th>
                <th className="pb-2 pr-4 font-semibold">Plano</th>
                <th className="pb-2 font-semibold">Utilizadores</th>
              </tr>
            </thead>
            <tbody>
              {agencies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-navy-400">Sem agências registadas.</td>
                </tr>
              ) : (
                agencies.map((agency) => {
                  const badge = PLAN_BADGE[agency.subscriptionPlan] || PLAN_BADGE.FREE;
                  return (
                    <tr key={agency.id} className="border-b border-navy-800/60 last:border-0">
                      <td className="py-3 pr-4 font-semibold text-white">{agency.name}</td>
                      <td className="py-3 pr-4 text-navy-300">{agency.location || '—'}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 text-navy-300">{agency.usersCount}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
