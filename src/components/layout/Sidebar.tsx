'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Palette, 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings, 
  ExternalLink
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Visão Geral', href: '/', icon: LayoutDashboard },
    { name: 'Funerais & Falecidos', href: '/funerals', icon: Users },
    { name: 'Editor de Flyers', href: '/flyers', icon: Palette, badge: 'Interativo' },
    { name: 'Gestão Documental', href: '/documents', icon: FileText },
    { name: 'Agenda & Serviços', href: '/agenda', icon: Calendar },
    { name: 'Relatórios & Métricas', href: '/analytics', icon: BarChart3 },
    { name: 'Configurações Agência', href: '/agencies', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-navy-950/80 border-r border-navy-800 flex flex-col justify-between p-4 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-2">
            Navegação Principal
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-gold-500/20 to-navy-800 text-gold-300 border border-gold-500/30 font-semibold shadow-sm'
                      : 'text-navy-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-navy-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-gold-500/20 text-gold-300 border border-gold-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Public Portal Quick Link Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-navy-800/80 to-navy-900 border border-navy-700/80 space-y-2">
          <div className="flex items-center space-x-2 text-gold-400 text-xs font-semibold">
            <ExternalLink className="w-4 h-4" />
            <span>Portal de Participações</span>
          </div>
          <p className="text-[11px] text-navy-300 leading-relaxed">
            Consulte a página pública de anúncios de falecimento para consulta familiar.
          </p>
          <Link
            href="/public/casa-hortas/demo"
            target="_blank"
            className="inline-block text-[11px] font-semibold text-gold-400 hover:text-gold-300 underline underline-offset-2"
          >
            Ver Exemplo Público &rarr;
          </Link>
        </div>
      </div>

      {/* Subscription Footer Status */}
      <div className="pt-4 border-t border-navy-800">
        <div className="flex items-center justify-between text-xs text-navy-300 mb-1.5">
          <span>Plano Atual</span>
          <span className="font-bold text-gold-400">PRO (€29/mês)</span>
        </div>
        <div className="w-full bg-navy-800 h-1.5 rounded-full overflow-hidden mb-2">
          <div className="bg-gradient-to-r from-gold-500 to-amber-300 h-full w-[45%]" />
        </div>
        <p className="text-[10px] text-navy-400">
          Utilização de flyers: <span className="text-white font-medium">Ilimitada</span>
        </p>
      </div>
    </aside>
  );
}
