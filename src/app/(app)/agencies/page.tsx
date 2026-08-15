'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Users,
  Plus,
  X,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  UserCog,
  Phone,
  Mail,
  MapPin,
  Globe,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAgency } from '@/context/AgencyContext';
import { useAuth } from '@/context/AuthContext';
import { ApiUser, UserRole, apiErrorMessage, apiService } from '@/lib/api';

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  OPERATOR: 'Operador',
  DESIGNER: 'Designer',
};

const ROLE_STYLES: Record<UserRole, string> = {
  ADMIN: 'bg-gold-500/20 text-gold-300 border border-gold-500/30',
  OPERATOR: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  DESIGNER: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
};

const EMPTY_FORM = { name: '', email: '', password: '', role: 'OPERATOR' as UserRole };

export default function AgenciesPage() {
  const { currentAgency, loading: agencyLoading } = useAgency();
  const { user: sessionUser } = useAuth();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deletingUser, setDeletingUser] = useState<ApiUser | null>(null);

  const isAdmin = sessionUser?.role === 'ADMIN';

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      setUsers(await apiService.users.list());
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível carregar os utilizadores.'));
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setShowUserModal(true);
  };

  const openEdit = (user: ApiUser) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setShowUserModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (editingUser) {
        const payload: Partial<{ name: string; email: string; password: string; role: UserRole }> = {
          name: form.name,
          email: form.email,
          role: form.role,
        };
        if (form.password) payload.password = form.password;
        await apiService.users.update(editingUser.id, payload);
      } else {
        await apiService.users.create({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
      }
      setShowUserModal(false);
      await loadUsers();
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível guardar o utilizador.'));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setError('');
    setBusy(true);
    try {
      await apiService.users.remove(deletingUser.id);
      setDeletingUser(null);
      await loadUsers();
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível remover o utilizador.'));
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none';

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gold-400" />
            Agência & Utilizadores
          </h1>
          <p className="text-xs text-navy-300">
            Perfil da agência, plano de subscrição e equipa com permissões.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs shadow-lg transition-all hover:brightness-110"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Utilizador</span>
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Cartão da agência */}
      <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-4 shadow-xl">
        {agencyLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-navy-950 border border-gold-500/30 flex items-center justify-center font-serif font-bold text-lg text-gold-400">
                  {currentAgency?.initials || 'AF'}
                </div>
                <div>
                  <h2 className="font-bold text-white text-base">{currentAgency?.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gold-500/20 text-gold-300 border border-gold-500/30">
                      {currentAgency?.subscriptionPlan || 'FREE'}
                    </span>
                    <span className="text-[11px] text-navy-300">SaaS multi-agência</span>
                  </div>
                </div>
              </div>
              {isAdmin && (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-700 text-[11px] text-navy-300">
                  <UserCog className="w-3.5 h-3.5 text-gold-400" />
                  Permissões completas (Administrador)
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t border-navy-800 text-xs text-navy-200">
              {currentAgency?.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>{currentAgency.phone}</span>
                </div>
              )}
              {currentAgency?.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>{currentAgency.email}</span>
                </div>
              )}
              {currentAgency?.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
                  <span className="truncate">{currentAgency.address}</span>
                </div>
              )}
              {currentAgency?.location && (
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>{currentAgency.location}</span>
                </div>
              )}
              {currentAgency?.foundedYear && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>{currentAgency.foundedYear}</span>
                </div>
              )}
              {currentAgency?.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>{currentAgency.website}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Lista de utilizadores */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-navy-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-gold-400" />
            Equipa da Agência
          </h3>
          <span className="text-[11px] font-semibold text-navy-300">
            {users.length} utilizador{users.length === 1 ? '' : 'es'}
          </span>
        </div>

        {usersLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
          </div>
        ) : (
          <div className="divide-y divide-navy-800">
            {users.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-navy-800/50 transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-navy-950 border border-gold-500/30 flex items-center justify-center text-xs font-bold text-gold-400 shrink-0">
                    {user.name
                      .split(' ')
                      .filter(Boolean)
                      .map((part) => part[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-white text-xs truncate">{user.name}</h4>
                      {user.id === sessionUser?.id && (
                        <span className="text-[9px] font-bold text-navy-300">(eu)</span>
                      )}
                    </div>
                    <p className="text-[11px] text-navy-400 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ROLE_STYLES[user.role]}`}>
                    {ROLE_LABELS[user.role]}
                  </span>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => openEdit(user)}
                        className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-gold-300 border border-navy-700"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {user.id !== sessionUser?.id && (
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="p-1.5 rounded-lg bg-navy-800 hover:bg-red-500/20 text-navy-300 hover:text-red-300 border border-navy-700"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isAdmin && (
        <p className="flex items-center gap-1.5 text-[11px] text-navy-400">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-500/70" />
          Apenas administradores podem gerir utilizadores.
        </p>
      )}

      {/* Modal: criar/editar utilizador */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserCog className="w-4 h-4 text-gold-400" />
                {editingUser ? 'Editar Utilizador' : 'Adicionar Utilizador'}
              </h2>
              <button onClick={() => setShowUserModal(false)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Nome *</label>
                <input
                  type="text"
                  placeholder="Ex: Maria João Santos"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Email *</label>
                <input
                  type="email"
                  placeholder="operador@agencia.pt"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-navy-200 mb-1 font-semibold">
                  Password {editingUser && <span className="text-navy-400 font-normal">(deixe vazio para manter)</span>} *
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? 'Nova password (opcional)' : 'Mínimo 8 caracteres'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputClass}
                  required={!editingUser}
                  minLength={editingUser ? undefined : 8}
                />
              </div>
              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Função / Permissões</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  className={inputClass}
                >
                  <option value="OPERATOR">Operador</option>
                  <option value="DESIGNER">Designer</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-navy-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold shadow flex items-center space-x-1.5 disabled:opacity-60"
                >
                  {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingUser ? 'Guardar Alterações' : 'Criar Utilizador'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: confirmar remoção */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" />
                Remover Utilizador
              </h2>
              <button onClick={() => setDeletingUser(null)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-navy-200 leading-relaxed">
              Tem a certeza que pretende remover <span className="font-bold text-white">{deletingUser.name}</span> (
              {deletingUser.email})? Esta ação não pode ser anulada.
            </p>
            <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl bg-navy-800 text-navy-300 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={busy}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs shadow flex items-center space-x-1.5 disabled:opacity-60"
              >
                {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Remover</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação silenciosa após sucesso */}
      {!error && users.length > 0 && (
        <p className="flex items-center gap-1.5 text-[11px] text-emerald-400/80">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Dados sincronizados com a API.
        </p>
      )}
    </div>
  );
}
