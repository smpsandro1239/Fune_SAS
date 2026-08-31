'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  translations,
  defaultLocale,
  type Locales,
  type TranslationKey,
} from '@/i18n/translations';

const STORAGE_KEY = 'fune.locale';

interface I18nContextValue {
  locale: Locales;
  setLocale: (locale: Locales) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function lookup(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locales>(defaultLocale);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locales | null;
      if (stored && stored in translations) {
        setLocaleState(stored);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const setLocale = useCallback((next: Locales) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    const value = lookup(translations[locale] as unknown as Record<string, unknown>, key);
    if (typeof value === 'string') return value;
    const pt = lookup(translations.pt as unknown as Record<string, unknown>, key);
    if (typeof pt === 'string') return pt;
    return key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within a LocaleProvider');
  }
  return ctx;
}
