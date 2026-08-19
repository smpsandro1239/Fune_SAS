'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Loader2,
  Download,
  AlertCircle,
  User,
  Users,
  Calendar,
  MapPin,
  Heart,
  Truck,
  ClipboardCheck,
  ScrollText,
  MessageCircle,
} from 'lucide-react';
import { apiErrorMessage, apiService, ApiFuneral } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
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

export default function GenerateDocumentsPage() {
  const { user: sessionUser } = useAuth();
  const { toast } = useToast();
  const [funerals, setFunerals] = useState<ApiFuneral[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFuneral, setSelectedFuneral] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [extraData, setExtraData] = useState<Record<string, string>>({});

  useEffect(() => {
    apiService.funerals.list().then(setFunerals).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const selectedFuneralObj = funerals.find((f) => f.id === selectedFuneral);

  const handleGenerate = async () => {
    if (!selectedFuneral || !selectedType) {
      toast('error', 'Selecione um funeral e o tipo de documento.');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const blob = await apiService.docGenerate.generate(selectedFuneral, selectedType, extraData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const typeName = DOC_TYPES.find((d) => d.value === selectedType)?.label || selectedType;
      const deceasedName = selectedFuneralObj?.deceased?.fullName || 'Funeral';
      a.download = `${typeName} - ${deceasedName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast('success', 'Documento gerado com sucesso!');
    } catch (err: any) {
      const msg = apiErrorMessage(err, 'Não foi possível gerar o documento.');
      setError(msg);
      toast('error', msg);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-gold-400" />
          Gerar Documento
        </h1>
        <p className="text-xs text-navy-300">
          Selecione um funeral e o tipo de documento para gerar automaticamente em PDF.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

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
            <select
              value={selectedFuneral}
              onChange={(e) => setSelectedFuneral(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none text-xs"
            >
              <option value="">-- Selecionar funeral --</option>
              {funerals.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.deceased.fullName} — {new Date(f.funeralDate).toLocaleDateString('pt-PT')} ({f.status})
                </option>
              ))}
            </select>
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
              <Download className="w-4 h-4" />
            )}
            <span>{generating ? 'A gerar...' : 'Gerar PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
