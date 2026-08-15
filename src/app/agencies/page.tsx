'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  CreditCard, 
  Plus, 
  Users, 
  Lock, 
  ShieldAlert, 
  UserCheck, 
  X,
  CheckCircle2
} from 'lucide-react';
import { useAgency } from '@/context/AgencyContext';

export default function AgenciesPage() {
  const { agencies, currentAgency, switchAgency, addAgency } = useAgency();

  const [activeTab, setActiveTab] = useState<'AGENCY' | 'ROLES' | 'PLANS'>('AGENCY');

  // RBAC Users State
  const [users, setUsers] = useState([
    { id: '1', name: 'Sandro Pereira', email: 'sandro@casahortas.com', role: 'ADMIN', agency: 'Funerária Casa Hortas, Lda' },
    { id: '2', name: 'Maria João Santos', email: 'operador1@casahortas.com', role: 'OPERATOR', agency: 'Funerária Casa Hortas, Lda' },
    { id: '3', name: 'Carlos Designer', email: 'designer@casahortas.com', role: 'DESIGNER', agency: 'Funerária Casa Hortas, Lda' },
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'OPERATOR' | 'DESIGNER'>('OPERATOR');

  // Policy Matrix State
  const [policies, setPolicies] = useState({
    ADMIN: { createFuneral: true, editFlyers: true, manageAgencies: true, deleteDocuments: true, manageBilling: true },
    OPERATOR: { createFuneral: true, editFlyers: true, manageAgencies: false, deleteDocuments: false, manageBilling: false },
    DESIGNER: { createFuneral: false, editFlyers: true, manageAgencies: false, deleteDocuments: false, manageBilling: false },
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    setUsers([
      ...users,
      {
        id: Date.now().toString(),
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        agency: currentAgency.name,
      },
    ]);
    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  const togglePolicy = (role: 'ADMIN' | 'OPERATOR' | 'DESIGNER', key: keyof typeof policies.ADMIN) => {
    setPolicies((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: !prev[role][key],
      },
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gold-400" />
            Gestão Multi-Agência & Políticas de Acesso (RBAC)
          </h1>
          <p className="text-xs text-navy-300">
            Agência Ativa: <span className="text-gold-400 font-bold">{currentAgency.name}</span>
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-navy-900 p-1 rounded-xl border border-navy-800 text-xs">
          <button
            onClick={() => setActiveTab('AGENCY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'AGENCY' ? 'bg-gold-500 text-navy-950 shadow' : 'text-navy-300 hover:text-white'
            }`}
          >
            Dados da Agência
          </button>

          <button
            onClick={() => setActiveTab('ROLES')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'ROLES' ? 'bg-gold-500 text-navy-950 shadow' : 'text-navy-300 hover:text-white'
            }`}
          >
            Permissões & Utilizadores
          </button>

          <button
            onClick={() => setActiveTab('PLANS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'PLANS' ? 'bg-gold-500 text-navy-950 shadow' : 'text-navy-300 hover:text-white'
            }`}
          >
            Subscrição SaaS
          </button>
        </div>
      </div>

      {/* TAB 1: AGENCY DETAILS */}
      {activeTab === 'AGENCY' && (
        <div className="space-y-6">
          {/* Active Agency Card */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-navy-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-navy-950 border border-gold-500/40 flex items-center justify-center font-serif text-base text-gold-300 font-black shadow-inner">
                  {currentAgency.initials || 'AF'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">{currentAgency.name}</h2>
                  <p className="text-xs text-navy-400">Agência Selecionada • {currentAgency.location}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold-500/20 text-gold-300 border border-gold-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Plano {currentAgency.subscriptionPlan}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Nome Oficial da Funerária</label>
                <input type="text" defaultValue={currentAgency.name} className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white font-bold" />
              </div>

              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Ano de Fundação / Texto</label>
                <input type="text" defaultValue={currentAgency.foundedYear || 'DESDE 1890'} className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white" />
              </div>

              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Endereço da Agência</label>
                <input type="text" defaultValue={currentAgency.address || 'Rua das Maceirinhas, Cabreiros, Braga'} className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white" />
              </div>

              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Localidade Principal</label>
                <input type="text" defaultValue={currentAgency.location || 'Ventosa, Vieira do Minho'} className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white" />
              </div>

              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Telefone Geral</label>
                <input type="text" defaultValue={currentAgency.phone || '+351 253 123 456'} className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white" />
              </div>

              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Website Oficial</label>
                <input type="text" defaultValue={currentAgency.website || 'www.casahortas.com'} className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white" />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button className="px-4 py-2 rounded-xl bg-gold-500 text-navy-950 font-bold text-xs shadow hover:brightness-110">
                Guardar Alterações da Agência
              </button>
            </div>
          </div>

          {/* Registered Agencies Quick Switcher List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gold-400" />
              Todas as Agências Registadas no SaaS ({agencies.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agencies.map((agency) => (
                <div
                  key={agency.slug}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    agency.slug === currentAgency.slug
                      ? 'bg-gold-500/10 border-gold-500/50 shadow-md'
                      : 'bg-navy-900/60 border-navy-800 hover:border-navy-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-navy-950 border border-gold-500/30 flex items-center justify-center font-serif text-sm font-bold text-gold-300">
                      {agency.initials || 'AF'}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">{agency.name}</h4>
                      <p className="text-[10px] text-navy-400">{agency.location || 'Agência SaaS'}</p>
                    </div>
                  </div>

                  {agency.slug === currentAgency.slug ? (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gold-500 text-navy-950">
                      Ativa Agora
                    </span>
                  ) : (
                    <button
                      onClick={() => switchAgency(agency.slug)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-navy-800 hover:bg-navy-700 text-gold-300 border border-navy-700"
                    >
                      Alternar &rarr;
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER ROLES & PERMISSION POLICIES (RBAC) */}
      {activeTab === 'ROLES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-gold-400" />
                Utilizadores da Agência ({users.length})
              </h2>
              <p className="text-xs text-navy-300">Gestão de papéis (Admin, Operador, Designer) e credenciais de acesso</p>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Utilizador</span>
            </button>
          </div>

          {/* User List */}
          <div className="bg-navy-900/80 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-navy-800 flex items-center justify-between text-xs text-navy-400 font-bold uppercase tracking-wider">
              <span>Utilizador</span>
              <span>Email</span>
              <span>Papel (Role)</span>
              <span>Estado</span>
            </div>

            <div className="divide-y divide-navy-800">
              {users.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between text-xs">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-navy-950 border border-gold-500/30 flex items-center justify-center font-bold text-gold-400 text-[10px]">
                      {u.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span>{u.name}</span>
                  </div>

                  <div className="text-navy-300">{u.email}</div>

                  <div>
                    <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : u.role === 'OPERATOR'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {u.role}
                    </span>
                  </div>

                  <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Policy Matrix Table */}
          <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-4 shadow-xl">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-gold-400" />
                Matriz de Políticas de Permissão no Site
              </h3>
              <p className="text-xs text-navy-400">Ative ou desative permissões específicas por cada papel de utilizador</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-navy-800 text-navy-400 uppercase font-bold tracking-wider">
                    <th className="pb-3">Permissão</th>
                    <th className="pb-3 text-center">ADMIN</th>
                    <th className="pb-3 text-center">OPERATOR</th>
                    <th className="pb-3 text-center">DESIGNER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800 text-navy-200">
                  <tr>
                    <td className="py-3 font-semibold text-white">Criar & Editar Funerais</td>
                    <td className="py-3 text-center"><input type="checkbox" checked={policies.ADMIN.createFuneral} onChange={() => togglePolicy('ADMIN', 'createFuneral')} /></td>
                    <td className="py-3 text-center"><input type="checkbox" checked={policies.OPERATOR.createFuneral} onChange={() => togglePolicy('OPERATOR', 'createFuneral')} /></td>
                    <td className="py-3 text-center"><input type="checkbox" checked={policies.DESIGNER.createFuneral} onChange={() => togglePolicy('DESIGNER', 'createFuneral')} /></td>
                  </tr>

                  <tr>
                    <td className="py-3 font-semibold text-white">Usar Editor de Flyers & Exportar</td>
                    <td className="py-3 text-center"><input type="checkbox" checked={policies.ADMIN.editFlyers} onChange={() => togglePolicy('ADMIN', 'editFlyers')} /></td>
                    <td className="py-3 text-center"><input type="checkbox" checked={policies.OPERATOR.editFlyers} onChange={() => togglePolicy('OPERATOR', 'editFlyers')} /></td>
                    <td className="py-3 text-center"><input type="checkbox" checked={policies.DESIGNER.editFlyers} onChange={() => togglePolicy('DESIGNER', 'editFlyers')} /></td>
                  </tr>

                  <tr>
                    <td className="py-3 font-semibold text-white">Gerir Dados & Logótipo da Agência</td>
                    <td className="py-3 text-center"><input type="checkbox" checked={policies.ADMIN.manageAgencies} onChange={() => togglePolicy('ADMIN', 'manageAgencies')} /></td>
                    <td className="py-3 text-center"><input type="checkbox" checked={policies.OPERATOR.manageAgencies} onChange={() => togglePolicy('OPERATOR', 'manageAgencies')} /></td>
                    <td className="py-3 text-center"><input type="checkbox" checked={policies.DESIGNER.manageAgencies} onChange={() => togglePolicy('DESIGNER', 'manageAgencies')} /></td>
                  </tr>

                  <tr>
                    <td className="py-3 font-semibold text-white">Eliminar Documentos Encriptados</td>
                    <td className="py-3 text-center"><input type="checkbox" checked={policies.ADMIN.deleteDocuments} onChange={() => togglePolicy('ADMIN', 'deleteDocuments')} /></td>
                    <td className="py-3 text-center"><input type="checkbox" checked={policies.OPERATOR.deleteDocuments} onChange={() => togglePolicy('OPERATOR', 'deleteDocuments')} /></td>
                    <td className="py-3 text-center"><input type="checkbox" checked={policies.DESIGNER.deleteDocuments} onChange={() => togglePolicy('DESIGNER', 'deleteDocuments')} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SAAS SUBSCRIPTION PLANS */}
      {activeTab === 'PLANS' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gold-400" />
              Planos de Subscrição Comercial SaaS
            </h2>
            <p className="text-xs text-navy-300">Escolha o plano adequado para a sua agência funerária</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: '€0', period: '/mês', features: ['Até 3 flyers/mês', '1 Utilizador Operador', 'Modelos Básicos', 'Suporte por Email'], isCurrent: false },
              { name: 'Pro', price: '€29', period: '/mês', features: ['Flyers Ilimitados em HD', 'Exportação em PDF & PNG', 'Até 5 Utilizadores', 'Modelos Premium (Casa Hortas)', 'Portal Público de Participações'], isCurrent: true, recommended: true },
              { name: 'Enterprise', price: '€99', period: '/mês', features: ['Domínio Próprio Personalizado', 'Utilizadores Ilimitados', 'Integração com Facebook & Redes', 'Suporte Prioritário 24/7', 'Backups Automáticos Diários'], isCurrent: false },
            ].map((plan) => (
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
      )}

      {/* Modal: Adicionar Utilizador */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-gold-400" />
                Adicionar Utilizador à Agência
              </h2>
              <button onClick={() => setShowAddUserModal(false)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Ex: João Ferreira"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Email de Acesso *</label>
                <input
                  type="email"
                  placeholder="joao@casahortas.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Papel (Role) *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none"
                >
                  <option value="ADMIN">ADMIN (Acesso Total)</option>
                  <option value="OPERATOR">OPERATOR (Gestão de Funerais & Agenda)</option>
                  <option value="DESIGNER">DESIGNER (Apenas Editor de Flyers)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-navy-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold shadow"
                >
                  Adicionar Utilizador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
