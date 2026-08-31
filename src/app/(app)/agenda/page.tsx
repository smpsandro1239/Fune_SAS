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
  Plus,
  Trash2,
  Pencil,
  Save,
} from 'lucide-react';
import {
  ApiFuneral,
  ApiAgendaItem,
  FuneralStatus,
  ServiceType,
  AGENDA_COLORS,
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

const AGENDA_COLOR_STYLES: Record<string, string> = {
  gold: 'bg-gold-500/20 border border-gold-500/40 text-gold-200',
  blue: 'bg-blue-500/20 border border-blue-500/40 text-blue-200',
  green: 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200',
  purple: 'bg-purple-500/20 border border-purple-500/40 text-purple-200',
  red: 'bg-red-500/20 border border-red-500/40 text-red-200',
  slate: 'bg-slate-500/20 border border-slate-500/40 text-slate-200',
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
  const [agendaItems, setAgendaItems] = useState<ApiAgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState<ApiFuneral | null>(null);

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [editingItem, setEditingItem] = useState<ApiAgendaItem | null>(null);
  const [agendaSaving, setAgendaSaving] = useState(false);
  const [agendaError, setAgendaError] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState<string>('gold');

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiService.funerals.list(), apiService.agenda.list()])
      .then(([funeralList, agendaList]) => {
        if (!cancelled) {
          setFunerals(funeralList);
          setAgendaItems(agendaList);
        }
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

  const itemsByDay = useMemo(() => {
    const map = new Map<string, ApiAgendaItem[]>();
    for (const item of agendaItems) {
      const key = dayKey(new Date(item.date));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    }
    return map;
  }, [agendaItems]);

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
  const today = useMemo(() => new Date(), []);
  const upcoming = useMemo(
    () =>
      funerals
        .filter((f) => f.funeralDate && new Date(f.funeralDate) >= today && f.status !== 'COMPLETED')
        .sort((a, b) => new Date(a.funeralDate).getTime() - new Date(b.funeralDate).getTime())
        .slice(0, 5),
    [funerals, today],
  );

  const daysWithContent = useMemo(() => {
    const keys = new Set<string>();
    byDay.forEach((_, k) => keys.add(k));
    itemsByDay.forEach((_, k) => keys.add(k));
    return keys;
  }, [byDay, itemsByDay]);

  const moveMonth = (delta: number) => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const goToday = () => setCursor(new Date());

  const openDay = (date: Date) => {
    setSelectedDay(date);
    setEditingItem(null);
    setFormTitle('');
    setFormTime('');
    setFormDescription('');
    setFormColor('gold');
    setAgendaError('');
  };

  const saveAgendaItem = async () => {
    if (!selectedDay) return;
    const title = formTitle.trim();
    if (!title) {
      setAgendaError('Indique um título para o item.');
      return;
    }
    setAgendaSaving(true);
    setAgendaError('');
    const payload = {
      date: dayKey(selectedDay),
      title,
      time: formTime.trim() || undefined,
      description: formDescription.trim() || undefined,
      color: formColor,
    };
    try {
      if (editingItem) {
        const updated = await apiService.agenda.update(editingItem.id, payload);
        setAgendaItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
      } else {
        const created = await apiService.agenda.create(payload);
        setAgendaItems((prev) => [...prev, created]);
      }
      setEditingItem(null);
      setFormTitle('');
      setFormTime('');
      setFormDescription('');
      setFormColor('gold');
    } catch (err) {
      setAgendaError(apiErrorMessage(err, 'Não foi possível guardar o item.'));
    } finally {
      setAgendaSaving(false);
    }
  };

  const startEdit = (item: ApiAgendaItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormTime(item.time || '');
    setFormDescription(item.description || '');
    setFormColor(item.color || 'gold');
    setAgendaError('');
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormTime('');
    setFormDescription('');
    setFormColor('gold');
    setAgendaError('');
  };

  const deleteAgendaItem = async (item: ApiAgendaItem) => {
    if (!window.confirm(`Eliminar "${item.title}" da agenda?`)) return;
    setAgendaSaving(true);
    try {
      await apiService.agenda.remove(item.id);
      setAgendaItems((prev) => prev.filter((it) => it.id !== item.id));
      if (editingItem?.id === item.id) cancelEdit();
    } catch (err) {
      setAgendaError(apiErrorMessage(err, 'Não foi possível eliminar o item.'));
    } finally {
      setAgendaSaving(false);
    }
  };

  const selectedDayFunerals = selectedDay ? byDay.get(dayKey(selectedDay)) || [] : [];
  const selectedDayItems = selectedDay ? itemsByDay.get(dayKey(selectedDay)) || [] : [];

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
                onClick={() => {
                  goToday();
                  openDay(new Date());
                }}
                className="px-3 py-1.5 rounded-lg bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/30 text-gold-300 text-xs font-bold transition-all"
                title="Ver o agendado hoje"
              >
                Hoje
              </button>
              <button
                onClick={() => openDay(new Date())}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-navy-950 text-xs text-navy-300 border border-navy-700 hover:border-gold-500/40 hover:text-gold-300 transition-colors"
                title="Ver o que está agendado"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>{daysWithContent.size} dias com serviços</span>
              </button>
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
                const dayAgenda = itemsByDay.get(key) || [];
                const isToday = sameDay(date, today);
                const isFuture = date >= today;
                const hasContent = dayEvents.length + dayAgenda.length > 0;

                return (
                  <div
                    key={key}
                    onClick={() => openDay(date)}
                    className={`min-h-[92px] rounded-xl p-1.5 border transition-colors cursor-pointer group ${
                      isToday
                        ? 'bg-gold-500/10 border-gold-500/40'
                        : isFuture
                        ? 'bg-navy-950 border-navy-800 hover:border-gold-500/30'
                        : 'bg-navy-950/70 border-navy-800/60 opacity-70'
                    }`}
                  >
                    <div
                      className={`text-[11px] font-bold mb-1 flex items-center justify-between ${
                        isToday ? 'text-gold-300' : 'text-navy-300'
                      }`}
                    >
                      <span>{date.getDate()}</span>
                      <Plus
                        className="w-3 h-3 text-navy-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Adicionar item"
                      />
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((f) => (
                        <button
                          key={f.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(f);
                          }}
                          className={`w-full text-left px-1.5 py-1 rounded-md text-[10px] font-semibold leading-tight transition-transform hover:scale-[1.03] ${STATUS_STYLES[f.status]}`}
                          title={`${f.deceased.fullName}${f.funeralTime ? ` — ${f.funeralTime}` : ''}`}
                        >
                          <span className="block truncate uppercase">{f.deceased.fullName}</span>
                          {f.funeralTime && <span className="opacity-80">{f.funeralTime}</span>}
                        </button>
                      ))}
                      {dayAgenda.slice(0, 1).map((item) => (
                        <button
                          key={item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openDay(date);
                          }}
                          className={`w-full text-left px-1.5 py-1 rounded-md text-[10px] font-semibold leading-tight truncate ${AGENDA_COLOR_STYLES[item.color] || AGENDA_COLOR_STYLES.gold}`}
                          title={item.title}
                        >
                          {item.time ? `${item.time} ` : ''}{item.title}
                        </button>
                      ))}
                      {dayEvents.length > 2 || dayAgenda.length > 1 ? (
                        <div className="w-full text-left px-1.5 py-0.5 rounded text-[9px] text-navy-300">
                          +{(dayEvents.length - 2 > 0 ? dayEvents.length - 2 : 0) + (dayAgenda.length - 1 > 0 ? dayAgenda.length - 1 : 0)} mais
                        </div>
                      ) : null}
                      {!hasContent && (
                        <div className="text-[9px] text-navy-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          Clique para adicionar
                        </div>
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
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-gold-500/20 text-gold-300 border border-gold-500/30">Item</span>
                Tarefa / nota adicionada
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: detalhe do serviço */}
      {selected && !selectedDay && (
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

      {/* Modal: vista do dia */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95 my-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gold-400" />
                {selectedDay.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={() => setSelectedDay(null)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {agendaError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{agendaError}</span>
              </div>
            )}

            {/* Serviços do dia */}
            <div>
              <h3 className="text-xs font-bold text-navy-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Cross className="w-4 h-4 text-gold-400" />
                Serviços ({selectedDayFunerals.length})
              </h3>
              {selectedDayFunerals.length === 0 ? (
                <p className="text-xs text-navy-400">Sem serviços agendados neste dia.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayFunerals.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setSelected(f);
                        setSelectedDay(null);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-navy-950 border border-navy-800 hover:border-gold-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-bold text-white uppercase truncate">{f.deceased.fullName}</p>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${STATUS_STYLES[f.status]}`}>
                          {STATUS_LABELS[f.status]}
                        </span>
                      </div>
                      <p className="text-[10px] text-navy-300 mt-0.5">
                        {f.funeralTime ? `${f.funeralTime} · ` : ''}
                        {SERVICE_LABELS[f.serviceType]}
                        {f.locationParish ? ` · ${f.locationParish}` : ''}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Itens adicionados */}
            <div>
              <h3 className="text-xs font-bold text-navy-200 uppercase tracking-wider mb-2">Itens adicionados ({selectedDayItems.length})</h3>
              {selectedDayItems.length === 0 ? (
                <p className="text-xs text-navy-400">Sem itens adicionados. Registe uma tarefa ou nota abaixo.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl ${AGENDA_COLOR_STYLES[item.color] || AGENDA_COLOR_STYLES.gold}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-bold uppercase truncate">
                          {item.time ? `${item.time} — ` : ''}{item.title}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1.5 rounded-lg hover:bg-navy-900/60 transition-colors"
                            aria-label="Editar item"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteAgendaItem(item)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                            aria-label="Eliminar item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {item.description && <p className="text-[10px] opacity-80 mt-1">{item.description}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulário adicionar/editar */}
            <div className="pt-3 border-t border-navy-800 space-y-3">
              <h3 className="text-xs font-bold text-navy-200 uppercase tracking-wider">
                {editingItem ? 'Editar item' : 'Adicionar item'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-navy-300 mb-1">Título *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Reunião com a família"
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-semibold text-navy-300 mb-1">Hora (opcional)</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-navy-300 mb-1">Descrição (opcional)</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Ex: Entregar documentação e discutir o programa."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-navy-300 mb-1.5">Cor</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {AGENDA_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform ${AGENDA_COLOR_STYLES[color].split(' ')[0]} ${
                        formColor === color ? 'ring-2 ring-gold-400 ring-offset-2 ring-offset-navy-900 scale-110' : 'hover:scale-110'
                      }`}
                      aria-label={`Cor ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                {editingItem && (
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 rounded-xl bg-navy-800 text-navy-300 font-semibold text-xs"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  onClick={saveAgendaItem}
                  disabled={agendaSaving}
                  className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs shadow-lg transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {agendaSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingItem ? 'Guardar alterações' : 'Adicionar item'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
