'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Check,
  Star,
  Crown,
  Gem,
  Loader2,
  AlertCircle,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { apiService, apiErrorMessage, SubscriptionPlan, ApiSubscription } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface UsageInfo {
  plan: SubscriptionPlan;
  expired: boolean;
  validUntil: string | null;
  usage: { funerals: number; users: number; documents: number };
  limits: { maxFunerals: number; maxUsers: number; maxDocuments: number };
}

const USAGE_ROWS: { key: keyof UsageInfo['usage']; label: string; limitKey: keyof UsageInfo['limits'] }[] = [
  { key: 'funerals', label: 'Funerais', limitKey: 'maxFunerals' },
  { key: 'users', label: 'Utilizadores', limitKey: 'maxUsers' },
  { key: 'documents', label: 'Documentos', limitKey: 'maxDocuments' },
];

const PLAN_META: Record<SubscriptionPlan, { label: string; price: string; icon: React.ReactNode; color: string; features: string[] }> = {
  FREE: {
    label: 'Free',
    price: '€0/mês',
    icon: <Star className="w-5 h-5" />,
    color: 'from-navy-600 to-navy-700',
    features: ['Até 10 funerais', '1 utilizador', 'Até 25 documentos', '3 modelos de flyer básicos', 'Agenda básica'],
  },
  PRO: {
    label: 'Pro',
    price: '€29/mês',
    icon: <Crown className="w-5 h-5" />,
    color: 'from-gold-500 to-amber-400',
    features: ['Até 250 funerais', '8 utilizadores', '500 documentos', 'Todos os modelos de flyer', 'Publicação Facebook/Instagram', 'Relatórios analíticos', 'Suporte prioritário'],
  },
  ENTERPRISE: {
    label: 'Enterprise',
    price: '€99/mês',
    icon: <Gem className="w-5 h-5" />,
    color: 'from-purple-500 to-indigo-400',
    features: ['Funerais ilimitados', 'Utilizadores ilimitados', 'Documentos ilimitados', 'API completa', 'Modelos ultra exclusivos', 'Manager dedicado', 'SLA garantido', 'Integrações personalizadas'],
  },
};

const PLAN_ORDER: SubscriptionPlan[] = ['FREE', 'PRO', 'ENTERPRISE'];

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [current, setCurrent] = useState<ApiSubscription | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [changing, setChanging] = useState<SubscriptionPlan | null>(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [data, usageInfo] = await Promise.all([
          apiService.subscriptions.current(),
          apiService.subscriptions.usage(),
        ]);
        setCurrent(data);
        setUsage(usageInfo);
      } catch (err) {
        setError(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChangePlan = async (plan: SubscriptionPlan) => {
    if (plan === current?.plan) return;
    setChanging(plan);
    setSuccess('');
    setError('');
    try {
      const updated = await apiService.subscriptions.changePlan(plan);
      setCurrent(updated);
      setUsage(usageInfo => usageInfo ? { ...usageInfo, plan } : usageInfo);
      setSuccess(`Plano alterado para ${PLAN_META[plan].label} com sucesso.`);
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível alterar o plano.'));
    } finally {
      setChanging(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-gold-400 animate-spin" />
      </div>
    );
  }

  const currentPlan = current?.plan || user?.role === 'ADMIN' ? current?.plan : 'FREE';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white">Plano & Subscrição</h1>
        <p className="text-sm text-navy-300 mt-1">Gerira o plano da sua agência e consulte o histórico.</p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Current Plan */}
      {current && (
        <div className="bg-navy-900/80 border border-navy-700/60 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${PLAN_META[current.plan].color} flex items-center justify-center text-white shadow-lg`}>
              {PLAN_META[current.plan].icon}
            </div>
            <div>
              <div className="text-sm font-bold text-white">Plano Atual: {PLAN_META[current.plan].label}</div>
              <div className="text-xs text-navy-300">{PLAN_META[current.plan].price}</div>
            </div>
          </div>
          {current.validUntil && (
            <div className="text-right">
              <div className="text-[10px] text-navy-400 flex items-center gap-1 justify-end">
                <Calendar className="w-3 h-3" /> Válido até
              </div>
              <div className="text-xs font-semibold text-white">
                {new Date(current.validUntil).toLocaleDateString('pt-PT')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Uso vs limites */}
      {usage && (
        <div className="bg-navy-900/80 border border-navy-700/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold-400" />
              Utilização do Plano
            </h2>
            {usage.expired && (
              <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 text-[10px] font-bold">
                SUBSCRIÇÃO EXPIRADA — LIMITES FREE ATIVOS
              </span>
            )}
          </div>
          <div className="space-y-3">
            {USAGE_ROWS.map(({ key, label, limitKey }) => {
              const used = usage.usage[key];
              const max = usage.limits[limitKey];
              const pct = max < 0 ? 0 : Math.min(100, Math.round((used / max) * 100));
              const nearLimit = max >= 0 && pct >= 80;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-navy-200 font-semibold">{label}</span>
                    <span className={nearLimit ? 'text-amber-300 font-bold' : 'text-navy-300'}>
                      {used} / {max < 0 ? '∞' : max}
                    </span>
                  </div>
                  {max >= 0 && (
                    <div className="h-2 rounded-full bg-navy-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 100 ? 'bg-red-400' : nearLimit ? 'bg-amber-400' : 'bg-gradient-to-r from-gold-500 to-amber-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLAN_ORDER.map((plan) => {
          const meta = PLAN_META[plan];
          const isCurrent = current?.plan === plan;
          return (
            <div
              key={plan}
              className={`relative bg-navy-900/80 border rounded-2xl p-6 space-y-4 transition-all ${
                isCurrent ? 'border-gold-500 ring-1 ring-gold-500/30' : 'border-navy-700/60 hover:border-navy-600'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-gold-500 text-navy-950 text-[10px] font-bold">
                  ATUAL
                </span>
              )}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-white`}>
                {meta.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{meta.label}</h3>
                <p className="text-sm font-semibold text-gold-400">{meta.price}</p>
              </div>
              <ul className="space-y-2">
                {meta.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-navy-200">
                    <Check className="w-3.5 h-3.5 text-gold-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {!isCurrent && (
                <button
                  onClick={() => handleChangePlan(plan)}
                  disabled={changing !== null}
                  className={`w-full mt-2 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                    plan === 'PRO'
                      ? 'bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 shadow-md shadow-gold-500/10'
                      : plan === 'ENTERPRISE'
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-400 text-white shadow-md'
                      : 'bg-navy-800 text-navy-300 border border-navy-700 hover:bg-navy-700'
                  }`}
                >
                  {changing === plan ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Escolher ${meta.label}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
