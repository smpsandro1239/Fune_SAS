'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  FileText, 
  Palette, 
  CheckCircle2, 
  Clock,
  Building2,
  Filter
} from 'lucide-react';

export default function FuneralsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SCHEDULED' | 'COMPLETED'>('ALL');
  const [showModal, setShowModal] = useState(false);

  const funeralsList = [
    {
      id: '1',
      name: 'LUÍS FILIPE DA SILVA FREITAS',
      age: 27,
      dateOfDeath: '2026-07-06',
      funeralDate: '08 de Julho de 2026, 17:00h',
      parish: 'Igreja Paroquial da Ventosa, Braga',
      cemetery: 'Ventosa, Vieira do Minho',
      wake: 'Igreja Paroquial da Ventosa (15:30h)',
      hospital: 'Hospital de Braga',
      status: 'COMPLETED',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    },
    {
      id: '2',
      name: 'MARIA JOAQUINA ALVES RIBEIRO',
      age: 84,
      dateOfDeath: '2026-08-10',
      funeralDate: '14 de Agosto de 2026, 11:00h',
      parish: 'Basílica dos Congregados, Braga',
      cemetery: 'Cemitério de Monte d’Arcos, Braga',
      wake: 'Capela de São Bento, Braga (16:00h)',
      hospital: 'Residência Particular, Braga',
      status: 'SCHEDULED',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    },
    {
      id: '3',
      name: 'ANTÓNIO JOSE GONÇALVES PEREIRA',
      age: 72,
      dateOfDeath: '2026-08-01',
      funeralDate: '03 de Agosto de 2026, 15:00h',
      parish: 'Igreja de Santa Cruz, Braga',
      cemetery: 'Cemitério Paroquial de Cabreiros',
      wake: 'Capela Mortuária de Cabreiros',
      hospital: 'Hospital de Guimarães',
      status: 'COMPLETED',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    },
  ];

  const filtered = funeralsList.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.parish.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-gold-400" />
            Gestão de Funerais & Falecidos
          </h1>
          <p className="text-xs text-navy-300">
            Registo centralizado de processos funerários, velórios e informações da agência.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs shadow-lg shadow-gold-500/10 transition-all hover:brightness-110"
        >
          <Plus className="w-4 h-4" />
          <span>Registar Novo Funeral</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-navy-900/80 border border-navy-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar por nome do falecido ou freguesia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-navy-400 hidden sm:block" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
          >
            <option value="ALL">Todos os Estados</option>
            <option value="SCHEDULED">Em Curso / Agendado</option>
            <option value="COMPLETED">Concluídos</option>
          </select>
        </div>
      </div>

      {/* Funerals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((funeral) => (
          <div
            key={funeral.id}
            className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-4 hover:border-gold-500/30 transition-all shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-20 rounded-xl overflow-hidden border border-gold-500/30 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={funeral.photo} alt={funeral.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold inline-block ${
                    funeral.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {funeral.status === 'COMPLETED' ? 'Concluído' : 'Agendado'}
                  </span>
                  <h3 className="font-bold text-white text-sm tracking-tight truncate uppercase">
                    {funeral.name}
                  </h3>
                  <p className="text-xs text-gold-400 font-semibold">{funeral.age} ANOS</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-navy-300 pt-2 border-t border-navy-800">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                  <span className="truncate">{funeral.funeralDate}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                  <span className="truncate">{funeral.parish}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                  <span className="truncate">Velório: {funeral.wake}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-navy-800 flex items-center justify-between">
              <Link
                href="/flyers"
                className="px-3 py-1.5 rounded-lg bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/30 text-gold-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Gerar Flyer</span>
              </Link>

              <Link
                href={`/public/casa-hortas/${funeral.id}`}
                target="_blank"
                className="text-xs text-navy-300 hover:text-white underline underline-offset-2"
              >
                Página Pública
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Add Modal Simulation */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-gold-400" />
                Registar Novo Funeral
              </h2>
              <button onClick={() => setShowModal(false)} className="text-navy-400 hover:text-white text-xs">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-navy-200 mb-1 font-medium">Nome do Falecido</label>
                <input type="text" placeholder="Ex: MANUEL ANTONIO DA SILVA" className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white focus:outline-none focus:border-gold-400" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-navy-200 mb-1 font-medium">Idade</label>
                  <input type="number" placeholder="78" className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white focus:outline-none focus:border-gold-400" />
                </div>
                <div>
                  <label className="block text-navy-200 mb-1 font-medium">Data do Funeral</label>
                  <input type="date" className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white focus:outline-none focus:border-gold-400" />
                </div>
              </div>

              <div>
                <label className="block text-navy-200 mb-1 font-medium">Igreja Paroquial / Local</label>
                <input type="text" placeholder="Igreja de São Victor, Braga" className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white focus:outline-none focus:border-gold-400" />
              </div>
            </div>

            <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-navy-800 text-navy-300 text-xs font-semibold">Cancelar</button>
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-gold-500 text-navy-950 text-xs font-bold shadow">Guardar e Abrir Editor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
