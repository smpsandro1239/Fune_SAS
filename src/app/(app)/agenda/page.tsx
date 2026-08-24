'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Flame,
  Cross,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  Church,
  FileText,
} from 'lucide-react';
import {
  ApiFuneral,
  FuneralStatus,
  ServiceType,
  apiErrorMessage,
  apiService,
} from '@/lib/api';
import { useAgency } from '@/context/AgencyContext';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const SERVICE_LABELS: Record<ServiceType, string> = {
  CERIMONIA: 'Cerimónia',
  VELORIO: 'Velório',
  CREMACAO: 'Cremação',
  TRANSPORTE: 'Transporte',
  ACOLHIMENTO: 'Acolhimento',
  OUTRO: 'Outro',
};

const STATUS_LABELS: Record<FuneralStatus, string> = {
  SCHEDULED: 'Agendado',
  IN_PROGRESS: 'Em Curso',
  COMPLETED: 'Concluído',
};

const STATUS_STYLES: Record<FuneralStatus, string> = {
  SCHEDULED: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  IN_PROGRESS: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  COMPLETED: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
};

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function sameDay(a: Date, b: Date): boolean {
  return dayKey(a) === dayKey(b);
}

export default function AgendaPage() {
  const { currentAgency } = useAgency();
  const [funerals, setFunerals] = useState<ApiFuneral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<ApiFuneral | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiService.funerals
      .list()
      .then((list) => {
        if (!cancelled) setFunerals(list);
      })
      .catch((err) => {
        if (!cancelled) setError(apiErrorMessage(err, 'Não foi possível carregar a agenda.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byDay = useMemo(() => {
    const map = new Map<string, ApiFuneral[]>();
    for (const f of funerals) {
      const d = f.funeralDate ? new Date(f.funeralDate) : null;
      if (!d) continue;
      const key = dayKey(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(f);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.funeralTime || '').localeCompare(b.funeralTime || ''));
    }
    return map;
  }, [funerals]);

  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const offset = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const monthLabel = cursor.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
  const today = new Date();
  const upcoming = useMemo(
    () =>
      funerals
        .filter((f) => f.funeralDate && new Date(f.funeralDate) >= today && f.status !== 'COMPLETED')
        .sort((a, b) => new Date(a.funeralDate).getTime() - new Date(b.funeralDate).getTime())
        .slice(0, 5),
    [funerals, today],
  );

  const moveMonth = (delta: number) => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const goToday = () => setCursor(new Date());

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gold-400" />
            Agenda de Serviços
          </h1>
          <p className="text-xs text-navy-300">
            Calendário de cerimónias de{' '}
            <span className="text-gold-400 font-semibold">{currentAgency?.name || 'a agência'}</span>.
          </p>
        </div>

        <Link
          href="/funerals"
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs shadow-lg transition-all hover:brightness-110"
        >
          <Cross className="w-4 h-4" />
          <span>Gerir Funerais</span>
        </Link>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendário */}
        <div className="lg:col-span-9 p-4 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
            <div className="flex items-center space-x-1.5">
              <button onClick={() => moveMonth(-1)} className="p-1.5 rounded-lg bg-navy-950 text-navy-300 hover:text-white border border-navy-700">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base font-bold text-white capitalize min-w-[110px] text-center">{monthLabel}</h2>
              <button onClick={() => moveMonth(1)} className="p-1.5 rounded-lg bg-navy-950 text-navy-300 hover:text-white border border-navy-700">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={goToday}
                className="px-3 py-1.5 rounded-lg bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/30 text-gold-300 text-xs font-bold transition-all"
              >
                Hoje
              </button>
              <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-navy-950 text-xs text-navy-300 border border-navy-700">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>{byDay.size} dias com serviços</span>
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-gold-400" />
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1 px-1 pb-1">
              <div className="grid grid-cols-7 gap-1.5 min-w-[520px]">
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="text-center text-[10px] font-bold text-navy-400 uppercase tracking-wider py-1">
                  {wd}
                </div>
              ))}

              {grid.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="min-h-[92px] rounded-xl bg-navy-950/40" />;
                }
                const key = dayKey(date);
                const dayEvents = byDay.get(key) || [];
                const isToday = sameDay(date, today);
                const isFuture = date >= today;

                return (
                  <div
                    key={key}
                    className={`min-h-[92px] rounded-xl p-1.5 border transition-colors ${
                      isToday
                        ? 'bg-gold-500/10 border-gold-500/40'
                        : isFuture
                        ? 'bg-navy-950 border-navy-800 hover:border-gold-500/30'
                        : 'bg-navy-950/70 border-navy-800/60 opacity-70'
                    }`}
                  >
                    <div className={`text-[11px] font-bold mb-1 ${isToday ? 'text-gold-300' : 'text-navy-300'}`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setSelected(f)}
                          className={`w-full text-left px-1.5 py-1 rounded-md text-[10px] font-semibold leading-tight transition-transform hover:scale-[1.03] ${STATUS_STYLES[f.status]}`}
                          title={`${f.deceased.fullName}${f.funeralTime ? ` — ${f.funeralTime}` : ''}`}
                        >
                          <span className="block truncate uppercase">{f.deceased.fullName}</span>
                          {f.funeralTime && <span className="opacity-80">{f.funeralTime}</span>}
                        </button>
                      ))}
                      {dayEvents.length > 3 && (
                        <button
                          onClick={() => {
                            const d = dayEvents[0];
                            if (d) setSelected(d);
                          }}
                          className="w-full text-left px-1.5 py-0.5 rounded text-[9px] text-navy-300 hover:text-gold-300"
                        >
                          +{dayEvents.length - 3} mais
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          )}
        </div>

        {/* Próximos serviços */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold-400" />
              Próximas Cerimónias
            </h3>
            {upcoming.length === 0 ? (
              <p className="text-xs text-navy-400">Sem cerimónias agendadas.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelected(f)}
                    className="w-full text-left p-2.5 rounded-xl bg-navy-950 border border-navy-800 hover:border-gold-500/30 transition-all"
                  >
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold mb-1 ${STATUS_STYLES[f.status]}`}>
                      {STATUS_LABELS[f.status]}
                    </span>
                    <p className="text-[11px] font-bold text-white uppercase truncate">{f.deceased.fullName}</p>
                    <p className="text-[10px] text-navy-300 mt-0.5">
                      {new Date(f.funeralDate).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                      {f.funeralTime ? `, ${f.funeralTime}` : ''}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-2 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Church className="w-4 h-4 text-gold-400" />
              Legenda
            </h3>
            <div className="space-y-1.5 text-[11px] text-navy-300">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Agendado</span>
                Cerimónia marcada
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Em Curso</span>
                Serviço a decorrer
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Concluído</span>
                Serviço realizado
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: detalhe do serviço */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {selected.serviceType === 'VELORIO' ? (
                  <Flame className="w-4 h-4 text-gold-400" />
                ) : (
                  <Cross className="w-4 h-4 text-gold-400" />
                )}
                {selected.deceased.fullName}
              </h2>
              <button onClick={() => setSelected(null)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_STYLES[selected.status]}`}>
                  {STATUS_LABELS[selected.status]}
                </span>
                <span className="text-navy-300">{SERVICE_LABELS[selected.serviceType]}</span>
              </div>

              <div className="space-y-2">
                {selected.funeralDate && (
                  <div className="flex items-center space-x-2 text-navy-200">
                    <Clock className="w-4 h-4 text-gold-400 shrink-0" />
                    <span>
                      {new Date(selected.funeralDate).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      {selected.funeralTime ? `, ${selected.funeralTime}` : ''}
                    </span>
                  </div>
                )}
                {selected.locationParish && (
                  <div className="flex items-center space-x-2 text-navy-200">
                    <Church className="w-4 h-4 text-gold-400 shrink-0" />
                    <span>{selected.locationParish}</span>
                  </div>
                )}
                {selected.cemeteryLocation && (
                  <div className="flex items-center space-x-2 text-navy-200">
                    <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
                    <span>{selected.cemeteryLocation}</span>
                  </div>
                )}
                {selected.wakeLocation && (
                  <div className="flex items-center space-x-2 text-navy-200">
                    <Flame className="w-4 h-4 text-gold-400 shrink-0" />
                    <span>
                      Velório: {selected.wakeLocation}
                      {selected.wakeTime ? ` (${selected.wakeTime})` : ''}
                    </span>
                  </div>
                )}
                {selected.deceased.age != null && (
                  <div className="flex items-center space-x-2 text-navy-200">
                    <span className="w-4 h-4 shrink-0" />
                    <span>{selected.deceased.age} anos</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
              <Link
                href={`/flyers`}
                className="px-4 py-2 rounded-xl bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/30 text-gold-300 text-xs font-bold flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                Gerar Flyer
              </Link>
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-xl bg-navy-800 text-navy-300 font-semibold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
