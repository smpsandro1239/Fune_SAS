'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, LayoutDashboard, Users, Palette, FileText, Calendar, BarChart3, Settings, ExternalLink, UserCircle, CreditCard, Send, Megaphone } from 'lucide-react';
import { useAgency } from '@/context/AgencyContext';

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Free',
  PRO: 'PRO (€29/mês)',
  ENTERPRISE: 'Enterprise (€99/mês)',
};

export default function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { currentAgency } = useAgency();

  const navItems = [
    { name: 'Visão Geral', href: '/', icon: LayoutDashboard },
    { name: 'Funerais & Falecidos', href: '/funerals', icon: Users },
    { name: 'Editor de Flyers', href: '/flyers', icon: Palette, badge: 'Interativo' },
    { name: 'Gestão Documental', href: '/documents', icon: FileText },
    { name: 'Agenda & Serviços', href: '/agenda', icon: Calendar },
    { name: 'Relatórios & Métricas', href: '/analytics', icon: BarChart3 },
    { name: 'Gerar Documentos', href: '/documents/generate', icon: Send },
    { name: 'Publicações Sociais', href: '/publications', icon: Megaphone },
    { name: 'Configurações Agência', href: '/agencies', icon: Settings },
  ];

  const bottomItems = [
    { name: 'Meu Perfil', href: '/profile', icon: UserCircle },
    { name: 'Plano & Subscrição', href: '/subscriptions', icon: CreditCard },
  ];

  const content = (
    <>
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-2">Navegação Principal</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
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

        <div>
          <nav className="space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-gold-500/20 to-navy-800 text-gold-300 border border-gold-500/30 font-semibold shadow-sm'
                      : 'text-navy-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-navy-400'}`} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-navy-800/80 to-navy-900 border border-navy-700/80 space-y-2">
          <div className="flex items-center space-x-2 text-gold-400 text-xs font-semibold">
            <ExternalLink className="w-4 h-4" />
            <span>Portal de Participações</span>
          </div>
          <p className="text-[11px] text-navy-300 leading-relaxed">
            Consulte a página pública de anúncios de falecimento para consulta familiar.
          </p>
          <Link href="/public/casa-hortas/demo-funeral-luis-freitas" target="_blank" onClick={onClose}
            className="inline-block text-[11px] font-semibold text-gold-400 hover:text-gold-300 underline underline-offset-2">
            Ver Exemplo Público →
          </Link>
        </div>
      </div>

      <div className="pt-4 border-t border-navy-800">
        <div className="flex items-center justify-between text-xs text-navy-300 mb-1.5">
          <span>Plano Atual</span>
          <span className="font-bold text-gold-400">
            {PLAN_LABELS[currentAgency?.subscriptionPlan || 'FREE'] || 'FREE'}
          </span>
        </div>
        <div className="w-full bg-navy-800 h-1.5 rounded-full overflow-hidden mb-2">
          <div className={`bg-gradient-to-r from-gold-500 to-amber-300 h-full ${
            currentAgency?.subscriptionPlan === 'ENTERPRISE' ? 'w-full' :
            currentAgency?.subscriptionPlan === 'PRO' ? 'w-[65%]' : 'w-[30%]'
          }`} />
        </div>
        <Link href="/subscriptions" onClick={onClose} className="text-[10px] text-navy-400 hover:text-gold-400 transition-colors">
          Gerir plano →
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="w-64 bg-navy-950/80 border-r border-navy-800 hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)] mt-[64px]">
        {content}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-navy-950 border-r border-navy-800 flex flex-col justify-between p-4 overflow-y-auto animate-in slide-in-from-left-5">
            <div className="flex justify-end mb-2">
              <button onClick={onClose} className="p-2 rounded-lg bg-navy-800 text-navy-300 hover:text-white border border-navy-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
