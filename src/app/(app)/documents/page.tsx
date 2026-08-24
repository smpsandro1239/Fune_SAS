'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  UploadCloud,
  Search,
  FileCheck,
  Download,
  AlertCircle,
  Loader2,
  Trash2,
  X,
  FileImage,
  File,
  Building2,
  Calendar,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import {
  ApiDocument,
  ApiFuneral,
  DocumentType,
  apiErrorMessage,
  apiService,
  fetchFileBlobUrl,
  formatBytes,
} from '@/lib/api';

const TYPE_LABELS: Record<DocumentType, string> = {
  CERTIFICATE: 'Certidões',
  AUTHORIZATION: 'Autorizações',
  CONTRACT: 'Contratos',
  IDENTITY: 'Identificações',
  PRESENCA: 'Declarações de Presença',
  PROGRAMA: 'Programas de Funeral',
  CREMACAO: 'Autorizações de Cremação',
  TRANSPORTE_DOCS: 'Guias de Transporte',
  RELATORIO: 'Relatórios de Serviço',
  SEPULTURA: 'Certidões de Sepultura',
  CONDOLENCIA: 'Cartas de Condolências',
};

const TYPE_OPTIONS: { value: DocumentType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'CERTIFICATE', label: 'Certidões' },
  { value: 'AUTHORIZATION', label: 'Autorizações' },
  { value: 'CONTRACT', label: 'Contratos' },
  { value: 'IDENTITY', label: 'Identificação' },
];

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024;

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [funerals, setFunerals] = useState<ApiFuneral[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState<DocumentType | 'ALL'>('ALL');

  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DocumentType>('CERTIFICATE');
  const [funeralId, setFuneralId] = useState('');

  const [deleting, setDeleting] = useState<ApiDocument | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const handleDownload = async (doc: ApiDocument) => {
    try {
      const url = await fetchFileBlobUrl(doc.fileUrl);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = doc.fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      window.document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setError('Não foi possível descarregar o ficheiro.');
    }
  };

  const loadDocuments = useCallback(async (search?: string, docType?: DocumentType | 'ALL') => {
    setLoading(true);
    setError('');
    try {
      const params: { search?: string; type?: DocumentType } = {};
      if (search) params.search = search;
      if (docType && docType !== 'ALL') params.type = docType;
      setDocuments(await apiService.documents.list(params));
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível carregar os documentos.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    apiService.funerals.list().then(setFunerals).catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadDocuments(searchTerm || undefined, activeType), 350);
    return () => clearTimeout(timer);
  }, [searchTerm, activeType, loadDocuments]);

  const onDrop = useCallback((accepted: File[]) => {
    setUploadError('');
    const next = accepted[0];
    if (!next) {
      setUploadError('Formato não suportado. Use JPG, PNG, WebP ou PDF.');
      return;
    }
    if (next.size > MAX_SIZE) {
      setUploadError('O ficheiro excede o limite de 10 MB.');
      return;
    }
    setFile(next);
    if (!title.trim()) {
      setTitle(next.name.replace(/\.[^.]+$/, ''));
    }
  }, [title]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    if (!file) {
      setUploadError('Selecione um ficheiro para carregar.');
      return;
    }
    if (!title.trim()) {
      setUploadError('Indique um título para o documento.');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title.trim());
      formData.append('type', type);
      if (funeralId) formData.append('funeralId', funeralId);
      await apiService.documents.upload(formData);
      setShowUpload(false);
      setFile(null);
      setTitle('');
      setFuneralId('');
      await loadDocuments();
    } catch (err) {
      setUploadError(apiErrorMessage(err, 'Não foi possível carregar o documento.'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await apiService.documents.remove(deleting.id);
      setDeleting(null);
      await loadDocuments(searchTerm || undefined, activeType);
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível remover o documento.'));
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  const resetModal = () => {
    setShowUpload(false);
    setUploadError('');
    setFile(null);
    setTitle('');
    setType('CERTIFICATE');
    setFuneralId('');
  };

  const inputClass =
    'w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white focus:border-gold-400 focus:outline-none';

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-400" />
            Gestão Documental & RGPD
          </h1>
          <p className="text-xs text-navy-300">
            Certidões, contratos e autorizações associados aos funerais da agência.
          </p>
        </div>

        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs shadow-lg transition-all hover:brightness-110"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Carregar Documento</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Pesquisa e filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-2xl bg-navy-900/80 border border-navy-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-navy-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Pesquisar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white text-xs focus:border-gold-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-1 w-full sm:w-auto">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveType(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeType === opt.value
                  ? 'bg-gold-500 text-navy-950'
                  : 'bg-navy-950 text-navy-300 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-gold-400" />
        </div>
      ) : documents.length === 0 ? (
        <div className="p-10 rounded-2xl bg-navy-900/80 border border-navy-800 text-center space-y-3">
          <FileText className="w-10 h-10 text-navy-500 mx-auto" />
          <p className="text-sm font-semibold text-white">Sem documentos</p>
          <p className="text-xs text-navy-300 max-w-sm mx-auto">
            Carregue certidões, autorizações ou contratos para os manter centralizados e seguros.
          </p>
        </div>
      ) : (
        <div className="bg-navy-900/80 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-navy-800 flex items-center justify-between text-xs text-navy-400 font-bold uppercase tracking-wider">
            <span>Ficheiro</span>
            <span className="hidden md:inline">Funeral Associado</span>
            <span>Tamanho</span>
            <span>Ações</span>
          </div>

          <div className="divide-y divide-navy-800">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-navy-800/50 transition-colors">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="p-2.5 rounded-xl bg-navy-950 border border-gold-500/20 text-gold-400 shrink-0">
                    {doc.mimeType === 'application/pdf' ? (
                      <File className="w-5 h-5" />
                    ) : (
                      <FileImage className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="font-semibold text-white text-xs truncate block hover:text-gold-300 transition-colors"
                    >
                      {doc.title}
                    </Link>
                    <div className="flex items-center space-x-2 text-[10px] text-navy-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <FileCheck className="w-3 h-3 text-emerald-400" />
                        {TYPE_LABELS[doc.type] || doc.type}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(doc.createdAt).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-1.5 text-xs text-navy-200 truncate max-w-[220px] mx-3">
                  {doc.funeral ? (
                    <>
                      <Building2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                      <span className="truncate">{doc.funeral.deceased.fullName}</span>
                    </>
                  ) : (
                    <span className="text-navy-500">—</span>
                  )}
                </div>

                <div className="text-xs text-navy-400 w-16 text-right shrink-0">
                  {formatBytes(doc.fileSize)}
                </div>

                <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-gold-400 hover:text-gold-300 border border-navy-700"
                    title="Descarregar / Ver"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleting(doc)}
                    className="p-2 rounded-lg bg-navy-800 hover:bg-red-500/20 text-navy-300 hover:text-red-300 border border-navy-700"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: upload */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-gold-400" />
                Carregar Documento
              </h2>
              <button onClick={resetModal} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-gold-400 bg-gold-500/10'
                    : 'border-navy-700 bg-navy-950 hover:border-gold-500/50'
                }`}
              >
                <input {...getInputProps()} />
                {file ? (
                  <div className="space-y-2">
                    <FileCheck className="w-8 h-8 text-gold-400 mx-auto" />
                    <p className="font-semibold text-white truncate px-2">{file.name}</p>
                    <p className="text-[11px] text-navy-400">{formatBytes(file.size)}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud className="w-8 h-8 text-navy-400 mx-auto" />
                    <p className="font-semibold text-navy-200">
                      Arraste um ficheiro ou clique para selecionar
                    </p>
                    <p className="text-[11px] text-navy-400">JPG, PNG, WebP ou PDF — máx. 10 MB</p>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div>
                <label className="block text-navy-200 mb-1 font-semibold">Título *</label>
                <input
                  type="text"
                  placeholder="Ex: Certidão de Óbito - Luís Freitas"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-navy-200 mb-1 font-semibold">Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DocumentType)}
                    className={inputClass}
                  >
                    <option value="CERTIFICATE">Certidão</option>
                    <option value="AUTHORIZATION">Autorização</option>
                    <option value="CONTRACT">Contrato</option>
                    <option value="IDENTITY">Identificação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-navy-200 mb-1 font-semibold">Funeral Associado</label>
                  <select
                    value={funeralId}
                    onChange={(e) => setFuneralId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">— Nenhum —</option>
                    {funerals.map((funeral) => (
                      <option key={funeral.id} value={funeral.id}>
                        {funeral.deceased.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetModal}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-navy-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-navy-950 font-bold shadow flex items-center space-x-1.5 disabled:opacity-60"
                >
                  {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{uploading ? 'A carregar...' : 'Carregar'}</span>
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
                Remover Documento
              </h2>
              <button onClick={() => setDeleting(null)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-navy-200 leading-relaxed">
              Tem a certeza que pretende remover <span className="font-bold text-white">{deleting.title}</span>?
              Esta ação não pode ser anulada.
            </p>
            <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 rounded-xl bg-navy-800 text-navy-300 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteBusy}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs shadow flex items-center space-x-1.5 disabled:opacity-60"
              >
                {deleteBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Remover</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
