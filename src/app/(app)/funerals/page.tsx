'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Calendar,
  MapPin,
  Clock,
  Palette,
  Loader2,
  AlertCircle,
  Trash2,
  Pencil,
  Globe,
  User,
  X,
  CheckCircle2,
  Flame,
  BookOpen,
  Send,
  Megaphone,
  Download,
} from 'lucide-react';
import {
  ApiFuneral,
  FuneralStatus,
  ServiceType,
  apiErrorMessage,
  apiService,
} from '@/lib/api';
import { useAgency } from '@/context/AgencyContext';
import DateTimePicker from '@/components/flyers/DateTimePicker';
import { combineDateAndTime } from '@/lib/date-utils';
import Pagination from '@/components/Pagination';

const FUNERALS_PAGE_SIZE = 9;

const STATUS_META: Record<FuneralStatus, { label: string; className: string }> = {
  SCHEDULED: {
    label: 'Agendado',
    className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  },
  IN_PROGRESS: {
    label: 'Em curso',
    className: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  },
  COMPLETED: {
    label: 'Concluído',
    className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  },
};

const SERVICE_LABELS: Record<ServiceType, string> = {
  CERIMONIA: 'Cerimónia',
  VELORIO: 'Velório',
  CREMACAO: 'Cremação',
  TRANSPORTE: 'Transporte',
  ACOLHIMENTO: 'Acolhimento',
  OUTRO: 'Outro',
};

const STATUS_OPTIONS: { value: FuneralStatus; label: string }[] = [
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'IN_PROGRESS', label: 'Em curso' },
  { value: 'COMPLETED', label: 'Concluído' },
];

const FILTER_OPTIONS: { value: FuneralStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos os Estados' },
  ...STATUS_OPTIONS,
];

interface FuneralForm {
  fullName: string;
  age: string;
  dateOfDeath: string;
  placeOfDeath: string;
  photoUrl: string;
  serviceType: ServiceType;
  funeralDate: string;
  funeralTime: string;
  locationParish: string;
  cemeteryLocation: string;
  wakeDate: string;
  wakeTime: string;
  wakeLocation: string;
  notes: string;
  status: FuneralStatus;
  publicNoticeEnabled: boolean;
}

const EMPTY_FORM: FuneralForm = {
  fullName: '',
  age: '',
  dateOfDeath: '',
  placeOfDeath: '',
  photoUrl: '',
  serviceType: 'CERIMONIA',
  funeralDate: '',
  funeralTime: '',
  locationParish: '',
  cemeteryLocation: '',
  wakeDate: '',
  wakeTime: '',
  wakeLocation: '',
  notes: '',
  status: 'SCHEDULED',
  publicNoticeEnabled: true,
};

function toForm(funeral: ApiFuneral): FuneralForm {
  return {
    fullName: funeral.deceased.fullName,
    age: funeral.deceased.age != null ? String(funeral.deceased.age) : '',
    dateOfDeath: funeral.deceased.dateOfDeath ? funeral.deceased.dateOfDeath.slice(0, 10) : '',
    placeOfDeath: funeral.deceased.placeOfDeath || '',
    photoUrl: funeral.deceased.photoUrl || '',
    serviceType: funeral.serviceType,
    funeralDate: funeral.funeralDate ? funeral.funeralDate.slice(0, 10) : '',
    funeralTime: funeral.funeralTime || '',
    locationParish: funeral.locationParish || '',
    cemeteryLocation: funeral.cemeteryLocation || '',
    wakeDate: funeral.wakeDate ? funeral.wakeDate.slice(0, 10) : '',
    wakeTime: funeral.wakeTime || '',
    wakeLocation: funeral.wakeLocation || '',
    notes: funeral.notes || '',
    status: funeral.status,
    publicNoticeEnabled: funeral.publicNoticeEnabled,
  };
}

function formatFuneralDate(funeral: ApiFuneral): string {
  const d = new Date(funeral.funeralDate);
  if (isNaN(d.getTime())) return '';
  const date = d.toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return funeral.funeralTime ? `${date} • ${funeral.funeralTime}` : date;
}

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400';

/** Escapa um valor para CSV (ponto e vírgula, compatível com Excel PT) */
function csvCell(value: string | number | null | undefined): string {
  const s = String(value ?? '');
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportFuneralsCsv(funerals: ApiFuneral[]) {
  const header = [
    'Falecido',
    'Idade',
    'Estado',
    'Servico',
    'Data Funeral',
    'Hora',
    'Paroquia/Igreja',
    'Cemiterio',
    'Velorio',
    'Data Obito',
  ];
  const rows = funerals.map((f) =>
    [
      f.deceased.fullName,
      f.deceased.age ?? '',
      STATUS_META[f.status]?.label ?? f.status,
      f.serviceType ? (SERVICE_LABELS[f.serviceType] ?? f.serviceType) : '',
      f.funeralDate ? new Date(f.funeralDate).toLocaleDateString('pt-PT') : '',
      f.funeralTime ?? '',
      f.locationParish ?? '',
      f.cemeteryLocation ?? '',
      f.wakeLocation ?? '',
      f.deceased.dateOfDeath ? new Date(f.deceased.dateOfDeath).toLocaleDateString('pt-PT') : '',
    ]
      .map(csvCell)
      .join(';'),
  );
  // BOM para o Excel respeitar os acentos
  const csv = '\uFEFF' + [header.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `funerais-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FuneralsPage() {
  const { currentAgency } = useAgency();

  const [funerals, setFunerals] = useState<ApiFuneral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FuneralStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState<null | { mode: 'create' } | { mode: 'edit'; funeral: ApiFuneral }>(null);
  const [form, setForm] = useState<FuneralForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleting, setDeleting] = useState<ApiFuneral | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const [sharing, setSharing] = useState<ApiFuneral | null>(null);
  const [shareForm, setShareForm] = useState({ title: '', caption: '', platform: 'FACEBOOK', scheduledFor: '' });
  const [shareDate, setShareDate] = useState('');
  const [shareTime, setShareTime] = useState('');
  const [shareBusy, setShareBusy] = useState(false);

  const loadFunerals = useCallback(async (search?: string, status?: FuneralStatus | 'ALL') => {
    setLoading(true);
    setError('');
    try {
      const params: { search?: string; status?: FuneralStatus } = {};
      if (search) params.search = search;
      if (status && status !== 'ALL') params.status = status;
      setFunerals(await apiService.funerals.list(params));
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível carregar os funerais.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFunerals();
  }, [loadFunerals]);

  useEffect(() => {
    const timer = setTimeout(() => loadFunerals(searchTerm || undefined, statusFilter), 350);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, loadFunerals]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setModal({ mode: 'create' });
  };

  const openEdit = (funeral: ApiFuneral) => {
    setForm(toForm(funeral));
    setFormError('');
    setModal({ mode: 'edit', funeral });
  };

  const closeModal = () => {
    if (saving) return;
    setModal(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.fullName.trim()) {
      setFormError('Indique o nome do falecido.');
      return;
    }
    if (!form.funeralDate) {
      setFormError('Indique a data do funeral.');
      return;
    }

    const deceasedData: Record<string, unknown> = {
      fullName: form.fullName.trim(),
      age: form.age ? Number(form.age) : undefined,
      dateOfDeath: form.dateOfDeath ? new Date(`${form.dateOfDeath}T12:00:00`).toISOString() : undefined,
      placeOfDeath: form.placeOfDeath || undefined,
      photoUrl: form.photoUrl || undefined,
    };

    const funeralData: Record<string, unknown> = {
      serviceType: form.serviceType,
      funeralDate: new Date(`${form.funeralDate}T${form.funeralTime || '12:00'}:00`).toISOString(),
      funeralTime: form.funeralTime || undefined,
      locationParish: form.locationParish || undefined,
      cemeteryLocation: form.cemeteryLocation || undefined,
      wakeDate: form.wakeDate
        ? new Date(`${form.wakeDate}T${form.wakeTime || '12:00'}:00`).toISOString()
        : undefined,
      wakeTime: form.wakeTime || undefined,
      wakeLocation: form.wakeLocation || undefined,
      notes: form.notes || undefined,
      status: form.status,
      publicNoticeEnabled: form.publicNoticeEnabled,
    };

    setSaving(true);
    try {
      if (modal?.mode === 'edit') {
        await apiService.funerals.update(modal.funeral.id, funeralData);
        await apiService.deceased.update(modal.funeral.deceasedId, deceasedData);
        setNotice('Funeral atualizado com sucesso.');
      } else {
        const deceased = await apiService.deceased.create(deceasedData);
        await apiService.funerals.create({ ...funeralData, deceasedId: deceased.id });
        setNotice('Funeral registado com sucesso.');
      }
      setModal(null);
      loadFunerals(searchTerm || undefined, statusFilter);
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Não foi possível guardar o funeral.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await apiService.funerals.remove(deleting.id);
      setNotice('Funeral removido.');
      setDeleting(null);
      loadFunerals(searchTerm || undefined, statusFilter);
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível remover o funeral.'));
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  const openShare = (funeral: ApiFuneral) => {
    setSharing(funeral);
    setShareDate('');
    setShareTime('');
    const pubUrl = currentAgency ? `/public/${currentAgency.slug}/${funeral.id}` : `/public/${funeral.id}`;
    setShareForm({
      title: `Funeral de ${funeral.deceased.fullName}`,
      caption: `Cerimónia funerária de ${funeral.deceased.fullName}${funeral.locationParish ? ` em ${funeral.locationParish}` : ''}, no dia ${new Date(funeral.funeralDate).toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.${funeral.funeralTime ? ` às ${funeral.funeralTime}` : ''} Acompanhe a participação em: ${typeof window !== 'undefined' ? window.location.origin : ''}${pubUrl}`,
      platform: 'FACEBOOK',
      scheduledFor: '',
    });
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharing) return;
    setShareBusy(true);
    try {
      const combined = combineDateAndTime(shareDate || null, shareTime || null);
      await apiService.publications.create({
        title: shareForm.title,
        caption: shareForm.caption,
        platform: shareForm.platform,
        funeralId: sharing.id,
        scheduledFor: combined ? combined.toISOString() : undefined,
      });
      setNotice('Publicação criada com sucesso! Pode geri-la em Publicações Sociais.');
      setSharing(null);
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível criar a publicação.'));
    } finally {
      setShareBusy(false);
    }
  };

  const counts = {
    total: funerals.length,
    scheduled: funerals.filter((f) => f.status === 'SCHEDULED').length,
    inProgress: funerals.filter((f) => f.status === 'IN_PROGRESS').length,
    completed: funerals.filter((f) => f.status === 'COMPLETED').length,
  };

  const pageCount = Math.max(1, Math.ceil(funerals.length / FUNERALS_PAGE_SIZE));
  const visibleFunerals = funerals.slice((page - 1) * FUNERALS_PAGE_SIZE, page * FUNERALS_PAGE_SIZE);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const set = (field: keyof FuneralForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-gold-400" />
            Gestão de Funerais & Falecidos
          </h1>
          <p className="text-xs text-navy-300">
            Registo centralizado de processos funerários, velórios e informações da agência.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportFuneralsCsv(funerals)}
            disabled={funerals.length === 0}
            title="Exporta a lista filtrada para Excel/CSV"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-navy-900 border border-navy-700 text-navy-200 font-semibold text-xs transition-all hover:border-gold-500/40 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={openCreate}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs shadow-lg shadow-gold-500/10 transition-all hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
          >
            <Plus className="w-4 h-4" />
            <span>Registar Novo Funeral</span>
          </button>
        </div>
      </div>

      {/* Stats chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-navy-900/80 border border-navy-800">
          <p className="text-[10px] uppercase tracking-wider text-navy-400 font-semibold">Total</p>
          <p className="text-lg font-bold text-white">{counts.total}</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-[10px] uppercase tracking-wider text-amber-300/70 font-semibold">Agendados</p>
          <p className="text-lg font-bold text-amber-300">{counts.scheduled}</p>
        </div>
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-[10px] uppercase tracking-wider text-blue-300/70 font-semibold">Em curso</p>
          <p className="text-lg font-bold text-blue-300">{counts.inProgress}</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-[10px] uppercase tracking-wider text-emerald-300/70 font-semibold">Concluídos</p>
          <p className="text-lg font-bold text-emerald-300">{counts.completed}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-navy-900/80 border border-navy-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar por nome do falecido..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as FuneralStatus | 'ALL'); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none w-full sm:w-auto"
        >
          {FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3">
          <p className="text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </p>
          <button
            onClick={() => loadFunerals(searchTerm || undefined, statusFilter)}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-[11px] font-semibold transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-300 font-medium">{notice}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-navy-400 space-y-3">
          <Loader2 className="w-7 h-7 text-gold-400 animate-spin" />
          <p className="text-xs">A carregar funerais...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && funerals.length === 0 && (
        <div className="p-10 rounded-2xl border border-dashed border-navy-700 text-center space-y-2">
          <Flame className="w-8 h-8 text-navy-600 mx-auto" />
          <p className="text-sm font-semibold text-navy-200">Sem funerais registados</p>
          <p className="text-xs text-navy-400">
            {searchTerm || statusFilter !== 'ALL'
              ? 'Nenhum resultado para os filtros atuais.'
              : 'Registe o primeiro funeral para começar.'}
          </p>
        </div>
      )}

      {/* Funerals Grid */}
      {!loading && !error && funerals.length > 0 && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleFunerals.map((funeral) => {
            const statusMeta = STATUS_META[funeral.status];
            const publicUrl = currentAgency
              ? `/public/${currentAgency.slug}/${funeral.id}`
              : `/public/${funeral.id}`;
            return (
              <div
                key={funeral.id}
                className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-4 hover:border-gold-500/30 transition-all shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-20 rounded-xl overflow-hidden border border-gold-500/30 shrink-0 bg-navy-950 flex items-center justify-center">
                      {funeral.deceased.photoUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={funeral.deceased.photoUrl}
                          alt={funeral.deceased.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-navy-600" />
                      )}
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold inline-block ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                      <h3 className="font-bold text-white text-sm tracking-tight truncate uppercase">
                        {funeral.deceased.fullName}
                      </h3>
                      {funeral.deceased.age != null && (
                        <p className="text-xs text-gold-400 font-semibold">{funeral.deceased.age} ANOS</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-navy-300 pt-2 border-t border-navy-800">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                      <span className="truncate">{formatFuneralDate(funeral)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                      <span className="truncate">{funeral.locationParish || 'Local por definir'}</span>
                    </div>

                    {funeral.cemeteryLocation && (
                      <div className="flex items-center space-x-2">
                        <Flame className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                        <span className="truncate">{funeral.cemeteryLocation}</span>
                      </div>
                    )}

                    {funeral.wakeLocation && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                        <span className="truncate">
                          Velório: {funeral.wakeDate
                            ? new Date(funeral.wakeDate).toLocaleDateString('pt-PT', {
                                day: '2-digit',
                                month: '2-digit',
                              })
                            : ''}{' '}
                          {funeral.wakeTime || ''} — {funeral.wakeLocation}
                        </span>
                      </div>
                    )}

                    {funeral.serviceType && (
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                        <span className="truncate">Serviço: {SERVICE_LABELS[funeral.serviceType]}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-navy-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Link
                      href="/flyers"
                      className="px-3 py-1.5 rounded-lg bg-gold-500/15 hover:bg-gold-500/25 border border-gold-500/30 text-gold-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Flyer</span>
                    </Link>

                    <button
                      onClick={() => openShare(funeral)}
                      className="px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      title="Partilhar nas redes sociais"
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>Partilhar</span>
                    </button>

                    <button
                      onClick={() => openEdit(funeral)}
                      aria-label={`Editar funeral de ${funeral.deceased.fullName}`}
                      className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-600 text-navy-300 hover:text-white transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleting(funeral)}
                      aria-label={`Apagar funeral de ${funeral.deceased.fullName}`}
                      className="p-1.5 rounded-lg bg-navy-800 hover:bg-red-500/20 border border-navy-600 text-navy-300 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {funeral.publicNoticeEnabled ? (
                    <Link
                      href={publicUrl}
                      target="_blank"
                      className="text-xs text-navy-300 hover:text-white underline underline-offset-2 flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      Página Pública
                    </Link>
                  ) : (
                    <span
                      title="Participação pública desativada neste funeral"
                      className="text-[10px] text-navy-500 flex items-center gap-1 cursor-not-allowed"
                    >
                      <Globe className="w-3 h-3" />
                      Privado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <Pagination
          page={page}
          pageCount={pageCount}
          total={funerals.length}
          onPageChange={setPage}
        />
        </>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-navy-900 border border-navy-700 rounded-2xl p-5 sm:p-6 max-w-2xl w-full space-y-4 shadow-2xl my-4"
          >
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {modal.mode === 'edit' ? (
                  <Pencil className="w-4 h-4 text-gold-400" />
                ) : (
                  <Plus className="w-4 h-4 text-gold-400" />
                )}
                {modal.mode === 'edit' ? 'Editar Funeral' : 'Registar Novo Funeral'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="text-navy-400 hover:text-white text-xs disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-navy-950 border border-gold-500/20 space-y-3">
                <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Falecido</p>
                <div>
                  <label htmlFor="funeral-fullName" className="block text-navy-200 mb-1 font-medium">Nome do Falecido *</label>
                  <input
                    id="funeral-fullName"
                    type="text"
                    required
                    placeholder="Ex: MANUEL ANTONIO DA SILVA"
                    value={form.fullName}
                    onChange={set('fullName')}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-navy-200 mb-1 font-medium">Idade</label>
                    <input
                      type="number"
                      min={0}
                      max={130}
                      placeholder="78"
                      value={form.age}
                      onChange={set('age')}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-navy-200 mb-1 font-medium">Data do Óbito</label>
                    <input type="date" value={form.dateOfDeath} onChange={set('dateOfDeath')} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-navy-200 mb-1 font-medium">Local do Óbito</label>
                  <input
                    type="text"
                    placeholder="Ex: Hospital de Braga"
                    value={form.placeOfDeath}
                    onChange={set('placeOfDeath')}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-navy-200 mb-1 font-medium">URL da Fotografia (opcional)</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.pt/foto.jpg"
                    value={form.photoUrl}
                    onChange={set('photoUrl')}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-gold-500/20 space-y-3">
                <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Cerimónia Funerária</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-navy-200 mb-1 font-medium">Tipo de Serviço</label>
                    <select value={form.serviceType} onChange={set('serviceType')} className={inputClass}>
                      {Object.entries(SERVICE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-navy-200 mb-1 font-medium">Estado</label>
                    <select value={form.status} onChange={set('status')} className={inputClass}>
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="funeral-funeralDate" className="block text-navy-200 mb-1 font-medium">Data do Funeral *</label>
                    <input id="funeral-funeralDate" type="date" required value={form.funeralDate} onChange={set('funeralDate')} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-navy-200 mb-1 font-medium">Hora</label>
                    <input type="time" value={form.funeralTime} onChange={set('funeralTime')} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-navy-200 mb-1 font-medium">Igreja Paroquial / Local</label>
                  <input
                    type="text"
                    placeholder="Igreja de São Victor, Braga"
                    value={form.locationParish}
                    onChange={set('locationParish')}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-navy-200 mb-1 font-medium">Cemitério</label>
                  <input
                    type="text"
                    placeholder="Cemitério Municipal, Braga"
                    value={form.cemeteryLocation}
                    onChange={set('cemeteryLocation')}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-gold-500/20 space-y-3">
                <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Velório</p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-navy-200 mb-1 font-medium">Data</label>
                    <input type="date" value={form.wakeDate} onChange={set('wakeDate')} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-navy-200 mb-1 font-medium">Hora</label>
                    <input type="time" value={form.wakeTime} onChange={set('wakeTime')} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-navy-200 mb-1 font-medium">Local</label>
                  <input
                    type="text"
                    placeholder="Capela Mortuária"
                    value={form.wakeLocation}
                    onChange={set('wakeLocation')}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-navy-200 mb-1 font-medium">Observações</label>
                  <textarea
                    rows={2}
                    placeholder="Notas internas sobre o processo..."
                    value={form.notes}
                    onChange={set('notes')}
                    className={inputClass}
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.publicNoticeEnabled}
                    onChange={(e) => setForm((prev) => ({ ...prev, publicNoticeEnabled: e.target.checked }))}
                    className="w-4 h-4 rounded border-navy-600 accent-gold-500"
                  />
                  <span className="text-xs text-navy-200">
                    Publicar participação pública (página partilhável)
                  </span>
                </label>
              </div>
            </div>

            {formError && (
              <p className="text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {formError}
              </p>
            )}

            <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-navy-800 text-navy-300 text-xs font-semibold hover:bg-navy-700 transition-colors disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 text-xs font-bold shadow-lg shadow-gold-500/10 hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {modal.mode === 'edit' ? 'Guardar Alterações' : 'Registar Funeral'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirmation */}
      {deleting && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <h2 className="text-base font-bold text-white">Remover Funeral</h2>
            </div>
            <p className="text-xs text-navy-300 leading-relaxed">
              Tem a certeza que pretende remover o funeral de{' '}
              <span className="text-white font-semibold">{deleting.deceased.fullName}</span>? Esta ação não pode
              ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleting(null)}
                disabled={deleteBusy}
                className="px-4 py-2 rounded-lg bg-navy-800 text-navy-300 text-xs font-semibold hover:bg-navy-700 transition-colors disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteBusy}
                className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleteBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share modal */}
      {sharing && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleShare} className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-blue-400" />
                Partilhar Funeral
              </h2>
              <button type="button" onClick={() => setSharing(null)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-navy-300">
              Criar uma publicação para <span className="font-bold text-white">{sharing.deceased.fullName}</span> nas redes sociais.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Plataforma</label>
                <select
                  value={shareForm.platform}
                  onChange={(e) => setShareForm({ ...shareForm, platform: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none"
                >
                  <option value="FACEBOOK">Facebook</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="TWITTER">Twitter / X</option>
                </select>
              </div>

              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Título</label>
                <input
                  type="text"
                  value={shareForm.title}
                  onChange={(e) => setShareForm({ ...shareForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Texto da publicação</label>
                <textarea
                  rows={4}
                  value={shareForm.caption}
                  onChange={(e) => setShareForm({ ...shareForm, caption: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none"
                  required
                />
              </div>

              <DateTimePicker
                id="share-schedule"
                label="Agendar (opcional)"
                date={shareDate || null}
                time={shareTime || null}
                onDateChange={setShareDate}
                onTimeChange={setShareTime}
              />
            </div>

            <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
              <button type="button" onClick={() => setSharing(null)} className="px-4 py-2 rounded-xl bg-navy-800 text-navy-300 font-semibold text-xs">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={shareBusy}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs shadow flex items-center space-x-1.5 disabled:opacity-60"
              >
                {shareBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <Send className="w-3.5 h-3.5" />
                <span>Criar Publicação</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}