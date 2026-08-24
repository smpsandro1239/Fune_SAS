'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Check, CheckCircle2, Loader2, MessageSquareHeart, Trash2, X } from 'lucide-react';
import {
  ApiCondolenceWithFuneral,
  apiErrorMessage,
  apiService,
} from '@/lib/api';
import { useToast } from '@/components/Toast';

type Filter = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'APPROVED', label: 'Aprovadas' },
  { value: 'REJECTED', label: 'Rejeitadas' },
  { value: 'ALL', label: 'Todas' },
];

const FILTER_TO_APPROVED: Partial<Record<Filter, boolean>> = {
  APPROVED: true,
  REJECTED: false,
};

export default function CondolencesModerationPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<ApiCondolenceWithFuneral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('PENDING');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (f: Filter) => {
    setLoading(true);
    setError('');
    try {
      setItems(await apiService.condolences.queue(FILTER_TO_APPROVED[f]));
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível carregar as condolências.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  const handleApprove = async (item: ApiCondolenceWithFuneral) => {
    setBusyId(item.id);
    try {
      await apiService.condolences.approve(item.funeralId, item.id);
      if (filter !== 'ALL') {
        setItems((prev) => prev.filter((c) => c.id !== item.id));
      } else {
        setItems((prev) => prev.map((c) => (c.id === item.id ? { ...c, approved: true } : c)));
      }
      toast('success', 'Condolência aprovada.');
    } catch (err) {
      toast('error', apiErrorMessage(err, 'Não foi possível aprovar a condolência.'));
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (item: ApiCondolenceWithFuneral) => {
    setBusyId(item.id);
    try {
      await apiService.condolences.reject(item.funeralId, item.id);
      if (filter !== 'ALL') {
        setItems((prev) => prev.filter((c) => c.id !== item.id));
      } else {
        setItems((prev) => prev.map((c) => (c.id === item.id ? { ...c, approved: false } : c)));
      }
      toast('info', 'Condolência escondida do público.');
    } catch (err) {
      toast('error', apiErrorMessage(err, 'Não foi possível rejeitar a condolência.'));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: ApiCondolenceWithFuneral) => {
    if (!window.confirm(`Eliminar definitivamente a mensagem de "${item.authorName}"?`)) return;
    setBusyId(item.id);
    try {
      await apiService.condolences.remove(item.funeralId, item.id);
      setItems((prev) => prev.filter((c) => c.id !== item.id));
      toast('success', 'Condolência eliminada.');
    } catch (err) {
      toast('error', apiErrorMessage(err, 'Não foi possível eliminar a condolência.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquareHeart className="w-5 h-5 text-gold-400" />
            Moderação de Condolências
          </h1>
          <p className="text-xs text-navy-300 mt-0.5">
            Aprove ou rejeite as mensagens deixadas nas páginas públicas de pêsames.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filter === f.value
                ? 'bg-gold-500 text-navy-950 border-gold-400'
                : 'bg-navy-900/80 text-navy-200 border-navy-700 hover:border-gold-500/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 animate-spin text-gold-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-10 rounded-2xl bg-navy-900/80 border border-navy-800 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <p className="text-sm font-semibold text-white">Sem condolências nesta vista.</p>
          <p className="text-xs text-navy-300">
            As novas mensagens das páginas públicas aparecem aqui quando a moderação estiver ativa.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-3 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{item.authorName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.approved
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-amber-500/15 text-amber-300'
                      }`}
                    >
                      {item.approved ? 'Aprovada' : 'Pendente'}
                    </span>
                  </div>
                  <p className="text-[10px] text-navy-400">
                    {new Date(item.createdAt).toLocaleString('pt-PT')}
                    {item.funeral && (
                      <>
                        {' • '}
                        <Link
                          href={`/funerals?funeral=${item.funeral.id}`}
                          className="text-gold-400 hover:text-gold-300"
                        >
                          {item.funeral.deceased.fullName}
                        </Link>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!item.approved && (
                    <button
                      onClick={() => handleApprove(item)}
                      disabled={busyId === item.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all disabled:opacity-60"
                    >
                      {busyId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Aprovar
                    </button>
                  )}
                  {item.approved && (
                    <button
                      onClick={() => handleReject(item)}
                      disabled={busyId === item.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-amber-500/20 text-navy-200 hover:text-amber-300 border border-navy-700 text-xs font-semibold transition-all disabled:opacity-60"
                    >
                      <X className="w-3.5 h-3.5" />
                      Esconder
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={busyId === item.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-red-500/20 text-navy-300 hover:text-red-300 border border-navy-700 text-xs font-semibold transition-all disabled:opacity-60"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>

              <p className="text-xs text-navy-100 leading-relaxed whitespace-pre-line bg-navy-950/60 p-3 rounded-xl border border-navy-800">
                {item.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
