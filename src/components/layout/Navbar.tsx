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
  CheckCircle2,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useAgency } from '@/context/AgencyContext';

export default function Navbar() {
  const { agencies, currentAgency, switchAgency, addAgency } = useAgency();
  const [showAgencyMenu, setShowAgencyMenu] = useState(false);
  const [showAddAgencyModal, setShowAddAgencyModal] = useState(false);

  // New Agency Form state
  const [newAgencyName, setNewAgencyName] = useState('');
  const [newAgencyInitials, setNewAgencyInitials] = useState('');
  const [newAgencyLocation, setNewAgencyLocation] = useState('');
  const [newAgencyPhone, setNewAgencyPhone] = useState('');
  const [newAgencyPlan, setNewAgencyPlan] = useState<'FREE' | 'PRO' | 'ENTERPRISE'>('PRO');

  const handleCreateAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgencyName.trim()) return;

    const slug = newAgencyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const initials = newAgencyInitials.trim() || newAgencyName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

    addAgency({
      name: newAgencyName,
      slug,
      initials,
      logoType: 'INITIALS',
      location: newAgencyLocation || 'Braga',
      phone: newAgencyPhone || '+351 253 000 000',
      subscriptionPlan: newAgencyPlan,
      foundedYear: `DESDE ${new Date().getFullYear()}`,
      badge: 'Nova Agência',
    });

    setNewAgencyName('');
    setNewAgencyInitials('');
    setNewAgencyLocation('');
    setNewAgencyPhone('');
    setShowAddAgencyModal(false);
    setShowAgencyMenu(false);
  };

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
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-navy-800/90 hover:bg-navy-700/90 border border-gold-500/30 text-xs font-medium text-navy-100 transition-colors shadow"
          >
            <Building2 className="w-4 h-4 text-gold-400" />
            <span className="max-w-[140px] md:max-w-[200px] truncate font-semibold text-white">{currentAgency.name}</span>
            <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-gold-500/20 text-gold-300 border border-gold-500/30">
              {currentAgency.subscriptionPlan}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-navy-400" />
          </button>

          {showAgencyMenu && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-navy-900 border border-navy-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 text-[10px] font-bold text-navy-400 uppercase tracking-wider flex items-center justify-between">
                <span>Alternar Agência Funerária</span>
                <span className="text-gold-400 font-semibold">{agencies.length} ativas</span>
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                {agencies.map((agency) => (
                  <button
                    key={agency.slug}
                    onClick={() => {
                      switchAgency(agency.slug);
                      setShowAgencyMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all ${
                      agency.slug === currentAgency.slug
                        ? 'bg-gold-500/15 text-gold-300 border border-gold-500/30 font-semibold'
                        : 'text-navy-200 hover:bg-navy-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-navy-950 border border-gold-500/30 flex items-center justify-center font-serif text-xs text-gold-400 shrink-0 font-bold">
                        {agency.initials || 'AF'}
                      </div>
                      <div className="truncate">
                        <div className="font-medium text-white truncate max-w-[150px]">{agency.name}</div>
                        <div className="text-[10px] text-navy-400">{agency.location || 'Agência SaaS'}</div>
                      </div>
                    </div>
                    {agency.slug === currentAgency.slug && (
                      <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t border-navy-800">
                <button
                  onClick={() => {
                    setShowAddAgencyModal(true);
                    setShowAgencyMenu(false);
                  }}
                  className="w-full py-2 rounded-xl bg-gold-500/10 hover:bg-gold-500/20 text-gold-300 font-bold text-xs border border-gold-500/30 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Adicionar Nova Agência</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Action Icons & User Profile */}
      <div className="flex items-center space-x-3">
        <Link
          href="/flyers"
          className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 font-bold text-xs transition-all shadow-md shadow-gold-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Flyer</span>
        </Link>

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

      {/* Modal: Adicionar Nova Agência Funerária */}
      {showAddAgencyModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gold-400" />
                Registar Nova Agência Funerária (SaaS)
              </h2>
              <button onClick={() => setShowAddAgencyModal(false)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAgency} className="space-y-3 text-xs">
              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Nome Oficial da Agência *</label>
                <input
                  type="text"
                  placeholder="Ex: Funerária Minho Norte, Lda"
                  value={newAgencyName}
                  onChange={(e) => setNewAgencyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-navy-200 mb-1 font-semibold">Iniciais para Monograma</label>
                  <input
                    type="text"
                    placeholder="Ex: MN"
                    maxLength={3}
                    value={newAgencyInitials}
                    onChange={(e) => setNewAgencyInitials(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white uppercase font-bold focus:border-gold-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-navy-200 mb-1 font-semibold">Plano de Subscrição</label>
                  <select
                    value={newAgencyPlan}
                    onChange={(e) => setNewAgencyPlan(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none"
                  >
                    <option value="FREE">Free (€0)</option>
                    <option value="PRO">Pro (€29/mês)</option>
                    <option value="ENTERPRISE">Enterprise (€99/mês)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-navy-200 mb-1 font-semibold">Localização / Concelho</label>
                  <input
                    type="text"
                    placeholder="Ex: Viana do Castelo"
                    value={newAgencyLocation}
                    onChange={(e) => setNewAgencyLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-navy-200 mb-1 font-semibold">Telefone de Contacto</label>
                  <input
                    type="text"
                    placeholder="Ex: +351 258 000 000"
                    value={newAgencyPhone}
                    onChange={(e) => setNewAgencyPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAgencyModal(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-navy-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow"
                >
                  Criar Agência Funerária
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
