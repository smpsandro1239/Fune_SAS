'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import type { Locales } from '@/i18n/translations';

const OPTIONS: { value: Locales; label: string }[] = [
  { value: 'pt', label: 'PT' },
  { value: 'en', label: 'EN' },
  { value: 'fr', label: 'FR' },
  { value: 'es', label: 'ES' },
];

export default function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="relative flex items-center">
      <Languages className="w-3.5 h-3.5 text-gold-400 absolute left-2.5 pointer-events-none" />
      <select
        aria-label="Idioma / Language"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locales)}
        className="pl-8 pr-2 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-600 text-xs font-semibold text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
