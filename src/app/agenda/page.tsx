'use client';

import React from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Cross
} from 'lucide-react';

export default function AgendaPage() {
  const events = [
    {
      id: '1',
      title: 'Missa de Corpos Presentes - Maria Ribeiro',
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
  ];

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
            Calendário de velórios, missas de corpo presente e cremações/sepultamentos.
          </p>
        </div>

        <button className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs shadow-lg transition-all hover:brightness-110">
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
          <span className="px-2.5 py-1 rounded-lg bg-gold-500/20 text-gold-300 border border-gold-500/30">Hoje</span>
          <span className="px-2.5 py-1 rounded-lg bg-navy-800 text-navy-300">Semana</span>
          <span className="px-2.5 py-1 rounded-lg bg-navy-800 text-navy-300">Mês</span>
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
                    event.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {event.status === 'IN_PROGRESS' ? 'Em Curso' : 'Agendado'}
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
    </div>
  );
}
