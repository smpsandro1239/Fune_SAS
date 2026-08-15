'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { ImagePlus, Loader2, Trash2, UploadCloud, X } from 'lucide-react';

const ACCEPTED = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] };
const MAX_SIZE_MB = 5;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface ImageUploaderProps {
  id: string;
  label: string;
  description?: string;
  value?: string;
  onUpload: (base64: string) => void;
  onClear?: () => void;
  circular?: boolean;
  compact?: boolean;
}

export default function ImageUploader({
  id,
  label,
  description,
  value,
  onUpload,
  onClear,
  circular = false,
  compact = false,
}: ImageUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        const file = rejected[0].file;
        const tooBig = file.size > MAX_SIZE_MB * 1024 * 1024;
        setError(
          tooBig
            ? `Ficheiro demasiado grande (máx. ${MAX_SIZE_MB}MB).`
            : 'Formato inválido. Use JPG, PNG ou WebP.'
        );
        return;
      }
      const file = accepted[0];
      if (!file) return;
      setError(null);
      setIsLoading(true);
      try {
        const base64 = await fileToBase64(file);
        onUpload(base64);
      } catch {
        setError('Ocorreu um erro ao processar a imagem.');
      } finally {
        setIsLoading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    noClick: true,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
    onDropAccepted: () => setIsDragOver(false),
    onDropRejected: () => setIsDragOver(false),
  });

  const hasValue = Boolean(value);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-navy-200">
        {label}
      </label>

      <div
        {...getRootProps()}
        role="button"
        tabIndex={0}
        aria-label={`${label} — carregar imagem por clique ou arrastar para aqui`}
        aria-describedby={error ? `${id}-error` : undefined}
        onClick={() => !hasValue && !isLoading && open()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !hasValue && !isLoading) {
            e.preventDefault();
            open();
          }
        }}
        className={`relative rounded-xl border-2 border-dashed transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
          isDragOver
            ? 'border-gold-400 bg-gold-500/10 scale-[1.01]'
            : hasValue
            ? 'border-navy-600 bg-navy-950/40'
            : 'border-navy-600 bg-navy-950/60 hover:border-gold-500/50 hover:bg-navy-900/60'
        } ${compact ? 'p-2.5' : 'p-4'}`}
      >
        <input {...getInputProps()} id={id} aria-hidden="true" />

        {hasValue ? (
          <div className={`relative overflow-hidden ${circular ? 'w-24 h-24 rounded-full mx-auto' : 'w-full h-32 rounded-lg'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Pré-visualização carregada" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity">
              <div className="flex gap-2 p-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    open();
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/90 text-navy-950 text-[10px] font-bold hover:bg-white"
                >
                  <ImagePlus className="w-3 h-3" />
                  Substituir
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear?.();
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/90 text-white text-[10px] font-bold hover:bg-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                  Remover
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex flex-col items-center justify-center text-center gap-1.5 ${compact ? 'py-1' : 'py-4'}`}>
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-gold-400 animate-spin" />
            ) : isDragOver ? (
              <UploadCloud className="w-6 h-6 text-gold-400 fs-anim-float" />
            ) : (
              <UploadCloud className="w-6 h-6 text-navy-400" />
            )}
            <p className="text-[11px] font-medium text-navy-300">
              {isLoading ? 'A processar imagem...' : isDragOver ? 'Largue aqui a imagem' : 'Arraste & solte ou clique para carregar'}
            </p>
            {description && <p className="text-[9.5px] text-navy-500">{description}</p>}
            <p className="text-[9.5px] text-navy-500">JPG, PNG ou WebP • máx. {MAX_SIZE_MB}MB</p>
          </div>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-[10px] text-red-400 font-medium">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
