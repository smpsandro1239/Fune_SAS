import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Palette, 
  FileText, 
  Calendar, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  MapPin,
  Heart
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { name: 'Funerais Ativos / Agendados', value: '4', change: '+2 esta semana', icon: Users, color: 'text-blue-400' },
    { name: 'Flyers Gerados este Mês', value: '18', change: 'Ilimitado (Plano PRO)', icon: Palette, color: 'text-gold-400' },
    { name: 'Documentos Arquivados', value: '32', change: '100% em conformidade RGPD', icon: FileText, color: 'text-emerald-400' },
    { name: 'Próximas Cerimónias', value: '2 Hoje', change: 'Velório em curso', icon: Calendar, color: 'text-amber-400' },
  ];

  const recentFunerals = [
    {
      id: '1',
      name: 'LUÍS FILIPE DA SILVA FREITAS',
      age: 27,
      date: '08 de Julho, 17:00h',
      location: 'Igreja Paroquial da Ventosa, Braga',
      cemetery: 'Ventosa, Vieira do Minho',
      status: 'Concluído',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    },
    {
      id: '2',
      name: 'MARIA JOAQUINA ALVES RIBEIRO',
      age: 84,
      date: '14 de Agosto, 11:00h',
      location: 'Basílica dos Congregados, Braga',
      cemetery: 'Cemitério de Monte d’Arcos, Braga',
      status: 'Velório em Curso',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 border border-gold-500/20 shadow-2xl">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Funerária Casa Hortas, Lda (Desde 1890)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Painel de Gestão Funerária <span className="gold-gradient-text">FuneSAS</span>
          </h1>
          <p className="text-sm text-navy-200 leading-relaxed">
            Bem-vindo, Sandro. Digitalização completa de processos funerários, criação instantânea de participações gráficos e gestão documental centralizada.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/flyers"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-gold-500/10 transition-all"
            >
              <Palette className="w-4 h-4" />
              <span>Criar Flyer de Participação</span>
            </Link>

            <Link
              href="/funerals"
              className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-medium text-xs border border-navy-700 flex items-center space-x-2 transition-all"
            >
              <Plus className="w-4 h-4 text-gold-400" />
              <span>Novo Funeral</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800/80 shadow-lg space-y-3 hover:border-gold-500/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-navy-300">{stat.name}</span>
                <div className={`p-2.5 rounded-xl bg-navy-950 border border-navy-800 ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
              <p className="text-[11px] text-navy-400">{stat.change}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Funerals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-gold-400" />
              Serviços Funerários Recentes
            </h2>
            <p className="text-xs text-navy-300">Registo de falecidos e estado das cerimónias</p>
          </div>

          <Link
            href="/funerals"
            className="text-xs font-semibold text-gold-400 hover:text-gold-300 flex items-center space-x-1"
          >
            <span>Ver Todos</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentFunerals.map((funeral) => (
            <div
              key={funeral.id}
              className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 flex gap-4 hover:border-gold-500/30 transition-all shadow-md"
            >
              <div className="w-20 h-24 rounded-xl overflow-hidden border border-gold-500/30 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={funeral.photo} alt={funeral.name} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    funeral.status === 'Concluído' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {funeral.status}
                  </span>
                  <span className="text-xs font-bold text-gold-400">{funeral.age} ANOS</span>
                </div>

                <h3 className="font-bold text-white text-sm truncate uppercase tracking-tight">
                  {funeral.name}
                </h3>

                <div className="space-y-1 text-xs text-navy-300">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-gold-400" />
                    <span>{funeral.date}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-navy-400" />
                    <span className="truncate">{funeral.location}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-3 text-xs">
                  <Link
                    href="/flyers"
                    className="text-gold-400 hover:text-gold-300 font-semibold underline underline-offset-2 flex items-center gap-1 text-[11px]"
                  >
                    Editar Flyer &rarr;
                  </Link>

                  <Link
                    href={`/public/casa-hortas/${funeral.id}`}
                    target="_blank"
                    className="text-navy-300 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    Página Pública
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
