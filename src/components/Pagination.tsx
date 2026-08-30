'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, pageCount, total, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
      <span className="text-[10px] text-navy-400 mr-1">
        {total} {total === 1 ? 'item' : 'itens'}
      </span>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Página anterior"
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-900 text-navy-300 text-[11px] font-semibold border border-navy-700 hover:bg-navy-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Anterior</span>
      </button>
      <span className="px-3 py-1.5 rounded-lg bg-navy-900 text-navy-200 text-[11px] font-semibold border border-navy-700">
        Página {page} de {pageCount}
      </span>
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        aria-label="Página seguinte"
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-900 text-navy-300 text-[11px] font-semibold border border-navy-700 hover:bg-navy-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <span className="hidden sm:inline">Seguinte</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
