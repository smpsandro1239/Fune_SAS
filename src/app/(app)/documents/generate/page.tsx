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
  Scroll,
  Receipt,
  FileSignature,
  Landmark,
} from 'lucide-react';
import { apiErrorMessage, apiService, ApiFuneral } from '@/lib/api';
import { useToast } from '@/components/Toast';

/* ================= Definição de tipos + campos dinâmicos ================= */

interface DocField {
  key: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  textareaRows?: number;
  hint?: string;
}

interface DocTypeDef {
  value: string;
  label: string;
  icon: any;
  description: string;
  preview: 'certificate' | 'letter' | 'table' | 'program' | 'authorization';
  accent: string;
  fields: DocField[];
}

const DOC_TYPES: DocTypeDef[] = [
  {
    value: 'PRESENCA', label: 'Declaração de Presença', icon: ClipboardCheck,
    description: 'Certificado de presença na cerimónia',
    preview: 'certificate', accent: '#38bdf8',
    fields: [
      { key: 'presentName', label: 'Nome de quem esteve presente', required: true, placeholder: 'Ex: Maria Silva' },
      { key: 'presentRelation', label: 'Parentesco / Relação', required: true, placeholder: 'Ex: Filha, Amiga, Vizinho...' },
    ],
  },
  {
    value: 'PROGRAMA', label: 'Programa do Funeral', icon: ScrollText,
    description: 'Ordem e programa do funeral',
    preview: 'program', accent: '#a78bfa',
    fields: [
      { key: 'officiant', label: 'Oficiante / Celebrante', placeholder: 'Ex: Padre João Costa' },
      { key: 'readings', label: 'Leituras (uma por linha)', textareaRows: 3, hint: 'Uma leitura por linha' },
      { key: 'songs', label: 'Cânticos / Músicas (um por linha)', textareaRows: 3, hint: 'Um cântico por linha' },
    ],
  },
  {
    value: 'CREMACAO', label: 'Autorização de Cremação', icon: Flame,
    description: 'Autorização para cremação',
    preview: 'authorization', accent: '#fb923c',
    fields: [
      { key: 'requesterName', label: 'Nome do requerente', required: true, placeholder: 'Quem autoriza a cremação' },
      { key: 'requesterId', label: 'Nº do Cartão de Cidadão', required: true, placeholder: 'Ex: 12345678 ZZ0' },
      { key: 'requesterAddress', label: 'Residência do requerente', required: true, placeholder: 'Ex: Rua das Flores, 123, Braga' },
      { key: 'requesterRelation', label: 'Parentesco com o falecido', required: true, placeholder: 'Ex: Cônjuge, Filho(a), Tutor legal...' },
    ],
  },
  {
    value: 'TRANSPORTE_DOCS', label: 'Guia de Transporte', icon: Truck,
    description: 'Documentação de transporte',
    preview: 'table', accent: '#4ade80',
    fields: [
      { key: 'origin', label: 'Origem', required: true, placeholder: 'Ex: Casa Mortuária, Rua X, Braga' },
      { key: 'destination', label: 'Destino', required: true, placeholder: 'Ex: Cemitério de Ventosa' },
      { key: 'vehicleType', label: 'Tipo de veículo', placeholder: 'Ex: Carro funerário' },
      { key: 'vehiclePlate', label: 'Matrícula', placeholder: 'Ex: AA-12-BB' },
      { key: 'driverName', label: 'Condutor', placeholder: 'Ex: António Pereira' },
    ],
  },
  {
    value: 'RELATORIO', label: 'Relatório de Serviço', icon: Users,
    description: 'Relatório completo do serviço',
    preview: 'table', accent: '#facc15',
    fields: [
      { key: 'clientName', label: 'Nome do cliente / família', required: true, placeholder: 'Ex: Família Silva' },
      { key: 'itemsText', label: 'Serviços prestados', textareaRows: 4,
        hint: 'Uma linha por serviço: descrição | quantidade | preço (€)',
        placeholder: 'Carro funerário | 1 | 250\nSala de velório | 1 | 120\nCoroa de flores | 2 | 75' },
      { key: 'notes', label: 'Notas adicionais (opcional)', textareaRows: 2 },
    ],
  },
  {
    value: 'SEPULTURA', label: 'Certidão de Sepultura', icon: MapPin,
    description: 'Certidão de sepultamento',
    preview: 'certificate', accent: '#60a5fa',
    fields: [
      { key: 'plotNumber', label: 'Nº da sepultura / jazigo (opcional)', placeholder: 'Ex: 145' },
      { key: 'graveType', label: 'Tipo de sepultura (opcional)', placeholder: 'Ex: Jazigo, Fossa, Terra...' },
    ],
  },
  {
    value: 'CONDOLENCIA', label: 'Carta de Condolências', icon: Heart,
    description: 'Carta de condolências à família',
    preview: 'letter', accent: '#f472b6',
    fields: [
      { key: 'familyName', label: 'Nome da família destinatária', required: true, placeholder: 'Ex: Exma. Família Silva' },
      { key: 'message', label: 'Mensagem personalizada (opcional)', textareaRows: 4,
        hint: 'Deixe vazio para usar a mensagem padrão' },
    ],
  },
  {
    value: 'ATESTADO_OBITO', label: 'Atestado de Óbito', icon: FileSignature,
    description: 'Declaração médica de óbito',
    preview: 'certificate', accent: '#94a3b8',
    fields: [
      { key: 'doctorName', label: 'Nome do médico declarante', placeholder: 'Ex: Dr. Carlos Lopes' },
      { key: 'doctorLicense', label: 'Nº da Ordem dos Médicos', placeholder: 'Ex: 12345' },
      { key: 'causeOfDeath', label: 'Causa de morte (opcional)', textareaRows: 2 },
    ],
  },
  {
    value: 'AUTORIZACAO_SEPULTAMENTO', label: 'Autorização de Sepultamento', icon: Landmark,
    description: 'Autorização formal de sepultamento',
    preview: 'authorization', accent: '#34d399',
    fields: [
      { key: 'requesterName', label: 'Nome do requerente', required: true },
      { key: 'requesterId', label: 'Nº do Cartão de Cidadão', required: true },
      { key: 'requesterRelation', label: 'Grau de parentesco', required: true, placeholder: 'Ex: Filho(a)' },
    ],
  },
  {
    value: 'CONTRATO_SERVICO', label: 'Contrato de Prestação de Serviços', icon: FileSignature,
    description: 'Contrato entre agência e cliente',
    preview: 'table', accent: '#c084fc',
    fields: [
      { key: 'clientName', label: 'Nome do cliente', required: true },
      { key: 'clientId', label: 'Nº do Cartão de Cidadão', required: true },
      { key: 'clientAddress', label: 'Morada do cliente', required: true },
      { key: 'clientPhone', label: 'Telefone', required: true },
      { key: 'clientEmail', label: 'Email', required: false, placeholder: 'ex@email.com' },
      { key: 'itemsText', label: 'Serviços contratados', required: true, textareaRows: 4,
        hint: 'Uma linha por serviço: descrição | quantidade | preço (€)',
        placeholder: 'Carro funerário | 1 | 250\nUrna | 1 | 400' },
      { key: 'paymentMethod', label: 'Método de pagamento (opcional)', placeholder: 'Ex: Transferência bancária' },
    ],
  },
  {
    value: 'GUIA_PAGAMENTO', label: 'Guia de Pagamento', icon: Receipt,
    description: 'Recibo de pagamento de serviços',
    preview: 'table', accent: '#fbbf24',
    fields: [
      { key: 'clientName', label: 'Nome do cliente', required: true },
      { key: 'clientId', label: 'Nº do Cartão de Cidadão / NIF', required: true },
      { key: 'paymentMethod', label: 'Método de pagamento', required: true, placeholder: 'Ex: Multibanco, Dinheiro...' },
      { key: 'itemsText', label: 'Serviços pagos', required: true, textareaRows: 4,
        hint: 'Descrição | quantidade | preço (€) por linha' },
      { key: 'notes', label: 'Notas (opcional)', textareaRows: 2 },
    ],
  },
  {
    value: 'DECLARACAO_HERDEIROS', label: 'Declaração de Herdeiros', icon: Scroll,
    description: 'Declaração legal de herdeiros',
    preview: 'table', accent: '#2dd4bf',
    fields: [
      { key: 'heirsText', label: 'Lista de herdeiros', required: true, textareaRows: 4,
        hint: 'Uma linha por herdeiro: nome | nº CC | parentesco',
        placeholder: 'Maria Silva | 12345678 | Filha\nJoão Silva | 87654321 | Filho' },
      { key: 'deceasedMaritalStatus', label: 'Estado civil do falecido (opcional)', placeholder: 'Ex: Viúvo(a)' },
      { key: 'deceasedAddress', label: 'Última morada do falecido (opcional)' },
    ],
  },
  {
    value: 'ORCAMENTO', label: 'Orçamento de Serviços', icon: FileText,
    description: 'Orçamento/proposta de serviços funerários',
    preview: 'table', accent: '#a3e635',
    fields: [
      { key: 'clientName', label: 'Nome do cliente', required: true },
      { key: 'clientId', label: 'Nº do Cartão de Cidadão / NIF', required: true },
      { key: 'itemsText', label: 'Serviços orçados', required: true, textareaRows: 4,
        hint: 'Uma linha por serviço: descrição | quantidade | preço (€)',
        placeholder: 'Serviço funerário completo | 1 | 1250\nCoroa de flores | 2 | 75' },
      { key: 'paymentMethod', label: 'Condições de pagamento (opcional)', placeholder: 'Ex: 50% no ato, restante na entrega' },
      { key: 'validUntil', label: 'Validade da proposta (opcional)', placeholder: 'Ex: 30 dias' },
      { key: 'notes', label: 'Notas (opcional)', textareaRows: 2 },
    ],
  },
  {
    value: 'AUTORIZACAO_TRANSPORTE', label: 'Autorização de Transporte', icon: Truck,
    description: 'Autorização de transporte de restos mortais',
    preview: 'authorization', accent: '#f87171',
    fields: [
      { key: 'requesterName', label: 'Nome do requerente', required: true },
      { key: 'requesterId', label: 'Nº do Cartão de Cidadão', required: true },
      { key: 'requesterRelation', label: 'Grau de parentesco', required: true, placeholder: 'Ex: Filho(a), Cônjuge...' },
      { key: 'destination', label: 'Destino do transporte', required: true, placeholder: 'Ex: Cemitério de Vilar' },
      { key: 'vehicleType', label: 'Tipo de veículo (opcional)', placeholder: 'Ex: Carro funerário' },
      { key: 'vehiclePlate', label: 'Matrícula (opcional)', placeholder: 'Ex: BB-34-CC' },
      { key: 'notes', label: 'Observações (opcional)', textareaRows: 2 },
    ],
  },
];

/* ================= Miniatura visual de cada documento ================= */

function DocPreviewThumb({ type }: { type: DocTypeDef }) {
  const line = (w: string, cls = '') => (
    <div className={`h-[3px] rounded-full bg-slate-300 ${cls}`} style={{ width: w }} />
  );

  return (
    <div className="relative w-full h-24 rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden p-2 flex flex-col gap-1">
      {/* Letterhead */}
      <div className="flex items-center justify-between shrink-0">
        <div className="h-[5px] w-10 rounded-sm" style={{ backgroundColor: type.accent }} />
        <div className="flex gap-0.5">
          <div className="h-[3px] w-4 rounded bg-slate-200" />
          <div className="h-[3px] w-4 rounded bg-slate-200" />
        </div>
      </div>

      {/* Body varies by layout */}
      {type.preview === 'certificate' && (
        <div className="flex-1 flex flex-col items-center gap-1 pt-1">
          <div className="h-[5px] w-16 rounded-sm" style={{ backgroundColor: type.accent }} />
          <div className="border rounded px-2 py-1 my-0.5" style={{ borderColor: `${type.accent}66` }}>
            <div className="h-[3px] w-14 rounded bg-slate-400" />
          </div>
          {line('80%')}
          {line('65%')}
          <div className="mt-auto flex justify-between w-full">
            {line('20%')}<div />{line('20%')}
          </div>
        </div>
      )}

      {type.preview === 'letter' && (
        <div className="flex-1 flex flex-col gap-1 pt-1">
          <div className="h-[4px] w-12 rounded-sm" style={{ backgroundColor: type.accent }} />
          {line('95%')}{line('90%')}{line('92%')}{line('55%')}
          <div className="mt-auto">{line('25%', 'ml-auto')}</div>
        </div>
      )}

      {type.preview === 'table' && (
        <div className="flex-1 flex flex-col gap-0.5 pt-0.5">
          <div className="grid grid-cols-4 gap-1">
            <div className="col-span-2 h-[5px] rounded" style={{ backgroundColor: type.accent }} />
            <div className="h-[5px] rounded" style={{ backgroundColor: `${type.accent}99` }} />
            <div className="h-[5px] rounded" style={{ backgroundColor: `${type.accent}99` }} />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className={`grid grid-cols-4 gap-1 py-0.5 ${i % 2 === 0 ? 'bg-slate-50 rounded' : ''}`}>
              <div className="col-span-2 h-[3px] w-[85%] rounded bg-slate-300 ml-0.5" />
              <div className="h-[3px] w-[60%] rounded bg-slate-300 ml-0.5" />
              <div className="h-[3px] w-[60%] rounded bg-slate-300 ml-0.5" />
            </div>
          ))}
          <div className="mt-auto self-end h-[5px] w-10 rounded" style={{ backgroundColor: type.accent }} />
        </div>
      )}

      {type.preview === 'program' && (
        <div className="flex-1 flex flex-col items-center gap-1 pt-0.5">
          <div className="h-[4px] w-14 rounded-sm" style={{ backgroundColor: type.accent }} />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5 w-[85%]">
              <span className="shrink-0 w-3 h-3 rounded-full text-[7px] font-bold text-white flex items-center justify-center"
                style={{ backgroundColor: type.accent }}>{i}</span>
              {line(`${70 - i * 10}%`)}
            </div>
          ))}
          <div className="mt-auto">{line('30%')}</div>
        </div>
      )}

      {type.preview === 'authorization' && (
        <div className="flex-1 flex flex-col gap-1 pt-1">
          <div className="self-center h-[4px] w-16 rounded-sm" style={{ backgroundColor: type.accent }} />
          {line('88%', 'mt-1')}{line('82%')}{line('40%')}
          <div className="border rounded p-1 mt-0.5" style={{ borderColor: `${type.accent}55` }}>
            <div className="h-[3px] w-12 rounded mx-auto" style={{ backgroundColor: type.accent }} />
          </div>
          <div className="mt-auto flex justify-between items-end">
            {line('22%')}<div />{line('22%')}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= Flame icon helper ================= */
function Flame(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

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
  const [copies, setCopies] = useState(1);

  useEffect(() => {
    apiService.funerals.list().then(setFunerals).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const selectedFuneralObj = funerals.find((f) => f.id === selectedFuneral);
  const currentType = DOC_TYPES.find((d) => d.value === selectedType);

  // Reset extra data quando muda o tipo de documento
  useEffect(() => {
    setExtraData({});
  }, [selectedType]);

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

  const currentTypeName = currentType?.label || 'Documento';
  const currentDeceasedName = selectedFuneralObj?.deceased?.fullName || 'Funeral';
  const currentFilename = `${currentTypeName} - ${currentDeceasedName}.pdf`;

  /** Todos os campos são opcionais — deixar vazio imprime uma linha em branco no PDF */
  const validateFields = (): string | null => {
    return null;
  };

  /** Converte texto multi-linha nos formatos que os templates esperam */
  const buildPayload = (): Record<string, any> => {
    const payload: Record<string, any> = {};

    for (const [key, value] of Object.entries(extraData)) {
      if (!value?.trim()) continue;

      if (key === 'itemsText') {
        payload.items = value.split('\n').map((l) => {
          const [description, qty, unitPrice] = l.split('|').map((p) => p.trim());
          return { description, qty: Number(qty) || 1, unitPrice: Number(unitPrice?.replace(',', '.')) || 0 };
        }).filter((i) => i.description);
      } else if (key === 'heirsText') {
        payload.heirs = value.split('\n').map((l) => {
          const [name, idNumber, relationship] = l.split('|').map((p) => p.trim());
          return { name, idNumber, relationship };
        }).filter((h) => h.name);
      } else if (key === 'readings') {
        payload.readings = value.split('\n').map((s) => s.trim()).filter(Boolean);
      } else if (key === 'songs') {
        payload.songs = value.split('\n').map((s) => s.trim()).filter(Boolean);
      } else {
        payload[key] = value.trim();
      }
    }

    return payload;
  };

  const handleGenerate = async () => {
    if (!selectedFuneral || !selectedType) {
      toast('error', 'Selecione um funeral e o tipo de documento.');
      return;
    }
    const validationError = validateFields();
    if (validationError) {
      toast('error', validationError);
      setError(validationError);
      return;
    }
    setGenerating(true);
    setError('');
    try {
      const blob = await apiService.docGenerate.generate(selectedFuneral, selectedType, buildPayload(), copies);
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

  const totalFields = currentType ? currentType.fields.length : 0;
  const filledFields = currentType
    ? currentType.fields.filter((f) => extraData[f.key]?.trim()).length
    : 0;

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

          {/* Step 2: Document type with previews */}
          <div>
            <label className="block text-navy-200 mb-2 text-xs font-semibold">
              2. Tipo de Documento *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {DOC_TYPES.map((docType) => {
                const Icon = docType.icon;
                const isSelected = selectedType === docType.value;
                return (
                  <button
                    key={docType.value}
                    onClick={() => setSelectedType(docType.value)}
                    className={`group p-3 rounded-xl border text-left transition-all space-y-2 ${
                      isSelected
                        ? 'bg-gold-500/10 border-gold-500/50 shadow-md ring-1 ring-gold-500/30'
                        : 'bg-navy-950 border-navy-700 hover:border-navy-500 hover:bg-navy-900'
                    }`}
                  >
                    <DocPreviewThumb type={docType} />
                    <div className="flex items-start gap-2">
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isSelected ? 'text-gold-400' : 'text-navy-500 group-hover:text-navy-300'
                      }`} />
                      <div className="min-w-0">
                        <div className={`text-[11px] font-semibold leading-tight truncate ${
                          isSelected ? 'text-gold-300' : 'text-navy-200'
                        }`}>
                          {docType.label}
                        </div>
                        <div className="text-[9px] text-navy-400 leading-snug line-clamp-2 mt-0.5">
                          {docType.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Dados específicos do documento */}
          {currentType && currentType.fields.length > 0 && (
            <div className="p-4 rounded-xl bg-navy-950 border border-navy-700 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-navy-100 flex items-center gap-2">
                  <currentType.icon className="w-4 h-4 text-gold-400" />
                  Dados para: {currentType.label}
                </p>
                {totalFields > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    filledFields === totalFields
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-amber-500/15 text-amber-300'
                  }`}>
                    {filledFields}/{totalFields} campos preenchidos
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentType.fields.map((field) => (
                  <div key={field.key} className={field.textareaRows ? 'sm:col-span-2' : ''}>
                    <label className="block text-[10px] font-semibold text-navy-300 mb-1">
                      {field.label}
                      <span className="text-navy-500"> (opcional)</span>
                    </label>

                    {field.textareaRows ? (
                      <textarea
                        rows={field.textareaRows}
                        placeholder={field.placeholder}
                        value={extraData[field.key] || ''}
                        onChange={(e) => setExtraData({ ...extraData, [field.key]: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none resize-none"
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={extraData[field.key] || ''}
                        onChange={(e) => setExtraData({ ...extraData, [field.key]: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
                      />
                    )}

                    {field.hint && (
                      <p className="text-[9px] text-navy-500 mt-1">{field.hint}</p>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-navy-400 pt-1 border-t border-navy-800">
                Os restantes dados (nome do falecido, datas, locais, agência) são preenchidos automaticamente
                a partir do funeral selecionado.
              </p>
            </div>
          )}

          {/* Generate button */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-800">
            <div className="flex items-center gap-2">
              <label htmlFor="doc-copies" className="text-[10px] font-semibold text-navy-300">
                Nº de cópias
              </label>
              <input
                id="doc-copies"
                type="number"
                min={1}
                max={99}
                value={copies}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setCopies(Number.isNaN(n) ? 1 : Math.min(99, Math.max(1, n)));
                }}
                className="w-16 px-2 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none text-center"
              />
            </div>
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
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 p-4 rounded-2xl bg-navy-900/80 border border-navy-800 shadow-xl">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white text-xs font-semibold border border-navy-700 transition-all order-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Gerar Outro</span>
            </button>

            <div className="flex items-center gap-2 min-w-0 order-3 sm:order-2 w-full sm:w-auto justify-center">
              <FileText className="w-4 h-4 text-gold-400 shrink-0" />
              <span className="text-xs font-semibold text-white truncate">{currentFilename}</span>
            </div>

            <div className="flex items-center gap-2 order-2 sm:order-3">
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
