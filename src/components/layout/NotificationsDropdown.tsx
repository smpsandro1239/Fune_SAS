'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react';
import { ApiNotification, apiService } from '@/lib/api';

const TYPE_LABELS: Record<string, string> = {
  EMAIL: 'Email',
  SMS: 'SMS',
  TAREFA: 'Tarefa',
  LEMBRETE: 'Lembrete',
  SISTEMA: 'Sistema',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Agora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiService.notifications.list();
      setNotifications(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await apiService.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
    } catch {
      // silently fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiService.notifications.markAllRead();
      setNotifications((prev) =>
        prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() })),
      );
    } catch {
      // silently fail
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white border border-navy-700 transition-all"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-navy-800">
              <h3 className="text-xs font-bold text-white">Notificações</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-gold-400 hover:text-gold-300 font-semibold flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-6 flex justify-center">
                  <Loader2 className="w-5 h-5 text-navy-400 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-navy-400">Sem notificações.</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-navy-800 last:border-0 transition-colors ${
                      !n.readAt ? 'bg-navy-800/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {!n.readAt && <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0" />}
                          <span className="text-[10px] font-bold text-gold-300">{TYPE_LABELS[n.type] || n.type}</span>
                        </div>
                        <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                        <p className="text-[11px] text-navy-300 truncate">{n.message}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-navy-400">{timeAgo(n.sentAt)}</span>
                        {!n.readAt && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="p-1 rounded text-navy-400 hover:text-gold-400"
                            title="Marcar como lida"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
