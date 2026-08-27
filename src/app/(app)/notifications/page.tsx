'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Bell, BellOff, CheckCheck, Check, Loader2 } from 'lucide-react';
import { ApiNotification, apiErrorMessage, apiService } from '@/lib/api';
import { useToast } from '@/components/Toast';

const TYPE_LABELS: Record<string, { label: string; cls: string }> = {
  EMAIL: { label: 'Email', cls: 'bg-sky-500/15 text-sky-300' },
  SMS: { label: 'SMS', cls: 'bg-violet-500/15 text-violet-300' },
  TAREFA: { label: 'Tarefa', cls: 'bg-amber-500/15 text-amber-300' },
  LEMBRETE: { label: 'Lembrete', cls: 'bg-emerald-500/15 text-emerald-300' },
  SISTEMA: { label: 'Sistema', cls: 'bg-navy-700 text-navy-200' },
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | 'ALL' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await apiService.notifications.list());
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível carregar as notificações.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadCount = items.filter((n) => !n.readAt).length;

  const handleMarkRead = async (item: ApiNotification) => {
    setBusyId(item.id);
    try {
      await apiService.notifications.markRead(item.id);
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
      toast('success', 'Notificação marcada como lida.');
    } catch (err) {
      toast('error', apiErrorMessage(err, 'Não foi possível marcar como lida.'));
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setBusyId('ALL');
    try {
      await apiService.notifications.markAllRead();
      setItems((prev) =>
        prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() })),
      );
      toast('success', 'Todas as notificações marcadas como lidas.');
    } catch (err) {
      toast('error', apiErrorMessage(err, 'Não foi possível marcar todas como lidas.'));
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
            <Bell className="w-5 h-5 text-gold-400" />
            Notificações
          </h1>
          <p className="text-xs text-navy-300 mt-0.5">
            Acompanhe eventos da agência, como novas condolências e tarefas.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={busyId === 'ALL'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 text-xs font-bold transition-all disabled:opacity-60 self-start sm:self-auto"
          >
            {busyId === 'ALL' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCheck className="w-3.5 h-3.5" />
            )}
            Marcar todas como lidas ({unreadCount})
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 animate-spin text-gold-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-10 rounded-2xl bg-navy-900/80 border border-navy-800 text-center space-y-3">
          <BellOff className="w-10 h-10 text-navy-400 mx-auto" />
          <p className="text-sm font-semibold text-white">Sem notificações.</p>
          <p className="text-xs text-navy-300">
            Novos eventos da agência aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => {
            const meta = TYPE_LABELS[item.type] || TYPE_LABELS.SISTEMA;
            const unread = !item.readAt;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border shadow-lg flex items-start justify-between gap-3 transition-colors ${
                  unread
                    ? 'bg-navy-800/70 border-gold-500/30'
                    : 'bg-navy-900/80 border-navy-800'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {unread && <span className="w-2 h-2 rounded-full bg-gold-400 mt-1.5 shrink-0" />}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.cls}`}>
                        {meta.label}
                      </span>
                      <span className="text-xs font-bold text-white">{item.title}</span>
                      <span className="text-[10px] text-navy-400">
                        {new Date(item.sentAt).toLocaleString('pt-PT')}
                      </span>
                    </div>
                    <p className="text-xs text-navy-200 leading-relaxed">{item.message}</p>
                  </div>
                </div>
                {unread && (
                  <button
                    onClick={() => handleMarkRead(item)}
                    disabled={busyId === item.id}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-gold-500/20 text-navy-300 hover:text-gold-300 border border-navy-700 text-xs font-semibold transition-all disabled:opacity-60 shrink-0"
                  >
                    {busyId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Marcar lida
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
