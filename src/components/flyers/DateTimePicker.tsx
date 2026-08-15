'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, Check, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { formatPTDate, parseDateValue } from '@/lib/date-utils';

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const TIME_OPTIONS: string[] = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4);
  const m = (i % 4) * 15;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

interface DateTimePickerProps {
  id: string;
  label: string;
  date?: string | null;
  time?: string | null;
  onDateChange: (isoDate: string) => void;
  onTimeChange: (time: string) => void;
  minDate?: Date;
}

type OpenPanel = 'date' | 'time' | null;

const PANEL_W = 288;
const PANEL_H_ESTIMATE = { date: 372, time: 300 };

export default function DateTimePicker({
  id,
  label,
  date,
  time,
  onDateChange,
  onTimeChange,
  minDate,
}: DateTimePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dateBtnRef = useRef<HTMLButtonElement>(null);
  const timeBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<OpenPanel>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const base = parseDateValue(date) || new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const selectedDate = useMemo(() => parseDateValue(date), [date]);
  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setViewMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  const close = () => {
    setOpen(null);
    setPos(null);
  };

  const togglePanel = (panel: Exclude<OpenPanel, null>) => {
    if (open === panel) {
      close();
      return;
    }
    const trigger = panel === 'date' ? dateBtnRef.current : timeBtnRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const estimate = PANEL_H_ESTIMATE[panel];
    let left = Math.min(Math.max(8, rect.left), window.innerWidth - PANEL_W - 8);
    let top = rect.bottom + 8;
    if (top + estimate > window.innerHeight - 8) {
      top = Math.max(8, rect.top - estimate - 8);
    }
    setPos({ left, top });
    setOpen(panel);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onScroll = () => close();
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  const calendarCells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [viewMonth]);

  const minDay = useMemo(
    () => (minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : null),
    [minDate]
  );

  const isDisabled = (day: Date) => (minDay ? day < minDay : false);
  const isSelectedDay = (day: Date) =>
    !!selectedDate &&
    day.getFullYear() === selectedDate.getFullYear() &&
    day.getMonth() === selectedDate.getMonth() &&
    day.getDate() === selectedDate.getDate();

  const goMonth = (delta: number) => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const handlePickDay = (day: Date) => {
    onDateChange(day.toISOString());
    close();
  };

  const handleToday = () => {
    if (minDay && today < minDay) return;
    onDateChange(today.toISOString());
    close();
  };

  const dateLabel = selectedDate
    ? selectedDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  return (
    <div ref={rootRef} className="space-y-1.5">
      <label id={`${id}-label`} className="block text-xs font-semibold text-navy-200">
        {label}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <button
            ref={dateBtnRef}
            type="button"
            id={id}
            aria-labelledby={`${id}-label`}
            aria-haspopup="dialog"
            aria-expanded={open === 'date'}
            onClick={() => togglePanel('date')}
            className="w-full flex items-center gap-2 pl-3 pr-2 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs text-left focus:border-gold-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            <span className={`flex-1 truncate ${dateLabel ? 'font-semibold' : 'text-navy-400'}`}>
              {dateLabel || 'Escolher data'}
            </span>
          </button>
          {selectedDate && <p className="text-[9.5px] text-navy-400 mt-1 leading-snug">{formatPTDate(selectedDate)}</p>}
        </div>

        <div>
          <button
            ref={timeBtnRef}
            type="button"
            id={`${id}-time`}
            aria-labelledby={`${id}-label`}
            aria-haspopup="dialog"
            aria-expanded={open === 'time'}
            onClick={() => togglePanel('time')}
            className="w-full flex items-center gap-2 pl-3 pr-2 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs text-left focus:border-gold-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-gold-400 shrink-0" />
            <span className={`flex-1 truncate ${time ? 'font-semibold' : 'text-navy-400'}`}>
              {time || 'Escolher hora'}
            </span>
          </button>
        </div>
      </div>

      {open && pos && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={open === 'date' ? 'Escolher data' : 'Escolher hora'}
          className="fixed z-[60] w-72 max-w-[calc(100vw-16px)] rounded-2xl bg-[#0b1a33] border border-gold-500/25 shadow-2xl overflow-hidden"
          style={{ left: pos.left, top: pos.top }}
        >
          {open === 'date' ? (
            <div>
              <div className="flex items-center justify-between px-3 pt-3 pb-2">
                <button
                  type="button"
                  onClick={() => goMonth(-1)}
                  aria-label="Mês anterior"
                  className="w-7 h-7 rounded-lg hover:bg-navy-800 flex items-center justify-center text-navy-300 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <p className="text-xs font-bold text-gold-300 capitalize">
                  {viewMonth.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
                </p>
                <button
                  type="button"
                  onClick={() => goMonth(1)}
                  aria-label="Mês seguinte"
                  className="w-7 h-7 rounded-lg hover:bg-navy-800 flex items-center justify-center text-navy-300 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 px-3 pb-1">
                {WEEKDAY_LABELS.map((w) => (
                  <span key={w} className="text-[9px] font-bold uppercase text-navy-400 text-center py-1">
                    {w}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 px-3 pb-3">
                {calendarCells.map((day, i) =>
                  day ? (
                    <button
                      key={i}
                      type="button"
                      disabled={isDisabled(day)}
                      onClick={() => handlePickDay(day)}
                      className={`relative h-8 rounded-lg text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                        isDisabled(day)
                          ? 'text-navy-600 cursor-not-allowed'
                          : isSelectedDay(day)
                            ? 'bg-gold-500 text-navy-950 font-bold'
                            : 'text-slate-200 hover:bg-gold-500/20 hover:text-white'
                      }`}
                    >
                      {day.getDate()}
                      {day.getTime() === today.getTime() && !isSelectedDay(day) && (
                        <span className="absolute inset-x-1 bottom-0.5 h-0.5 rounded bg-gold-400"></span>
                      )}
                    </button>
                  ) : (
                    <span key={i}></span>
                  )
                )}
              </div>

              <div className="flex items-center justify-between border-t border-navy-800 px-3 py-2">
                <button
                  type="button"
                  onClick={handleToday}
                  disabled={!!minDay && today < minDay}
                  className="text-[11px] font-semibold text-gold-400 hover:text-gold-300 transition-colors disabled:text-navy-600 disabled:cursor-not-allowed"
                >
                  Hoje
                </button>
                <span className="text-[10px] text-navy-500">Seg a Dom</span>
              </div>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto p-3 grid grid-cols-4 gap-1.5">
              {TIME_OPTIONS.map((t) => {
                const selected = time === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      onTimeChange(t);
                      close();
                    }}
                    className={`relative rounded-lg py-1.5 text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                      selected
                        ? 'bg-gold-500 text-navy-950 font-bold'
                        : 'text-slate-200 hover:bg-gold-500/20 hover:text-white'
                    }`}
                  >
                    {t}
                    {selected && <Check className="w-3 h-3 absolute top-1 right-1" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
