'use client';

import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  CreditCard, 
  Globe, 
  Phone, 
  Mail, 
  MapPin 
} from 'lucide-react';

export default function AgenciesPage() {
  const plans = [
    {
      name: 'Free',
      price: '€0',
      period: '/mês',
      features: ['Até 3 flyers/mês', '1 Utilizador Operador', 'Modelos Básicos', 'Suporte por Email'],
      isCurrent: false,
    },
    {
      name: 'Pro',
      price: '€29',
      period: '/mês',
      features: ['Flyers Ilimitados em HD', 'Exportação em PDF & PNG', 'Até 5 Utilizadores', 'Modelos Premium (Casa Hortas)', 'Portal Público de Participações'],
      isCurrent: true,
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: '€99',
      period: '/mês',
      features: ['Domínio Próprio Personalizado', 'Utilizadores Ilimitados', 'Integração com Facebook & Redes', 'Suporte Prioritário 24/7', 'Backups Automáticos Diários'],
      isCurrent: false,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gold-400" />
          Configurações da Agência & Subscrição SaaS
        </h1>
        <p className="text-xs text-navy-300">
          Dados da funerária, personalização de marca, brasão/logótipo e gestão do plano.
        </p>
      </div>

      {/* Agency Details Form Card */}
      <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-navy-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">Funerária Casa Hortas, Lda</h2>
            <p className="text-xs text-navy-400">Dados oficiais impressos nos flyers e participações</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold-500/20 text-gold-300 border border-gold-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Agência Verificada
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-navy-200 mb-1 font-semibold">Nome Comercial</label>
            <input type="text" defaultValue="Funerária Casa Hortas, Lda" className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white font-bold" />
          </div>

          <div>
            <label className="block text-navy-200 mb-1 font-semibold">Ano de Fundação</label>
            <input type="text" defaultValue="DESDE 1890" className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white" />
          </div>

          <div>
            <label className="block text-navy-200 mb-1 font-semibold">Endereço da Agência</label>
            <input type="text" defaultValue="Rua das Maceirinhas, Cabreiros, Braga" className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white" />
          </div>

          <div>
            <label className="block text-navy-200 mb-1 font-semibold">Localidade Principal</label>
            <input type="text" defaultValue="Ventosa, Vieira do Minho" className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white" />
          </div>

          <div>
            <label className="block text-navy-200 mb-1 font-semibold">Telefone Geral</label>
            <input type="text" defaultValue="+351 253 123 456" className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white" />
          </div>

          <div>
            <label className="block text-navy-200 mb-1 font-semibold">Website Oficial</label>
            <input type="text" defaultValue="www.casahortas.com" className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white" />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button className="px-4 py-2 rounded-xl bg-gold-500 text-navy-950 font-bold text-xs shadow hover:brightness-110">
            Guardar Alterações da Agência
          </button>
        </div>
      </div>

      {/* Subscription Plans Commercial Strategy */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold-400" />
            Planos de Subscrição SaaS
          </h2>
          <p className="text-xs text-navy-300">Escolha o plano adequado para a sua agência funerária</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-6 rounded-2xl border flex flex-col justify-between space-y-6 transition-all ${
                plan.recommended
                  ? 'bg-gradient-to-b from-navy-900 via-navy-900 to-navy-950 border-gold-500/60 shadow-2xl shadow-gold-500/10 relative'
                  : 'bg-navy-900/60 border-navy-800'
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-gold-500 text-navy-950 shadow">
                  MAIS POPULAR
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-white text-base">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-gold-400">{plan.price}</span>
                    <span className="text-xs text-navy-400">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-navy-200">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-gold-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                disabled={plan.isCurrent}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                  plan.isCurrent
                    ? 'bg-navy-800 text-gold-300 border border-gold-500/30 cursor-default'
                    : 'bg-gold-500 hover:bg-gold-400 text-navy-950 shadow'
                }`}
              >
                {plan.isCurrent ? 'Plano Atual Ativo' : 'Subscrever Plano'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
