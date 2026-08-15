'use client';

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Cross,
  X,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAgency } from '@/context/AgencyContext';

interface EventItem {
  id: string;
  title: string;
  time: string;
  date: string;
  location: string;
  type: 'WAKE' | 'FUNERAL' | 'BURIAL' | 'MISSA';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
}

export default function AgendaPage() {
  const { currentAgency } = useAgency();

  const [events, setEvents] = useState<EventItem[]>([
    {
      id: '1',
      title: 'Missa de Corpo Presente - Maria Ribeiro',
      time: '11:00 - 12:30',
      date: '14 de Agosto, 2026',
      location: 'Basílica dos Congregados, Braga',
      type: 'FUNERAL',
      status: 'SCHEDULED',
    },
    {
      id: '2',
      title: 'Velório em Capela Ardente - Maria Ribeiro',
      time: '16:00 - 21:00',
      date: '13 de Agosto, 2026',
      location: 'Capela de São Bento, Braga',
      type: 'WAKE',
      status: 'IN_PROGRESS',
    },
    {
      id: '3',
      title: 'Sepultamento em Jazigo Paroquial',
      time: '17:00 - 18:00',
      date: '08 de Julho, 2026',
      location: 'Cemitério de Ventosa, Vieira do Minho',
      type: 'BURIAL',
      status: 'COMPLETED',
    },
  ]);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<'WAKE' | 'FUNERAL' | 'BURIAL' | 'MISSA'>('FUNERAL');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate || !eventLocation.trim()) return;

    const newEvent: EventItem = {
      id: Date.now().toString(),
      title: eventTitle,
      type: eventType,
      date: eventDate,
      time: eventTime || '15:00',
      location: eventLocation,
      status: 'SCHEDULED',
    };

    setEvents([newEvent, ...events]);
    setEventTitle('');
    setEventDate('');
    setEventTime('');
    setEventLocation('');
    setShowScheduleModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gold-400" />
            Agenda & Notificações de Serviços
          </h1>
          <p className="text-xs text-navy-300">
            Agendamento de cerimónias para <span className="text-gold-400 font-semibold">{currentAgency?.name || 'a agência'}</span>.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs shadow-lg transition-all hover:brightness-110"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Serviço</span>
        </button>
      </div>

      {/* Calendar Header Control */}
      <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button className="p-1.5 rounded-lg bg-navy-950 text-navy-300 hover:text-white border border-navy-700">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-base font-bold text-white">Agosto de 2026</h2>
          <button className="p-1.5 rounded-lg bg-navy-950 text-navy-300 hover:text-white border border-navy-700">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs font-medium">
          <span className="px-2.5 py-1 rounded-lg bg-gold-500/20 text-gold-300 border border-gold-500/30 font-bold">
            {events.length} Serviços Agendados
          </span>
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg hover:border-gold-500/30 transition-all"
          >
            <div className="flex items-start space-x-3.5">
              <div className="p-3 rounded-xl bg-navy-950 border border-gold-500/20 text-gold-400 shrink-0">
                {event.type === 'WAKE' ? <Flame className="w-5 h-5" /> : <Cross className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    event.status === 'IN_PROGRESS'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : event.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {event.status === 'IN_PROGRESS' ? 'Em Curso' : event.status === 'COMPLETED' ? 'Concluído' : 'Agendado'}
                  </span>
                  <span className="text-xs font-semibold text-gold-400">{event.date}</span>
                </div>
                <h3 className="font-bold text-white text-sm">{event.title}</h3>
                <div className="flex items-center space-x-4 text-xs text-navy-300 pt-0.5">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-navy-400" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-navy-400" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>

            <button className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs text-navy-200 border border-navy-700 self-start md:self-center">
              Detalhes & Notificações
            </button>
          </div>
        ))}
      </div>

      {/* Modal: Agendar Serviço */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-gold-400" />
                Agendar Novo Serviço Funerário
              </h2>
              <button onClick={() => setShowScheduleModal(false)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Título do Serviço / Cerimónia *</label>
                <input
                  type="text"
                  placeholder="Ex: Missa de 7º Dia - Luís Freitas"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-navy-200 mb-1 font-semibold">Tipo de Serviço</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none"
                  >
                    <option value="FUNERAL">Funeral & Missa</option>
                    <option value="WAKE">Velório</option>
                    <option value="BURIAL">Sepultamento / Cremação</option>
                    <option value="MISSA">Missa de Sufrágio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-navy-200 mb-1 font-semibold">Hora de Início</label>
                  <input
                    type="text"
                    placeholder="Ex: 15:30 - 17:00"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Data do Serviço *</label>
                <input
                  type="text"
                  placeholder="Ex: 20 de Agosto, 2026"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Localização / Igreja / Cemitério *</label>
                <input
                  type="text"
                  placeholder="Ex: Igreja Paroquial de Cabreiros, Braga"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-navy-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold shadow"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
