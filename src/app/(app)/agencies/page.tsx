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
  XCircle,
  Zap,
  Facebook,
  Instagram,
  Link as LinkIcon,
  Twitter,
  Youtube,
  Music2,
  Megaphone,
  Send,
} from 'lucide-react';
import { useAgency } from '@/context/AgencyContext';
import { useAuth } from '@/context/AuthContext';
import { ApiUser, UserRole, apiErrorMessage, apiService } from '@/lib/api';
import Link from 'next/link';
import { MessageSquareHeart } from 'lucide-react';
import Pagination from '@/components/Pagination';

const USERS_PAGE_SIZE = 8;

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  OPERATOR: 'Operador',
  DESIGNER: 'Designer',
};

const ROLE_STYLES: Record<UserRole, string> = {
  SUPER_ADMIN: 'bg-red-500/20 text-red-300 border border-red-500/30',
  ADMIN: 'bg-gold-500/20 text-gold-300 border border-gold-500/30',
  OPERATOR: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  DESIGNER: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
};

const EMPTY_FORM = { name: '', email: '', password: '', role: 'OPERATOR' as UserRole };

const SOCIAL_FIELDS = [
  { key: 'facebookPageUrl', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/sua-pagina' },
  { key: 'instagramPageUrl', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/seu-perfil' },
  { key: 'linkedinUrl', label: 'LinkedIn', icon: LinkIcon, placeholder: 'https://linkedin.com/company/...' },
  { key: 'twitterUrl', label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/seu-perfil' },
  { key: 'youtubeUrl', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@canal' },
  { key: 'tiktokUrl', label: 'TikTok', icon: Music2, placeholder: 'https://tiktok.com/@perfil' },
];

const SOCIAL_FIELD_KEYS = SOCIAL_FIELDS.map(f => f.key);

const API_FIELDS = [
  { key: 'facebookPageId', label: 'Facebook Page ID', placeholder: 'Ex: 123456789012345', secret: false,
    hint: 'ID numérico da página (encontra em About/Page Info ou via Graph API Explorer).' },
  { key: 'facebookPageAccessToken', label: 'Facebook Page Access Token', placeholder: 'EAAG...', secret: true,
    hint: 'Token com permissões pages_manage_posts + instagram_content_publish. Gerar no Meta for Developers.' },
  { key: 'instagramBusinessId', label: 'Instagram Business Account ID', placeholder: 'Ex: 17841400000000000', secret: false,
    hint: 'IG User ID da conta profissional ligada à página do Facebook.' },
  { key: 'whatsappPhoneNumberId', label: 'WhatsApp Phone Number ID', placeholder: 'Ex: 123456789012345', secret: false,
    hint: 'Phone Number ID do produto WhatsApp no Meta for Developers.' },
  { key: 'whatsappAccessToken', label: 'WhatsApp Access Token', placeholder: 'EAAG...', secret: true,
    hint: 'Token do utilizador de sistema com permissão whatsapp_business_messaging.' },
  { key: 'whatsappNotifyNumber', label: 'WhatsApp Notificações (número)', placeholder: '351912345678', secret: false,
    hint: 'Número que recebe alertas de novas condolências. Formato internacional, sem +.' },
];

const API_FIELD_KEYS = API_FIELDS.map(f => f.key);

export default function AgenciesPage() {
  const { currentAgency, loading: agencyLoading, reload: reloadAgency } = useAgency();
  const { user: sessionUser } = useAuth();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deletingUser, setDeletingUser] = useState<ApiUser | null>(null);
  const [page, setPage] = useState(1);

  const [editingSocials, setEditingSocials] = useState(false);
  const [socialForm, setSocialForm] = useState<Record<string, string>>({});

  const isAdmin = sessionUser?.role === 'ADMIN';
  const [moderationBusy, setModerationBusy] = useState(false);

  const [whatsappTestBusy, setWhatsappTestBusy] = useState(false);

  const handleWhatsAppTest = async () => {
    if (!isAdmin) return;
    setWhatsappTestBusy(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiService.agencies.testWhatsApp();
      if (res.sent) {
        setSuccess(`Mensagem de teste enviada para ${res.to}.`);
      } else {
        setError(res.error || 'Não foi possível enviar a mensagem de teste.');
      }
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível enviar a mensagem de teste.'));
    } finally {
      setWhatsappTestBusy(false);
    }
  };

  const handleToggleModeration = async () => {
    if (!currentAgency) return;
    setModerationBusy(true);
    setError('');
    try {
      await apiService.agencies.update({
        condolenceModeration: !currentAgency.condolenceModeration,
      } as Partial<typeof currentAgency>);
      await reloadAgency();
      setSuccess(
        !currentAgency.condolenceModeration
          ? 'Moderação de condolências ativada.'
          : 'Moderação de condolências desativada.',
      );
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível alterar a moderação.'));
    } finally {
      setModerationBusy(false);
    }
  };

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

  useEffect(() => { loadUsers(); }, [loadUsers]);

  useEffect(() => {
    if (currentAgency && editingSocials) {
      setSocialForm(
        Object.fromEntries(
          [...SOCIAL_FIELD_KEYS, ...API_FIELD_KEYS].map(k => [k, (currentAgency as any)[k] || ''])
        )
      );
    }
  }, [currentAgency, editingSocials]);

  const usersPageCount = Math.max(1, Math.ceil(users.length / USERS_PAGE_SIZE));
  const visibleUsers = users.slice((page - 1) * USERS_PAGE_SIZE, page * USERS_PAGE_SIZE);

  useEffect(() => {
    if (page > usersPageCount) setPage(usersPageCount);
  }, [page, usersPageCount]);

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

  const handleSaveSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);
    try {
      await apiService.agencies.update(socialForm as any);
      setEditingSocials(false);
      setSuccess('Redes sociais guardadas com sucesso.');
      reloadAgency();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível guardar as redes sociais.'));
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none text-xs';

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gold-400" />
            Agência & Utilizadores
          </h1>
          <p className="text-xs text-navy-300">
            Perfil da agência, redes sociais, plano e equipa.
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

      {success && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
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

      {/* Redes Sociais */}
      <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-gold-400" />
            Redes Sociais da Agência
          </h3>
          {isAdmin && !editingSocials && (
            <button
              onClick={() => setEditingSocials(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs text-navy-300 hover:text-gold-300 border border-navy-700"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
          )}
        </div>

        {editingSocials ? (
          <form onSubmit={handleSaveSocials} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
                <div key={key}>
                  <label className="flex items-center space-x-2 text-navy-200 mb-1 text-xs font-semibold">
                    <Icon className="w-4 h-4 text-gold-400" />
                    <span>{label}</span>
                  </label>
                  <input
                    type="url"
                    placeholder={placeholder}
                    value={socialForm[key] || ''}
                    onChange={(e) => setSocialForm({ ...socialForm, [key]: e.target.value })}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-navy-800">
              <p className="text-xs font-bold text-white flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-gold-400" />
                Publicação Automática (Meta Graph API)
              </p>
              <p className="text-[10px] text-navy-400 mb-3">
                Preencha estes 3 campos para ativar a publicação REAL no Facebook e Instagram
                diretamente da página Publicações Sociais.
              </p>
              <div className="space-y-3">
                {API_FIELDS.map(({ key, label, placeholder, secret, hint }) => (
                  <div key={key}>
                    <label className="block text-navy-200 mb-1 text-xs font-semibold">{label}</label>
                    <input
                      type={secret ? 'password' : 'text'}
                      placeholder={placeholder}
                      value={socialForm[key] || ''}
                      onChange={(e) => setSocialForm({ ...socialForm, [key]: e.target.value })}
                      className={`${inputClass} ${secret ? 'font-mono' : ''}`}
                    />
                    <p className="text-[9px] text-navy-500 mt-1">{hint}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-navy-800">
              <button
                type="button"
                onClick={() => setEditingSocials(false)}
                className="px-4 py-2 rounded-xl bg-navy-800 text-navy-300 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold text-xs shadow flex items-center space-x-1.5 disabled:opacity-60"
              >
                {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Guardar Configuração</span>
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SOCIAL_FIELDS.map(({ key, label, icon: Icon }) => {
                const url = (currentAgency as any)?.[key] as string | null;
                return (
                  <div key={key} className={`p-3 rounded-xl border ${url ? 'border-gold-500/30 bg-gold-500/5' : 'border-navy-700 bg-navy-950'}`}>
                    <div className="flex items-center space-x-2 mb-1.5">
                      <Icon className={`w-4 h-4 ${url ? 'text-gold-400' : 'text-navy-500'}`} />
                      <span className="text-xs font-semibold text-navy-200">{label}</span>
                    </div>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-gold-400 hover:text-gold-300 truncate block">
                        {url.replace(/^https?:\/\//, '').substring(0, 35)}...
                      </a>
                    ) : (
                      <span className="text-[11px] text-navy-500">Não configurado</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Estado da integração Meta */}
            <div className="mt-4 pt-4 border-t border-navy-800">
              <p className="text-[11px] font-bold text-navy-200 flex items-center gap-2 mb-2">
                <Zap className="w-3.5 h-3.5 text-gold-400" />
                Estado da Publicação Automática
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(() => {
                  const ag = currentAgency as any;
                  const fbReady = !!ag?.facebookPageId && !!ag?.facebookPageAccessToken;
                  const igReady = !!ag?.instagramBusinessId && !!ag?.facebookPageAccessToken;
                  const waReady = !!ag?.whatsappPhoneNumberId && !!ag?.whatsappAccessToken;
                  return [
                    {
                      name: 'Facebook', ready: fbReady,
                      detail: fbReady ? 'Pronto para publicar' : 'Falta Page ID ou Access Token',
                    },
                    {
                      name: 'Instagram', ready: igReady,
                      detail: igReady ? 'Pronto para publicar' : 'Falta IG Business ID ou token',
                    },
                    {
                      name: 'WhatsApp', ready: waReady,
                      detail: waReady
                        ? (ag?.whatsappNotifyNumber ? `Notificações → ${ag.whatsappNotifyNumber}` : 'Pronto (falta nº de notificações)')
                        : 'Falta Phone Number ID ou token',
                    },
                  ].map(({ name, ready, detail }) => (
                    <div key={name} className={`flex items-center justify-between p-2.5 rounded-lg border ${
                      ready ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-navy-950 border-navy-700'
                    }`}>
                      <span className="text-xs font-semibold text-navy-200">{name}</span>
                      <span className={`flex items-center gap-1.5 text-[10px] font-bold ${
                        ready ? 'text-emerald-300' : 'text-navy-400'
                      }`}>
                        {ready ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {detail}
                      </span>
                    </div>
                  ));
                })()}
              </div>

              {(() => {
                const ag = currentAgency as any;
                const waReady = !!ag?.whatsappPhoneNumberId && !!ag?.whatsappAccessToken;
                if (!waReady) return null;
                return (
                  <div className="mt-3 flex items-center justify-between gap-3 p-3 rounded-xl bg-navy-950 border border-navy-700">
                    <span className="text-[10px] text-navy-300">
                      WhatsApp configurado. Envie uma mensagem de teste para o número de notificações.
                    </span>
                    <button
                      type="button"
                      onClick={handleWhatsAppTest}
                      disabled={whatsappTestBusy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all disabled:opacity-60 shrink-0"
                    >
                      {whatsappTestBusy ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      Enviar Teste WhatsApp
                    </button>
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>

      {/* Moderação de Condolências */}
      {isAdmin && (
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquareHeart className="w-4 h-4 text-gold-400" />
                Moderação de Condolências
              </h3>
              <p className="text-xs text-navy-300 mt-1 max-w-xl">
                Quando ativo, as mensagens do livro de condolências público só ficam visíveis
                depois de aprovadas na página{' '}
                <Link href="/condolences" className="text-gold-400 hover:text-gold-300 font-semibold">
                  Moderação de Condolências
                </Link>
                .
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={!!currentAgency?.condolenceModeration}
              disabled={moderationBusy}
              onClick={handleToggleModeration}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
                currentAgency?.condolenceModeration ? 'bg-gold-500' : 'bg-navy-700'
              }`}
            >
              {moderationBusy ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-navy-950 mx-auto" />
              ) : (
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    currentAgency?.condolenceModeration ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              )}
            </button>
          </div>
          <p className={`text-[10px] font-semibold ${currentAgency?.condolenceModeration ? 'text-emerald-300' : 'text-navy-400'}`}>
            {currentAgency?.condolenceModeration
              ? 'Ativo — novas condolências ficam pendentes até aprovação.'
              : 'Inativo — as condolências são publicadas imediatamente.'}
          </p>
        </div>
      )}

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
          <>
          <div className="divide-y divide-navy-800">
            {visibleUsers.map((user) => (
              <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between hover:bg-navy-800/50 transition-colors">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-navy-950 border border-gold-500/30 flex items-center justify-center text-xs font-bold text-gold-400 shrink-0">
                    {user.name.split(' ').filter(Boolean).map((part) => part[0]).join('').substring(0, 2).toUpperCase()}
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

                <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
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
          <div className="px-4 pb-4">
            <Pagination page={page} pageCount={usersPageCount} total={users.length} onPageChange={setPage} />
          </div>
          </>
        )}
      </div>

      {!isAdmin && (
        <p className="flex items-center gap-1.5 text-[11px] text-navy-400">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-500/70" />
          Apenas administradores podem gerir utilizadores e redes sociais.
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
    </div>
  );
}
