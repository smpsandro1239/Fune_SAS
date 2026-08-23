'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Megaphone,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Pencil,
  Trash2,
  ExternalLink,
  Facebook,
  Instagram,
  Link as LinkIcon,
  Twitter,
  Youtube,
  Music2,
  Send,
  Eye,
  XCircle,
} from 'lucide-react';
import { apiErrorMessage, apiService, ApiPublication, ApiFuneral, PublicationPlatform, PublicationStatus } from '@/lib/api';
import { useToast } from '@/components/Toast';

const PLATFORMS: { value: PublicationPlatform; label: string; icon: any; color: string }[] = [
  { value: 'FACEBOOK', label: 'Facebook', icon: Facebook, color: 'text-blue-400' },
  { value: 'INSTAGRAM', label: 'Instagram', icon: Instagram, color: 'text-pink-400' },
  { value: 'LINKEDIN', label: 'LinkedIn', icon: LinkIcon, color: 'text-blue-300' },
  { value: 'TWITTER', label: 'Twitter / X', icon: Twitter, color: 'text-sky-400' },
  { value: 'YOUTUBE', label: 'YouTube', icon: Youtube, color: 'text-red-400' },
  { value: 'TIKTOK', label: 'TikTok', icon: Music2, color: 'text-fuchsia-400' },
];

const STATUS_STYLES: Record<PublicationStatus, string> = {
  DRAFT: 'bg-navy-700 text-navy-200 border border-navy-600',
  SCHEDULED: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  PUBLISHING: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  PUBLISHED: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  FAILED: 'bg-red-500/20 text-red-300 border border-red-500/30',
  CANCELED: 'bg-navy-600 text-navy-300 border border-navy-500',
};

const STATUS_LABELS: Record<PublicationStatus, string> = {
  DRAFT: 'Rascunho',
  SCHEDULED: 'Agendada',
  PUBLISHING: 'A publicar...',
  PUBLISHED: 'Publicada',
  FAILED: 'Falhou',
  CANCELED: 'Cancelada',
};

const inputClass =
  'w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none text-xs';

export default function PublicationsPage() {
  const { toast } = useToast();
  const [publications, setPublications] = useState<ApiPublication[]>([]);
  const [funerals, setFunerals] = useState<ApiFuneral[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ApiPublication | null>(null);
  const [deleting, setDeleting] = useState<ApiPublication | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    title: '',
    caption: '',
    platform: 'FACEBOOK' as PublicationPlatform,
    funeralId: '',
    scheduledFor: '',
    imageUrl: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pubs, funs] = await Promise.all([
        apiService.publications.list(filter || undefined),
        apiService.funerals.list(),
      ]);
      setPublications(pubs);
      setFunerals(funs);
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível carregar publicações.'));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', caption: '', platform: 'FACEBOOK', funeralId: '', scheduledFor: '', imageUrl: '' });
    setShowModal(true);
  };

  const openEdit = (pub: ApiPublication) => {
    setEditing(pub);
    setForm({
      title: pub.title,
      caption: pub.caption,
      platform: pub.platform,
      funeralId: pub.funeralId || '',
      scheduledFor: pub.scheduledFor ? pub.scheduledFor.slice(0, 16) : '',
      imageUrl: pub.imageUrl || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (editing) {
        await apiService.publications.update(editing.id, {
          title: form.title,
          caption: form.caption,
          scheduledFor: form.scheduledFor || undefined,
        });
        toast('success', 'Publicação atualizada!');
      } else {
        await apiService.publications.create({
          title: form.title,
          caption: form.caption,
          platform: form.platform,
          funeralId: form.funeralId || undefined,
          scheduledFor: form.scheduledFor || undefined,
          imageUrl: form.imageUrl || undefined,
        });
        toast('success', 'Publicação criada!');
      }
      setShowModal(false);
      load();
    } catch (err) {
      const msg = apiErrorMessage(err, 'Não foi possível guardar a publicação.');
      setError(msg);
      toast('error', msg);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await apiService.publications.remove(deleting.id);
      setDeleting(null);
      toast('success', 'Publicação removida!');
      load();
    } catch (err) {
      toast('error', apiErrorMessage(err, 'Não foi possível remover.'));
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async (pub: ApiPublication, platform: string) => {
    setBusy(true);
    try {
      const result = await apiService.social.publish(pub.id, platform);
      if (result.success) {
        toast('success', `Publicado no ${platform} com sucesso!`);
      } else {
        toast('error', result.error || 'Falha ao publicar.');
      }
      load();
    } catch (err) {
      toast('error', apiErrorMessage(err, 'Falha ao publicar.'));
    } finally {
      setBusy(false);
    }
  };

  const getPlatformInfo = (platform: PublicationPlatform) =>
    PLATFORMS.find((p) => p.value === platform) || PLATFORMS[0];

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-gold-400" />
            Publicações Sociais
          </h1>
          <p className="text-xs text-navy-300">
            Crie e agende publicações para redes sociais diretamente da plataforma.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs shadow-lg transition-all hover:brightness-110"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Publicação</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-2">
        {(['', 'DRAFT', 'SCHEDULED', 'PUBLISHED', 'FAILED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
              filter === status
                ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                : 'bg-navy-900 text-navy-400 border border-navy-800 hover:text-white'
            }`}
          >
            {status === '' ? 'Todas' : STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
        </div>
      ) : publications.length === 0 ? (
        <div className="text-center py-16 text-navy-400 text-xs">
          <Megaphone className="w-10 h-10 mx-auto mb-3 text-navy-600" />
          <p className="font-semibold text-navy-300">Nenhuma publicação encontrada</p>
          <p className="mt-1">Crie a sua primeira publicação para redes sociais.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publications.map((pub) => {
            const platform = getPlatformInfo(pub.platform);
            const PlatformIcon = platform.icon;
            return (
              <div key={pub.id} className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-3 shadow-xl hover:border-navy-700 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <PlatformIcon className={`w-4 h-4 shrink-0 ${platform.color}`} />
                      <span className="text-[10px] font-semibold text-navy-400">{platform.label}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${STATUS_STYLES[pub.status]}`}>
                        {STATUS_LABELS[pub.status]}
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-sm truncate">{pub.title}</h3>
                    <p className="text-[11px] text-navy-400 line-clamp-2 mt-1">{pub.caption}</p>
                  </div>
                </div>

                {pub.funeral && (
                  <div className="flex items-center gap-2 text-[10px] text-navy-400">
                    <Calendar className="w-3 h-3" />
                    <span>{pub.funeral.deceased.fullName} — {new Date(pub.funeral.funeralDate).toLocaleDateString('pt-PT')}</span>
                  </div>
                )}

                {pub.scheduledFor && pub.status === 'SCHEDULED' && (
                  <div className="flex items-center gap-2 text-[10px] text-blue-300">
                    <Clock className="w-3 h-3" />
                    <span>Agendada para {new Date(pub.scheduledFor).toLocaleString('pt-PT')}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-navy-800">
                  {(pub.status === 'DRAFT' || pub.status === 'SCHEDULED') && (
                    <button
                      onClick={() => handlePublish(pub, pub.platform)}
                      disabled={busy}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gold-500/20 text-gold-300 text-[11px] font-semibold border border-gold-500/30 hover:bg-gold-500/30 disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>Publicar agora</span>
                    </button>
                  )}
                  {pub.status === 'PUBLISHED' && pub.externalPostId && (
                    <span className="flex items-center space-x-1.5 text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Publicado — {pub.externalPostId.substring(0, 12)}...</span>
                    </span>
                  )}
                  {pub.status === 'FAILED' && pub.errorMessage && (
                    <span className="flex items-center space-x-1.5 text-[10px] text-red-400">
                      <XCircle className="w-3 h-3" />
                      <span className="truncate">{pub.errorMessage.substring(0, 50)}</span>
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1">
                    {pub.status !== 'PUBLISHING' && (
                      <>
                        <button onClick={() => openEdit(pub)} className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-400 hover:text-gold-300 border border-navy-700" title="Editar">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => setDeleting(pub)} className="p-1.5 rounded-lg bg-navy-800 hover:bg-red-500/20 text-navy-400 hover:text-red-300 border border-navy-700" title="Remover">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: criar/editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-gold-400" />
                {editing ? 'Editar Publicação' : 'Nova Publicação'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Título *</label>
                <input
                  type="text"
                  placeholder="Ex: Funeral de João Silva"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Legenda / Texto *</label>
                <textarea
                  rows={3}
                  placeholder="Texto da publicação..."
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  className={inputClass}
                  required
                />
              </div>

              {!editing && (
                <div>
                  <label className="block text-navy-200 mb-1 font-semibold">Plataforma *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORMS.map(({ value, label, icon: Icon, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm({ ...form, platform: value })}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          form.platform === value
                            ? 'bg-gold-500/10 border-gold-500/50 text-gold-300'
                            : 'bg-navy-950 border-navy-700 text-navy-300 hover:border-navy-500'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                        <div className="text-[10px] font-semibold">{label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Funeral associado (opcional)</label>
                <select
                  value={form.funeralId}
                  onChange={(e) => setForm({ ...form, funeralId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Nenhum</option>
                  {funerals.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.deceased.fullName} — {new Date(f.funeralDate).toLocaleDateString('pt-PT')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Agendar para (opcional)</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={form.scheduledFor}
                    onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
                    className={`${inputClass} pr-10`}
                    style={{ colorScheme: 'dark' }}
                  />
                  <Calendar className="w-4 h-4 text-gold-400 absolute right-3 top-2 pointer-events-none" />
                </div>
                {form.scheduledFor && (
                  <p className="text-[10px] text-blue-300 mt-1">
                    A publicação será processada automaticamente na data/hora indicada.
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  <span>{editing ? 'Guardar' : 'Criar Publicação'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: confirmar remoção */}
      {deleting && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" />
                Remover Publicação
              </h2>
              <button onClick={() => setDeleting(null)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-navy-200 leading-relaxed">
              Tem a certeza que pretende remover a publicação <span className="font-bold text-white">&quot;{deleting.title}&quot;</span>?
            </p>
            <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
              <button onClick={() => setDeleting(null)} className="px-4 py-2 rounded-xl bg-navy-800 text-navy-300 font-semibold text-xs">
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
