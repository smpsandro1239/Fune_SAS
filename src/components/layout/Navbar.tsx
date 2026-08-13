'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Sparkles, 
  User, 
  ChevronDown, 
  Bell, 
  Plus, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  currentAgency?: string;
  onAgencyChange?: (agencySlug: string) => void;
}

export default function Navbar({ currentAgency = 'casa-hortas', onAgencyChange }: NavbarProps) {
  const [showAgencyMenu, setShowAgencyMenu] = useState(false);

  const agencies = [
    { name: 'Funerária Casa Hortas, Lda', slug: 'casa-hortas', plan: 'PRO', badge: 'Principal' },
    { name: 'Agência Funerária Minho Central', slug: 'minho-central', plan: 'ENTERPRISE', badge: 'Filial' },
  ];

  const activeAgency = agencies.find(a => a.slug === currentAgency) || agencies[0];

  return (
    <header className="h-16 border-b border-navy-700/60 bg-navy-900/90 backdrop-blur-md sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
      {/* Brand & Agency Selector */}
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

        {/* Agency Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAgencyMenu(!showAgencyMenu)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-navy-800/80 hover:bg-navy-700/80 border border-gold-500/20 text-xs font-medium text-navy-100 transition-colors"
          >
            <Building2 className="w-4 h-4 text-gold-400" />
            <span className="max-w-[140px] md:max-w-[200px] truncate">{activeAgency.name}</span>
            <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gold-500/20 text-gold-300 border border-gold-500/30">
              {activeAgency.plan}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-navy-400" />
          </button>

          {showAgencyMenu && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl bg-navy-900 border border-navy-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 text-[10px] font-bold text-navy-400 uppercase tracking-wider">
                Alternar Agência Funerária
              </div>
              {agencies.map((agency) => (
                <button
                  key={agency.slug}
                  onClick={() => {
                    if (onAgencyChange) onAgencyChange(agency.slug);
                    setShowAgencyMenu(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-all ${
                    agency.slug === activeAgency.slug
                      ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30 font-semibold'
                      : 'text-navy-200 hover:bg-navy-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Building2 className={`w-4 h-4 ${agency.slug === activeAgency.slug ? 'text-gold-400' : 'text-navy-400'}`} />
                    <div>
                      <div className="font-medium text-white truncate max-w-[140px]">{agency.name}</div>
                      <div className="text-[10px] text-navy-400">{agency.badge}</div>
                    </div>
                  </div>
                  {agency.slug === activeAgency.slug && (
                    <CheckCircle2 className="w-4 h-4 text-gold-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Action Icons & User Profile */}
      <div className="flex items-center space-x-3">
        <Link
          href="/flyers"
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-gold-600 to-amber-500 hover:from-gold-500 hover:to-amber-400 text-navy-950 font-semibold text-xs transition-all shadow-md shadow-gold-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Flyer</span>
        </Link>

        {/* Notifications */}
        <button className="p-2 rounded-lg bg-navy-800/80 hover:bg-navy-700/80 text-navy-300 hover:text-white border border-navy-700 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
        </button>

        {/* User Info */}
        <div className="flex items-center space-x-2 pl-2 border-l border-navy-700/80">
          <div className="w-8 h-8 rounded-full bg-navy-700 border border-gold-500/30 flex items-center justify-center text-white text-xs font-bold">
            SP
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-white">Sandro Pereira</div>
            <div className="text-[10px] text-gold-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Admin
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
