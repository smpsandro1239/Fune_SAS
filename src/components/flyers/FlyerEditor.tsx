'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlyerData, FlyerFontFamily, FlyerTemplateConfig } from '@/lib/types';
import { PRESET_TEMPLATES, DEFAULT_FLYER_DATA } from '@/lib/templates-preset';
import { combineDateAndTime, formatPTDate, toISODate } from '@/lib/date-utils';
import FlyerCanvasPreview from './FlyerCanvasPreview';
import TemplateGallery from './TemplateGallery';
import DateTimePicker from './DateTimePicker';
import ImageUploader from './ImageUploader';
import PhotoAdjuster, { DEFAULT_PHOTO_TRANSFORM } from './PhotoAdjuster';
import {
  Building2,
  Calendar,
  Check,
  Download,
  FileText,
  ImageIcon,
  Keyboard,
  Loader2,
  Palette,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  Trash2,
  Type,
  User,
  X,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { useAgency } from '@/context/AgencyContext';
import { ApiFuneral, apiService } from '@/lib/api';

type EditorTab = 'deceased' | 'ceremony' | 'agency' | 'style';

const FONT_OPTIONS: { value: FlyerFontFamily; label: string; preview: string }[] = [
  { value: 'sans', label: 'Moderna (Sans)', preview: 'font-sans' },
  { value: 'serif', label: 'Clássica (Serif)', preview: 'font-serif' },
  { value: 'display', label: 'Elegante (Display)', preview: '[font-family:var(--font-display)]' },
];

function agencyFlyerDefaults(agency: ReturnType<typeof useAgency>['currentAgency']) {
  return {
    agencyName: agency?.name || DEFAULT_FLYER_DATA.agencyName,
    agencyAddress: agency?.address || DEFAULT_FLYER_DATA.agencyAddress,
    agencyLocation: agency?.location || DEFAULT_FLYER_DATA.agencyLocation,
    agencyFounded: agency?.foundedYear || DEFAULT_FLYER_DATA.agencyFounded,
    agencyWebsite: agency?.website || DEFAULT_FLYER_DATA.agencyWebsite,
    agencyInitials: agency?.initials || 'CH',
    agencyLogoType: agency?.logoType || 'INITIALS',
  };
}

export default function FlyerEditor() {
  const { currentAgency } = useAgency();

  const [selectedTemplate, setSelectedTemplate] = useState<FlyerTemplateConfig>(PRESET_TEMPLATES[0]);
  const [flyerData, setFlyerData] = useState<FlyerData>({
    ...DEFAULT_FLYER_DATA,
    ...agencyFlyerDefaults(currentAgency),
  });
  const [activeTab, setActiveTab] = useState<EditorTab>('deceased');
  const [isExporting, setIsExporting] = useState<null | 'png' | 'pdf'>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<'ok' | 'error' | null>(null);
  const [scale, setScale] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 700
      ? Math.max(0.35, (window.innerWidth - 96) / 544)
      : 1,
  );

  const [funerals, setFunerals] = useState<ApiFuneral[]>([]);
  const [funeralsLoading, setFuneralsLoading] = useState(true);
  const [selectedFuneralId, setSelectedFuneralId] = useState('');

  const [drafts, setDrafts] = useState<{ id: string; name: string; layoutStyle: string; createdAt: string; updatedAt: string }[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareForm, setShareForm] = useState({ title: '', caption: '', platform: 'FACEBOOK', scheduledFor: '' });
  const [shareDate, setShareDate] = useState('');
  const [shareTime, setShareTime] = useState('');
  const [shareBusy, setShareBusy] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 520;
      setScale(Math.min(1, Math.max(0.35, (width - 24) / 544)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!currentAgency) return;
    setFlyerData((prev) => ({ ...prev, ...agencyFlyerDefaults(currentAgency) }));
  }, [currentAgency]);

  useEffect(() => {
    let cancelled = false;
    apiService.funerals
      .list()
      .then((list) => {
        if (!cancelled) setFunerals(list);
      })
      .catch(() => {
        // API indisponível: o editor continua com dados manuais
      })
      .finally(() => {
        if (!cancelled) setFuneralsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadDrafts = async () => {
    setDraftsLoading(true);
    try {
      const list = await apiService.drafts.list();
      setDrafts(list);
    } catch {
      // API indisponível
    } finally {
      setDraftsLoading(false);
    }
  };

  const saveDraft = async () => {
    if (!draftName.trim()) return;
    setSavingDraft(true);
    try {
      if (currentDraftId) {
        await apiService.drafts.update(currentDraftId, draftName.trim(), selectedTemplate.layoutStyle, flyerData);
        setExportMessage('Rascunho atualizado com sucesso!');
      } else {
        const result = await apiService.drafts.save(draftName.trim(), selectedTemplate.layoutStyle, flyerData);
        setCurrentDraftId(result.id);
        setExportMessage('Rascunho guardado com sucesso!');
      }
      setExportStatus('ok');
      loadDrafts();
    } catch {
      setExportMessage('Erro ao guardar rascunho.');
      setExportStatus('error');
    } finally {
      setSavingDraft(false);
      setTimeout(() => setExportMessage(null), 3000);
    }
  };

  const loadDraft = async (id: string) => {
    try {
      const draft = await apiService.drafts.get(id);
      setFlyerData(draft.data as FlyerData);
      setCurrentDraftId(draft.id);
      setDraftName(draft.name);
      const tmpl = PRESET_TEMPLATES.find((t) => t.layoutStyle === draft.layoutStyle);
      if (tmpl) {
        setSelectedTemplate(tmpl);
        setFlyerData((prev) => ({ ...prev, primaryColor: tmpl.primaryColor, accentColor: tmpl.accentColor, fontFamily: tmpl.fontFamily }));
      }
      setShowDraftsModal(false);
      setExportMessage(`Rascunho "${draft.name}" carregado.`);
      setExportStatus('ok');
      setTimeout(() => setExportMessage(null), 2500);
    } catch {
      setExportMessage('Erro ao carregar rascunho.');
      setExportStatus('error');
      setTimeout(() => setExportMessage(null), 3000);
    }
  };

  const deleteDraft = async (id: string) => {
    try {
      await apiService.drafts.delete(id);
      if (currentDraftId === id) { setCurrentDraftId(null); setDraftName(''); }
      loadDrafts();
    } catch {
      // silently fail
    }
  };

  const applyFuneral = (funeral: ApiFuneral) => {
    const d = funeral.funeralDate ? new Date(funeral.funeralDate) : null;
    const wakeDetails = composeWakeDetails(funeral.wakeDate || '', funeral.wakeTime || '', funeral.wakeLocation || '');
    setFlyerData({
      ...flyerData,
      deceasedName: funeral.deceased.fullName || flyerData.deceasedName,
      age: funeral.deceased.age ?? flyerData.age,
      photoUrl: funeral.deceased.photoUrl || flyerData.photoUrl,
      photoDataUrl: funeral.deceased.photoUrl ? undefined : flyerData.photoDataUrl,
      funeralDate: d ? toISODate(d) : flyerData.funeralDate,
      funeralTime: funeral.funeralTime || flyerData.funeralTime,
      funeralDateFormatted: d ? formatPTDate(d, true) : flyerData.funeralDateFormatted,
      parishLocation: funeral.locationParish || flyerData.parishLocation,
      cemeteryLocation: funeral.cemeteryLocation || flyerData.cemeteryLocation,
      deathLocation: funeral.deceased.placeOfDeath || flyerData.deathLocation,
      wakeDate: funeral.wakeDate ? funeral.wakeDate.slice(0, 10) : flyerData.wakeDate,
      wakeTime: funeral.wakeTime || flyerData.wakeTime,
      wakeLocation: funeral.wakeLocation || flyerData.wakeLocation,
      wakeDetailsFormatted: wakeDetails || flyerData.wakeDetailsFormatted,
    });
    setExportMessage(`Dados de ${funeral.deceased.fullName} carregados.`);
    setExportStatus('ok');
    setTimeout(() => setExportMessage(null), 2500);
  };

  const handleChange = useCallback((field: keyof FlyerData, value: unknown) => {
    setFlyerData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleTemplateSelect = (tmpl: FlyerTemplateConfig) => {
    setSelectedTemplate(tmpl);
    setFlyerData((prev) => ({
      ...prev,
      primaryColor: tmpl.primaryColor,
      accentColor: tmpl.accentColor,
      fontFamily: tmpl.fontFamily,
    }));
    setExportMessage(null);
  };

  const handleFuneralDate = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return;
    setFlyerData((prev) => {
      const funeralDate = toISODate(d);
      const combined = combineDateAndTime(funeralDate, prev.funeralTime);
      return {
        ...prev,
        funeralDate,
        funeralDateFormatted: combined ? formatPTDate(combined, true) : prev.funeralDateFormatted,
      };
    });
  };

  const handleFuneralTime = (time: string) => {
    setFlyerData((prev) => {
      const combined = combineDateAndTime(prev.funeralDate, time);
      return {
        ...prev,
        funeralTime: time,
        funeralDateFormatted: combined ? formatPTDate(combined, true) : prev.funeralDateFormatted,
      };
    });
  };

  const composeWakeDetails = (wakeDate?: string, wakeTime?: string, wakeLocation?: string) => {
    const d = combineDateAndTime(wakeDate, wakeTime);
    if (!d) return '';
    const location = wakeLocation ? `, na ${wakeLocation}` : '';
    return `${formatPTDate(d, true)}${location}`;
  };

  const handleWakeDate = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return;
    setFlyerData((prev) => {
      const wakeDate = toISODate(d);
      return { ...prev, wakeDate, wakeDetailsFormatted: composeWakeDetails(wakeDate, prev.wakeTime, prev.wakeLocation) };
    });
  };

  const handleWakeTime = (time: string) => {
    setFlyerData((prev) => ({
      ...prev,
      wakeTime: time,
      wakeDetailsFormatted: composeWakeDetails(prev.wakeDate, time, prev.wakeLocation),
    }));
  };

  const handleWakeLocation = (wakeLocation: string) => {
    setFlyerData((prev) => ({
      ...prev,
      wakeLocation,
      wakeDetailsFormatted: composeWakeDetails(prev.wakeDate, prev.wakeTime, wakeLocation),
    }));
  };

  const handleRestoreDefaults = () => {
    setFlyerData({
      ...DEFAULT_FLYER_DATA,
      ...agencyFlyerDefaults(currentAgency),
      primaryColor: selectedTemplate.primaryColor,
      accentColor: selectedTemplate.accentColor,
      fontFamily: selectedTemplate.fontFamily,
    });
    setSelectedFuneralId('');
    setExportMessage('Dados de exemplo restaurados.');
    setExportStatus('ok');
    setTimeout(() => setExportMessage(null), 2500);
  };

  const exportFile = async (format: 'png' | 'pdf') => {
    if (!previewRef.current) return;
    setIsExporting(format);
    setExportStatus(null);
    setExportMessage(
      format === 'png'
        ? 'A gerar imagem PNG de alta resolução (300 DPI)...'
        : 'A preparar documento PDF de alta resolução (300 DPI)...'
    );
    try {
      const pixelRatio = format === 'pdf' ? 4 : 2;
      const dataUrl = await toPng(previewRef.current, { quality: 1.0, pixelRatio, cacheBust: true });
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = `Flyer_${flyerData.deceasedName.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
        setExportMessage('PNG exportado com sucesso! (2x resolução)');
      } else {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'MEDIUM');
        pdf.save(`Participacao_${flyerData.deceasedName.replace(/\s+/g, '_')}.pdf`);
        setExportMessage('PDF de alta resolução gerado com sucesso! (300 DPI)');
      }
      setExportStatus('ok');
    } catch (err) {
      console.error(err);
      setExportMessage(format === 'png' ? 'Erro ao exportar PNG.' : 'Erro ao exportar PDF.');
      setExportStatus('error');
    } finally {
      setIsExporting(null);
      setTimeout(() => setExportMessage(null), 3000);
    }
  };

  const openShare = () => {
    setShareDate('');
    setShareTime('');
    setShareForm({
      title: flyerData.deceasedName ? `Participação de ${flyerData.deceasedName}` : 'Participação Funerária',
      caption: flyerData.deceasedName
        ? `Falecimento de ${flyerData.deceasedName}.${flyerData.funeralDate ? ` Cerimónia no dia ${flyerData.funeralDate}.` : ''}${flyerData.parishLocation ? ` Local: ${flyerData.parishLocation}.` : ''} Pela presença de todos é honrado o seu nome.`
        : 'Participação de falecimento.',
      platform: 'FACEBOOK',
      scheduledFor: '',
    });
    setShowShareModal(true);
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setShareBusy(true);
    try {
      const combined = combineDateAndTime(shareDate || null, shareTime || null);
      await apiService.publications.create({
        title: shareForm.title,
        caption: shareForm.caption,
        platform: shareForm.platform,
        funeralId: selectedFuneralId || undefined,
        scheduledFor: combined ? combined.toISOString() : undefined,
      });
      setShowShareModal(false);
      setExportMessage('Publicação criada com sucesso!');
      setExportStatus('ok');
      setTimeout(() => setExportMessage(null), 3000);
    } catch (err) {
      setExportMessage('Erro ao criar publicação.');
      setExportStatus('error');
      setTimeout(() => setExportMessage(null), 3000);
    } finally {
      setShareBusy(false);
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        void exportFile('pdf');
      } else if (key === 'e') {
        e.preventDefault();
        void exportFile('png');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const tabs: { key: EditorTab; label: string; icon: React.ReactNode }[] = [
    { key: 'deceased', label: 'Falecido & Foto', icon: <User className="w-3.5 h-3.5" /> },
    { key: 'ceremony', label: 'Cerimónia', icon: <Calendar className="w-3.5 h-3.5" /> },
    { key: 'agency', label: 'Logótipo & Marca', icon: <Building2 className="w-3.5 h-3.5" /> },
    { key: 'style', label: 'Estilo', icon: <Type className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Editor Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-navy-900/90 border border-navy-700/80 backdrop-blur-md shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
              Editor Visual de Flyers &amp; Participações
              <span className="px-2 py-0.5 rounded text-[10px] bg-gold-500/20 text-gold-300 font-semibold border border-gold-500/30">
                Flyer Studio HD
              </span>
            </h1>
            <p className="text-xs text-navy-300 flex items-center gap-1.5">
              <Keyboard className="w-3 h-3" />
              Atalhos: <kbd className="px-1 rounded bg-navy-800 border border-navy-600 text-[9px] font-mono">Ctrl+S</kbd> PDF •{' '}
              <kbd className="px-1 rounded bg-navy-800 border border-navy-600 text-[9px] font-mono">Ctrl+E</kbd> PNG
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <User className="w-3.5 h-3.5 text-navy-400 absolute left-3 top-2.5 pointer-events-none" />
              <select
                aria-label="Carregar dados de um funeral real"
                value={selectedFuneralId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedFuneralId(id);
                  const funeral = funerals.find((f) => f.id === id);
                  if (funeral) applyFuneral(funeral);
                }}
                className="pl-8 pr-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-600 text-xs font-medium text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 max-w-[220px]"
              >
                <option value="">Carregar de Funeral...</option>
                {funerals.map((funeral) => (
                  <option key={funeral.id} value={funeral.id}>
                    {funeral.deceased.fullName}
                    {funeral.funeralDate
                      ? ` — ${new Date(funeral.funeralDate).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
                      : ''}
                  </option>
                ))}
              </select>
              {funeralsLoading && (
                <Loader2 className="w-3.5 h-3.5 text-gold-400 animate-spin absolute right-3 top-2.5" />
              )}
            </div>
          </div>

          <button
            onClick={handleRestoreDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-600 text-xs font-medium text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <RefreshCw className="w-3.5 h-3.5 text-navy-300" />
            <span>Repor Exemplo</span>
          </button>

          <div className="h-6 w-px bg-navy-700 mx-1 hidden sm:block"></div>

          <button
            onClick={() => { setShowDraftsModal(true); loadDrafts(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-600 text-xs font-medium text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <FileText className="w-3.5 h-3.5 text-navy-300" />
            <span>Rascunhos</span>
          </button>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Nome do rascunho..."
              className="w-[140px] px-2 py-1.5 rounded-lg bg-navy-950 border border-navy-700 text-white text-[11px] focus:border-gold-400 focus:outline-none"
            />
            <button
              onClick={saveDraft}
              disabled={savingDraft || !draftName.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-600 text-xs font-medium text-white transition-all disabled:opacity-50"
            >
              {savingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-navy-300" />}
              <span>{currentDraftId ? 'Atualizar' : 'Guardar'}</span>
            </button>
          </div>

          <div className="h-6 w-px bg-navy-700 mx-1 hidden sm:block"></div>

          <button
            onClick={() => void exportFile('png')}
            disabled={isExporting !== null}
            aria-label="Exportar flyer como imagem PNG"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-600 text-xs font-medium text-white transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            {isExporting === 'png' ? (
              <Loader2 className="w-4 h-4 text-gold-400 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4 text-gold-400" />
            )}
            <span>Exportar PNG</span>
          </button>

          <button
            onClick={() => void exportFile('pdf')}
            disabled={isExporting !== null}
            aria-label="Exportar flyer como PDF para impressão"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-gold-500 to-amber-400 hover:from-gold-400 hover:to-amber-300 text-navy-950 text-xs font-bold transition-all shadow-md shadow-gold-500/20 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
          >
            {isExporting === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Descarregar PDF</span>
          </button>

          <button
            onClick={openShare}
            disabled={isExporting !== null}
            aria-label="Partilhar flyer nas redes sociais"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Partilhar</span>
          </button>
        </div>
      </div>

      {/* Export status banner */}
      <AnimatePresence>
        {exportMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            role="status"
            className={`p-3 rounded-xl border flex items-center justify-between ${
              exportStatus === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-gold-500/15 border-gold-500/30 text-gold-300'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-medium">
              {exportStatus === 'ok' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{exportMessage}</span>
            </div>
            {isExporting && <Loader2 className="w-4 h-4 animate-spin" />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template Gallery */}
      <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl">
        <TemplateGallery
          templates={PRESET_TEMPLATES}
          selectedId={selectedTemplate.id}
          onSelect={handleTemplateSelect}
          previewData={flyerData}
        />
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Controls */}
        <div className="lg:col-span-6 space-y-4 bg-navy-900/80 border border-navy-800 rounded-2xl p-5 shadow-xl">
          <div role="tablist" aria-label="Secções do editor" className="flex flex-wrap rounded-xl bg-navy-950 p-1 border border-navy-800">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                  activeTab === tab.key
                    ? 'bg-navy-800 text-gold-300 shadow border border-gold-500/20'
                    : 'text-navy-400 hover:text-white'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              {/* TAB 1: Falecido & Foto */}
              {activeTab === 'deceased' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="flyer-title" className="block text-xs font-semibold text-navy-200 mb-1">
                      Título do Anúncio
                    </label>
                    <input
                      id="flyer-title"
                      type="text"
                      value={flyerData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="flyer-name" className="block text-xs font-semibold text-navy-200 mb-1">
                      Nome Completo do Falecido
                    </label>
                    <input
                      id="flyer-name"
                      type="text"
                      value={flyerData.deceasedName}
                      onChange={(e) => handleChange('deceasedName', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs font-bold uppercase focus:border-gold-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="flyer-age" className="block text-xs font-semibold text-navy-200 mb-1">
                        Idade (Anos)
                      </label>
                      <input
                        id="flyer-age"
                        type="number"
                        min={0}
                        max={130}
                        value={flyerData.age}
                        onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400"
                      />
                    </div>

                    <div>
                      <label htmlFor="flyer-death-location" className="block text-xs font-semibold text-navy-200 mb-1">
                        Local do Óbito
                      </label>
                      <input
                        id="flyer-death-location"
                        type="text"
                        value={flyerData.deathLocation}
                        onChange={(e) => handleChange('deathLocation', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400"
                      />
                    </div>
                  </div>

                  <ImageUploader
                    id="flyer-photo"
                    label="Fotografia do Falecido"
                    description="Carregue a fotografia para o flyer"
                    value={flyerData.photoDataUrl}
                    onUpload={(base64) => {
                      handleChange('photoDataUrl', base64);
                      handleChange('photoTransform', DEFAULT_PHOTO_TRANSFORM);
                    }}
                    onClear={() => {
                      handleChange('photoDataUrl', undefined);
                      handleChange('photoTransform', DEFAULT_PHOTO_TRANSFORM);
                    }}
                  />

                  <div>
                    <label htmlFor="flyer-photo-url" className="block text-xs font-semibold text-navy-200 mb-1">
                      Ou URL da Fotografia (avançado)
                    </label>
                    <input
                      id="flyer-photo-url"
                      type="url"
                      value={flyerData.photoUrl}
                      onChange={(e) => {
                        handleChange('photoUrl', e.target.value);
                        handleChange('photoTransform', DEFAULT_PHOTO_TRANSFORM);
                      }}
                      placeholder="https://exemplo.pt/foto.jpg"
                      className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400"
                    />
                  </div>

                  {(flyerData.photoDataUrl || flyerData.photoUrl) && (
                    <PhotoAdjuster
                      transform={flyerData.photoTransform || DEFAULT_PHOTO_TRANSFORM}
                      onChange={(t) => handleChange('photoTransform', t)}
                    />
                  )}
                </div>
              )}

              {/* TAB 2: Cerimónia */}
              {activeTab === 'ceremony' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-navy-950 border border-gold-500/20 space-y-3">
                    <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Cerimónia Funerária</p>
                    <DateTimePicker
                      id="flyer-funeral-date"
                      label="Data e Hora do Funeral"
                      date={flyerData.funeralDate}
                      time={flyerData.funeralTime}
                      onDateChange={handleFuneralDate}
                      onTimeChange={handleFuneralTime}
                    />
                    <div>
                      <label htmlFor="flyer-parish" className="block text-xs font-semibold text-navy-200 mb-1">
                        Local da Cerimónia / Igreja Paroquial
                      </label>
                      <input
                        id="flyer-parish"
                        type="text"
                        value={flyerData.parishLocation}
                        onChange={(e) => handleChange('parishLocation', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="flyer-cemetery" className="block text-xs font-semibold text-navy-200 mb-1">
                      Local do Cemitério
                    </label>
                    <input
                      id="flyer-cemetery"
                      type="text"
                      value={flyerData.cemeteryLocation}
                      onChange={(e) => handleChange('cemeteryLocation', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-navy-950 border border-gold-500/20 space-y-3">
                    <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Velório</p>
                    <DateTimePicker
                      id="flyer-wake-date"
                      label="Data e Hora do Velório"
                      date={flyerData.wakeDate}
                      time={flyerData.wakeTime}
                      onDateChange={handleWakeDate}
                      onTimeChange={handleWakeTime}
                    />
                    <div>
                      <label htmlFor="flyer-wake-location" className="block text-xs font-semibold text-navy-200 mb-1">
                        Local do Velório
                      </label>
                      <input
                        id="flyer-wake-location"
                        type="text"
                        value={flyerData.wakeLocation || ''}
                        onChange={(e) => handleWakeLocation(e.target.value)}
                        placeholder="Ex: Igreja Paroquial da Ventosa"
                        className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Agência, Logótipo & Iniciais */}
              {activeTab === 'agency' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-navy-950 border border-gold-500/20 space-y-2">
                    <label className="block text-xs font-bold text-gold-400 uppercase tracking-wider">
                      Formato do Logótipo da Agência
                    </label>
                    <div role="radiogroup" aria-label="Formato do logótipo" className="flex gap-2">
                      <button
                        type="button"
                        role="radio"
                        aria-checked={flyerData.agencyLogoType === 'INITIALS'}
                        onClick={() => handleChange('agencyLogoType', 'INITIALS')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                          flyerData.agencyLogoType === 'INITIALS'
                            ? 'bg-gold-500 text-navy-950 shadow'
                            : 'bg-navy-800 text-navy-300 hover:text-white'
                        }`}
                      >
                        Monograma com Iniciais
                      </button>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={flyerData.agencyLogoType === 'IMAGE'}
                        onClick={() => handleChange('agencyLogoType', 'IMAGE')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                          flyerData.agencyLogoType === 'IMAGE'
                            ? 'bg-gold-500 text-navy-950 shadow'
                            : 'bg-navy-800 text-navy-300 hover:text-white'
                        }`}
                      >
                        Ficheiro de Imagem
                      </button>
                    </div>
                  </div>

                  {flyerData.agencyLogoType === 'INITIALS' ? (
                    <div>
                      <label htmlFor="flyer-initials" className="block text-xs font-semibold text-navy-200 mb-1">
                        Iniciais para o Brasão da Agência
                      </label>
                      <input
                        id="flyer-initials"
                        type="text"
                        maxLength={3}
                        value={flyerData.agencyInitials}
                        onChange={(e) => handleChange('agencyInitials', e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-gold-300 text-sm font-serif font-bold uppercase focus:border-gold-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400"
                        placeholder="Ex: CH"
                      />
                      <p className="text-[10px] text-navy-400 mt-1">
                        Serão desenhadas no medalhão com ramos de oliveira e moldura dourada no flyer.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <ImageUploader
                        id="flyer-logo"
                        label="Logótipo da Agência"
                        description="Carregue o logótipo (PNG com fundo transparente ideal)"
                        value={flyerData.agencyLogoDataUrl}
                        circular
                        onUpload={(base64) => {
                          handleChange('agencyLogoDataUrl', base64);
                          handleChange('agencyLogoType', 'IMAGE');
                        }}
                        onClear={() => handleChange('agencyLogoDataUrl', undefined)}
                      />
                      <div>
                        <label htmlFor="flyer-logo-url" className="block text-xs font-semibold text-navy-200 mb-1">
                          Ou URL do Logótipo
                        </label>
                        <input
                          id="flyer-logo-url"
                          type="url"
                          value={flyerData.agencyLogoUrl}
                          onChange={(e) => handleChange('agencyLogoUrl', e.target.value)}
                          placeholder="https://sua-funeraria.com/logo.png"
                          className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="flyer-agency-name" className="block text-xs font-semibold text-navy-200 mb-1">
                      Nome da Funerária
                    </label>
                    <input
                      id="flyer-agency-name"
                      type="text"
                      value={flyerData.agencyName}
                      onChange={(e) => handleChange('agencyName', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs font-bold focus:border-gold-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="flyer-agency-address" className="block text-xs font-semibold text-navy-200 mb-1">
                        Endereço
                      </label>
                      <input
                        id="flyer-agency-address"
                        type="text"
                        value={flyerData.agencyAddress}
                        onChange={(e) => handleChange('agencyAddress', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400"
                      />
                    </div>

                    <div>
                      <label htmlFor="flyer-agency-location" className="block text-xs font-semibold text-navy-200 mb-1">
                        Localidade
                      </label>
                      <input
                        id="flyer-agency-location"
                        type="text"
                        value={flyerData.agencyLocation}
                        onChange={(e) => handleChange('agencyLocation', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: Estilo */}
              {activeTab === 'style' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-navy-950 border border-gold-500/20 space-y-2">
                    <label className="block text-xs font-bold text-gold-400 uppercase tracking-wider">
                      Tipografia do Flyer
                    </label>
                    <div role="radiogroup" aria-label="Família tipográfica" className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {FONT_OPTIONS.map((font) => (
                        <button
                          key={font.value}
                          type="button"
                          role="radio"
                          aria-checked={flyerData.fontFamily === font.value}
                          onClick={() => handleChange('fontFamily', font.value)}
                          className={`py-2 px-2 rounded-lg text-[11px] font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                            flyerData.fontFamily === font.value
                              ? 'bg-gold-500 text-navy-950 shadow'
                              : 'bg-navy-800 text-navy-300 hover:text-white'
                          }`}
                        >
                          <span className={`block text-base leading-tight ${font.preview}`}>Aa</span>
                          {font.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-950 border border-gold-500/20 space-y-3">
                    <label className="block text-xs font-bold text-gold-400 uppercase tracking-wider">
                      Paleta de Cores do Modelo
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="flyer-primary-color" className="block text-xs font-semibold text-navy-200 mb-1.5">
                          Cor Principal
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            id="flyer-primary-color"
                            type="color"
                            value={flyerData.primaryColor}
                            onChange={(e) => handleChange('primaryColor', e.target.value)}
                            aria-label="Cor principal do flyer"
                            className="w-10 h-10 rounded-lg bg-navy-950 border border-navy-700 cursor-pointer p-1"
                          />
                          <input
                            type="text"
                            value={flyerData.primaryColor}
                            onChange={(e) => handleChange('primaryColor', e.target.value)}
                            aria-label="Cor principal em hexadecimal"
                            className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs font-mono focus:border-gold-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="flyer-accent-color" className="block text-xs font-semibold text-navy-200 mb-1.5">
                          Cor de Destaque
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            id="flyer-accent-color"
                            type="color"
                            value={flyerData.accentColor}
                            onChange={(e) => handleChange('accentColor', e.target.value)}
                            aria-label="Cor de destaque do flyer"
                            className="w-10 h-10 rounded-lg bg-navy-950 border border-navy-700 cursor-pointer p-1"
                          />
                          <input
                            type="text"
                            value={flyerData.accentColor}
                            onChange={(e) => handleChange('accentColor', e.target.value)}
                            aria-label="Cor de destaque em hexadecimal"
                            className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-white text-xs font-mono focus:border-gold-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-navy-400">
                      As cores e a tipografia são aplicadas em tempo real no canvas de todos os modelos.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Live Canvas Preview Display */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="mb-2 text-xs font-semibold text-navy-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Pré-visualização em Tempo Real (Canvas HD)</span>
          </div>

          <div
            ref={previewContainerRef}
            className="w-full p-4 bg-navy-950/60 rounded-3xl border border-navy-800 shadow-2xl flex justify-center"
          >
            <div className="relative" style={{ width: '100%', maxWidth: 544, height: Math.max(240, 760 * scale) }}>
              <div
                className="absolute top-0 left-1/2 origin-top"
                style={{ transform: `translateX(-50%) scale(${scale})` }}
              >
                <FlyerCanvasPreview
                  data={flyerData}
                  template={selectedTemplate}
                  previewRef={previewRef}
                />
              </div>
            </div>
          </div>

          <div className="mt-2 text-[10px] text-navy-400 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            As alterações refletem-se imediatamente no canvas.
          </div>
        </div>
      </div>

      {/* Drafts Modal */}
      {showDraftsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDraftsModal(false)} />
          <div className="relative bg-navy-900 border border-navy-700 rounded-2xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-5 py-4 border-b border-navy-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-gold-400" />
                Rascunhos Guardados
              </h2>
              <button onClick={() => setShowDraftsModal(false)} className="p-1.5 rounded-lg bg-navy-800 text-navy-300 hover:text-white border border-navy-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {draftsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 text-gold-400 animate-spin" />
                </div>
              ) : drafts.length === 0 ? (
                <p className="text-center text-xs text-navy-400 py-8">Nenhum rascunho guardado.</p>
              ) : (
                drafts.map((d) => (
                  <div
                    key={d.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      currentDraftId === d.id
                        ? 'bg-gold-500/10 border-gold-500/30'
                        : 'bg-navy-800/50 border-navy-700/50 hover:border-navy-600'
                    }`}
                  >
                    <button onClick={() => loadDraft(d.id)} className="flex-1 text-left">
                      <p className="text-xs font-semibold text-white">{d.name}</p>
                      <p className="text-[10px] text-navy-400">{d.layoutStyle} • {new Date(d.updatedAt).toLocaleDateString('pt-PT')}</p>
                    </button>
                    <button onClick={() => deleteDraft(d.id)} className="p-1.5 rounded text-navy-400 hover:text-red-400 transition-colors" title="Eliminar">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleShare} className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 my-4">
             <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400" />
                Partilhar Flyer
              </h2>
              <button type="button" onClick={() => setShowShareModal(false)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-navy-300">
              Criar uma publicação para partilhar o flyer nas redes sociais.
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
              <button type="button" onClick={() => setShowShareModal(false)} className="px-4 py-2 rounded-xl bg-navy-800 text-navy-300 font-semibold text-xs">
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
