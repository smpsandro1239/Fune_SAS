'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  FileText,
  Loader2,
  Download,
  Eye,
  AlertCircle,
  User,
  Users,
  MapPin,
  Heart,
  Truck,
  ClipboardCheck,
  ScrollText,
  ArrowLeft,
  Maximize2,
  X,
  Search,
} from 'lucide-react';
import { apiErrorMessage, apiService, ApiFuneral } from '@/lib/api';
import { useToast } from '@/components/Toast';

const DOC_TYPES = [
  { value: 'PRESENCA', label: 'Declaração de Presença', icon: ClipboardCheck, description: 'Certificado de presença na cerimónia' },
  { value: 'PROGRAMA', label: 'Programa do Funeral', icon: ScrollText, description: 'Ordem e programa do funeral' },
  { value: 'CREMACAO', label: 'Autorização de Cremação', icon: FileText, description: 'Autorização para cremação' },
  { value: 'TRANSPORTE_DOCS', label: 'Guia de Transporte', icon: Truck, description: 'Documentação de transporte' },
  { value: 'RELATORIO', label: 'Relatório de Serviço', icon: Users, description: 'Relatório completo do serviço' },
  { value: 'SEPULTURA', label: 'Certidão de Sepultura', icon: MapPin, description: 'Certidão de sepultamento' },
  { value: 'CONDOLENCIA', label: 'Carta de Condolências', icon: Heart, description: 'Carta de condolenças à família' },
];

type ViewMode = 'form' | 'preview';

export default function GenerateDocumentsPage() {
  const { toast } = useToast();
  const [funerals, setFunerals] = useState<ApiFuneral[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFuneral, setSelectedFuneral] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [extraData, setExtraData] = useState<Record<string, string>>({});

  const [funeralSearch, setFuneralSearch] = useState('');
  const [funeralDropdownOpen, setFuneralDropdownOpen] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('form');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    apiService.funerals.list().then(setFunerals).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const selectedFuneralObj = funerals.find((f) => f.id === selectedFuneral);

  const filteredFunerals = funerals.filter((f) => {
    if (!funeralSearch.trim()) return true;
    const q = funeralSearch.toLowerCase();
    const fullName = f.deceased.fullName.toLowerCase();
    const date = new Date(f.funeralDate).toLocaleDateString('pt-PT');
    const parish = (f.locationParish || '').toLowerCase();
    const cemetery = (f.cemeteryLocation || '').toLowerCase();
    const status = f.status.toLowerCase();
    return fullName.includes(q) || date.includes(q) || parish.includes(q) || cemetery.includes(q) || status.includes(q);
  });

  const currentTypeName = DOC_TYPES.find((d) => d.value === selectedType)?.label || 'Documento';
  const currentDeceasedName = selectedFuneralObj?.deceased?.fullName || 'Funeral';
  const currentFilename = `${currentTypeName} - ${currentDeceasedName}.pdf`;

  const handleGenerate = async () => {
    if (!selectedFuneral || !selectedType) {
      toast('error', 'Selecione um funeral e o tipo de documento.');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const blob = await apiService.docGenerate.generate(selectedFuneral, selectedType, extraData);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(blob);
      setPdfBlob(blob);
      setPdfUrl(url);
      setViewMode('preview');
      toast('success', 'Documento gerado com sucesso! Pode visualizar antes de descarregar.');
    } catch (err: any) {
      const msg = apiErrorMessage(err, 'Não foi possível gerar o documento.');
      setError(msg);
      toast('error', msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = currentFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast('success', 'Download iniciado!');
  }, [pdfUrl, currentFilename, toast]);

  const handleBack = () => {
    setViewMode('form');
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
      setPdfBlob(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-gold-400" />
          Gerar Documento
        </h1>
        <p className="text-xs text-navy-300">
          {viewMode === 'form'
            ? 'Selecione um funeral e o tipo de documento para gerar automaticamente em PDF.'
            : `A visualizar: ${currentTypeName} de ${currentDeceasedName}`}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {viewMode === 'form' ? (
        /* ===== FORM MODE ===== */
        <div className="p-6 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-5 shadow-xl">
          {/* Step 1: Funeral */}
          <div>
            <label className="block text-navy-200 mb-2 text-xs font-semibold">
              1. Selecione o Funeral *
            </label>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-gold-400" />
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Pesquisar por nome, data, local, estado..."
                    value={funeralSearch}
                    onChange={(e) => {
                      setFuneralSearch(e.target.value);
                      setFuneralDropdownOpen(true);
                      if (selectedFuneral) {
                        setSelectedFuneral('');
                      }
                    }}
                    onFocus={() => setFuneralDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setFuneralDropdownOpen(false), 200)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none text-xs"
                  />
                  <User className="w-4 h-4 text-navy-400 absolute left-3 top-2.5 pointer-events-none" />
                  {selectedFuneral && (
                    <button
                      onClick={() => {
                        setSelectedFuneral('');
                        setFuneralSearch('');
                      }}
                      className="absolute right-3 top-2.5 text-navy-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {funeralDropdownOpen && !selectedFuneral && (
                  <div className="absolute z-40 w-full mt-1 max-h-64 overflow-y-auto rounded-xl bg-navy-900 border border-navy-700 shadow-2xl">
                    {filteredFunerals.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-navy-400">
                        Nenhum funeral encontrado para &quot;{funeralSearch}&quot;
                      </div>
                    ) : (
                      filteredFunerals.map((f) => {
                        const date = new Date(f.funeralDate).toLocaleDateString('pt-PT', {
                          weekday: 'short',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        });
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setSelectedFuneral(f.id);
                              setFuneralSearch(f.deceased.fullName);
                              setFuneralDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2.5 text-left hover:bg-gold-500/10 transition-colors border-b border-navy-800 last:border-0"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate">{f.deceased.fullName}</p>
                                <p className="text-[10px] text-navy-400 truncate">
                                  {date}
                                  {f.locationParish ? ` • ${f.locationParish}` : ''}
                                  {f.cemeteryLocation ? ` • ${f.cemeteryLocation}` : ''}
                                </p>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                                f.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' :
                                f.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-amber-500/20 text-amber-300'
                              }`}>
                                {f.status === 'SCHEDULED' ? 'Agendado' : f.status === 'IN_PROGRESS' ? 'Em curso' : 'Concluído'}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}
            {selectedFuneralObj && (
              <div className="mt-3 p-3 rounded-xl bg-navy-950 border border-gold-500/20 text-xs text-navy-200 flex items-center gap-3">
                <User className="w-4 h-4 text-gold-400 shrink-0" />
                <div>
                  <span className="font-bold text-white">{selectedFuneralObj.deceased.fullName}</span>
                  {selectedFuneralObj.deceased.age && <span className="text-navy-400"> — {selectedFuneralObj.deceased.age} anos</span>}
                  <span className="text-navy-400"> | {new Date(selectedFuneralObj.funeralDate).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  {selectedFuneralObj.locationParish && (
                    <span className="text-navy-400"> | {selectedFuneralObj.locationParish}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Document type */}
          <div>
            <label className="block text-navy-200 mb-2 text-xs font-semibold">
              2. Tipo de Documento *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DOC_TYPES.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  onClick={() => setSelectedType(value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedType === value
                      ? 'bg-gold-500/10 border-gold-500/50 text-gold-300 shadow-sm'
                      : 'bg-navy-950 border-navy-700 text-navy-300 hover:border-navy-500 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-5 h-5 shrink-0 ${selectedType === value ? 'text-gold-400' : 'text-navy-500'}`} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{label}</div>
                      <div className="text-[10px] text-navy-400 truncate">{description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Extra data */}
          {selectedType === 'TRANSPORTE_DOCS' && (
            <div className="p-4 rounded-xl bg-navy-950 border border-navy-700 space-y-3">
              <p className="text-xs font-semibold text-navy-200">Dados do Transporte (opcional)</p>
              <input
                type="text"
                placeholder="Morada de origem"
                value={extraData.origin || ''}
                onChange={(e) => setExtraData({ ...extraData, origin: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Morada de destino"
                value={extraData.destination || ''}
                onChange={(e) => setExtraData({ ...extraData, destination: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
              />
            </div>
          )}

          {/* Generate button */}
          <div className="flex justify-end pt-3 border-t border-navy-800">
            <button
              onClick={handleGenerate}
              disabled={!selectedFuneral || !selectedType || generating}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs shadow-lg transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span>{generating ? 'A gerar...' : 'Gerar e Visualizar'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* ===== PREVIEW MODE ===== */
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white text-xs font-semibold border border-navy-700 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Gerar Outro</span>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-gold-400 shrink-0" />
              <span className="text-xs font-semibold text-white truncate">{currentFilename}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFullscreen(true)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white text-xs font-semibold border border-navy-700 transition-all"
                title="Tela cheia"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Tela Cheia</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs shadow-lg transition-all hover:brightness-110"
              >
                <Download className="w-4 h-4" />
                <span>Descarregar PDF</span>
              </button>
            </div>
          </div>

          {/* PDF Viewer */}
          {pdfUrl ? (
            <div className="rounded-2xl overflow-hidden border border-navy-800 shadow-2xl bg-white" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title={`Preview: ${currentTypeName}`}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center py-20 rounded-2xl bg-navy-900/80 border border-navy-800">
              <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
            </div>
          )}
        </div>
      )}

      {/* Fullscreen modal */}
      {fullscreen && pdfUrl && (
        <div className="fixed inset-0 z-50 bg-navy-950 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-navy-900 border-b border-navy-800 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-4 h-4 text-gold-400 shrink-0" />
              <span className="text-xs font-semibold text-white truncate">{currentFilename}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs shadow-lg transition-all hover:brightness-110"
              >
                <Download className="w-4 h-4" />
                <span>Descarregar</span>
              </button>
              <button
                onClick={() => setFullscreen(false)}
                className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white border border-navy-700 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <iframe
            src={pdfUrl}
            className="flex-1 w-full border-0"
            title={`Preview fullscreen: ${currentTypeName}`}
          />
        </div>
      )}
    </div>
  );
}
