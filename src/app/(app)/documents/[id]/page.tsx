'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Trash2,
  FileText,
  FileImage,
  File,
  AlertCircle,
  Loader2,
  Building2,
  Calendar,
  X,
  FileCheck,
} from 'lucide-react';
import {
  ApiDocument,
  DocumentType,
  apiErrorMessage,
  apiService,
  fetchFileBlobUrl,
  formatBytes,
} from '@/lib/api';

const TYPE_LABELS: Record<DocumentType, string> = {
  CERTIFICATE: 'Certidão',
  AUTHORIZATION: 'Autorização',
  CONTRACT: 'Contrato',
  IDENTITY: 'Identificação',
  PRESENCA: 'Declaração de Presença',
  PROGRAMA: 'Programa do Funeral',
  CREMACAO: 'Autorização de Cremação',
  TRANSPORTE_DOCS: 'Guia de Transporte',
  RELATORIO: 'Relatório de Serviço',
  SEPULTURA: 'Certidão de Sepultura',
  CONDOLENCIA: 'Carta de Condolências',
};

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [document, setDocument] = useState<ApiDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [blobUrl, setBlobUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiService.documents
      .get(params.id)
      .then((doc) => {
        if (cancelled) return;
        setDocument(doc);
        if (doc?.fileUrl) {
          fetchFileBlobUrl(doc.fileUrl)
            .then((url) => {
              if (!cancelled) setBlobUrl(url);
            })
            .catch(() => {
              /* pré-visualização fica vazia; download continua disponível via blob */
            });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(apiErrorMessage(err, 'Documento não encontrado.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const handleDelete = async () => {
    if (!document) return;
    setDeleteBusy(true);
    try {
      await apiService.documents.remove(document.id);
      router.replace('/documents');
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível remover o documento.'));
      setShowDelete(false);
    } finally {
      setDeleteBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-7 h-7 animate-spin text-gold-400" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-10 rounded-2xl bg-navy-900/80 border border-navy-800 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <p className="text-sm font-semibold text-white">{error || 'Documento não encontrado.'}</p>
        <Link href="/documents" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-400 hover:text-gold-300">
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar à listagem
        </Link>
      </div>
    );
  }

  const isPdf = document.mimeType === 'application/pdf';

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/documents"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-300 hover:text-gold-300 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar aos documentos
          </Link>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            {isPdf ? <File className="w-5 h-5 text-gold-400" /> : <FileImage className="w-5 h-5 text-gold-400" />}
            {document.title}
          </h1>
          <p className="text-xs text-navy-300 mt-0.5">
            {TYPE_LABELS[document.type] || document.type} • {formatBytes(document.fileSize)} •{' '}
            {new Date(document.createdAt).toLocaleString('pt-PT')}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={blobUrl || undefined}
            download={document.fileName}
            aria-disabled={!blobUrl}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-400 text-navy-950 font-bold text-xs shadow-lg transition-all hover:brightness-110 ${blobUrl ? '' : 'opacity-60 pointer-events-none'}`}
          >
            <Download className="w-4 h-4" />
            <span>Descarregar</span>
          </a>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-navy-800 hover:bg-red-500/20 text-navy-300 hover:text-red-300 border border-navy-700 text-xs font-semibold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remover</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Metadados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-800">
          <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-1">Tipo</p>
          <p className="text-sm font-semibold text-white flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-gold-400" />
            {TYPE_LABELS[document.type] || document.type}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-800">
          <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-1">Tamanho</p>
          <p className="text-sm font-semibold text-white">{formatBytes(document.fileSize)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-800">
          <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-1">Carregado a</p>
          <p className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gold-400" />
            {new Date(document.createdAt).toLocaleDateString('pt-PT')}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-800">
          <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider mb-1">Funeral Associado</p>
          {document.funeral ? (
            <Link
              href={`/funerals/${document.funeral.id}`}
              className="text-sm font-semibold text-gold-400 hover:text-gold-300 flex items-center gap-1.5"
            >
              <Building2 className="w-4 h-4" />
              <span className="truncate">{document.funeral.deceased.fullName}</span>
            </Link>
          ) : (
            <p className="text-sm text-navy-500">— Nenhum —</p>
          )}
        </div>
      </div>

      {/* Pré-visualização */}
      <div className="p-5 rounded-2xl bg-navy-900/80 border border-navy-800 space-y-3 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-gold-400" />
          Pré-visualização
        </h2>
        {blobUrl ? (
          isPdf ? (
            <iframe src={blobUrl} title={document.title} className="w-full h-[600px] rounded-xl border border-navy-700 bg-white" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={blobUrl}
              alt={document.title}
              className="max-h-[600px] mx-auto rounded-xl border border-navy-700 object-contain bg-navy-950"
            />
          )
        ) : (
          <div className="flex items-center justify-center h-[200px] rounded-xl border border-navy-700 bg-navy-950">
            <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
          </div>
        )}
      </div>

      {/* Modal: confirmar remoção */}
      {showDelete && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" />
                Remover Documento
              </h2>
              <button onClick={() => setShowDelete(false)} className="text-navy-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-navy-200 leading-relaxed">
              Tem a certeza que pretende remover <span className="font-bold text-white">{document.title}</span>?
              Esta ação não pode ser anulada.
            </p>
            <div className="pt-3 border-t border-navy-800 flex justify-end gap-2">
              <button
                onClick={() => setShowDelete(false)}
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
