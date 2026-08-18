'use client';

import React, { useState } from 'react';
import { Sparkles, User, LogOut, Building2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAgency } from '@/context/AgencyContext';
import { useAuth } from '@/context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  OPERATOR: 'Operador',
  DESIGNER: 'Designer',
};

export default function Navbar() {
  const { currentAgency, loading: agencyLoading } = useAgency();
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = user
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '??';

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  return (
    <header className="h-16 border-b border-navy-700/60 bg-navy-900/90 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
      {/* Marca e agência */}
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-600 via-gold-500 to-amber-300 p-0.5 shadow-lg shadow-gold-500/10">
            <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gold-400" />
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="font-serif font-bold text-lg text-white tracking-wide block leading-none">
              Fune<span className="gold-gradient-text">SAS</span>
            </span>
            <span className="text-[10px] text-navy-300 tracking-wider uppercase font-medium">Plataforma Funerária</span>
          </div>
        </Link>

        {/* Agência atual */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-navy-800/90 border border-gold-500/30 text-xs font-medium text-navy-100">
          <Building2 className="w-4 h-4 text-gold-400" />
          {agencyLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-navy-300" />
          ) : (
            <>
              <span className="max-w-[140px] md:max-w-[220px] truncate font-semibold text-white">
                {currentAgency?.name || 'A agência'}
              </span>
              {currentAgency?.subscriptionPlan && (
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-gold-500/20 text-gold-300 border border-gold-500/30">
                  {currentAgency.subscriptionPlan}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Ações à direita */}
      <div className="flex items-center space-x-3">
        <Link
          href="/flyers"
          className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 font-bold text-xs transition-all shadow-md shadow-gold-500/10"
        >
          <Sparkles className="w-4 h-4" />
          <span>Novo Flyer</span>
        </Link>

        {/* Utilizador */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-navy-700/80">
          <Link href="/profile" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-full bg-navy-700 border border-gold-500/30 flex items-center justify-center text-white text-xs font-bold group-hover:border-gold-500 transition-all">
              {initials}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white group-hover:text-gold-300 transition-colors">{user?.name}</div>
              <div className="text-[10px] text-gold-400 flex items-center gap-1">
                <User className="w-3 h-3" />
                {user ? ROLE_LABELS[user.role] || user.role : ''}
              </div>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Terminar sessão"
            className="p-2 rounded-lg bg-navy-800 hover:bg-red-500/20 text-navy-300 hover:text-red-300 border border-navy-700 transition-all disabled:opacity-50"
          >
            {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
