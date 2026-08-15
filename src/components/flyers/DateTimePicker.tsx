'use client';

import React, { useMemo } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { pt } from 'date-fns/locale';
import { Calendar, Clock } from 'lucide-react';
import { formatPTDate } from '@/lib/date-utils';

registerLocale('pt', pt);

interface DateTimePickerProps {
  id: string;
  label: string;
  date?: string | null;
  time?: string | null;
  onDateChange: (isoDate: string) => void;
  onTimeChange: (time: string) => void;
  minDate?: Date;
}

function parseTimeToDate(time: string, base: Date): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(base);
  if (!isNaN(h) && !isNaN(m)) d.setHours(h, m, 0, 0);
  return d;
}

export default function DateTimePicker({
  id,
  label,
  date,
  time,
  onDateChange,
  onTimeChange,
  minDate,
}: DateTimePickerProps) {
  const selectedDate = useMemo(() => {
    if (!date) return null;
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  }, [date]);

  const selectedTime = useMemo(() => {
    if (!time) return null;
    const [h, m] = time.split(':').map(Number);
    const d = new Date(2000, 0, 1);
    if (!isNaN(h)) d.setHours(h, isNaN(m) ? 0 : m, 0, 0);
    return d;
  }, [time]);

  const dateValue = selectedDate || new Date();

  return (
    <div className="space-y-1.5">
      <label id={`${id}-label`} className="block text-xs font-semibold text-navy-200">
        {label}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-gold-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <DatePicker
              id={id}
              locale="pt"
              selected={dateValue}
              onChange={(d: Date | null) => d && onDateChange(d.toISOString())}
              dateFormat="dd/MM/yyyy"
              minDate={minDate}
              popperClassName="fs-datepicker-popper"
              popperPlacement="bottom-start"
              aria-labelledby={`${id}-label`}
              aria-label="Escolher data"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none cursor-pointer"
              showPopperArrow={false}
            />
          </div>
          {selectedDate && (
            <p className="text-[9.5px] text-navy-400 mt-1 leading-snug">{formatPTDate(selectedDate)}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <Clock className="w-3.5 h-3.5 text-gold-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <DatePicker
              id={`${id}-time`}
              selected={selectedTime}
              onChange={(d: Date | null) => d && onTimeChange(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Hora"
              locale="pt"
              dateFormat="HH:mm"
              aria-labelledby={`${id}-label`}
              aria-label="Escolher hora"
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none cursor-pointer"
              showPopperArrow={false}
              popperClassName="fs-datepicker-popper"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
