'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiAgency, apiService } from '@/lib/api';

export interface AgencyExtended extends ApiAgency {
  badge?: string;
  initials?: string;
  logoType?: 'IMAGE' | 'INITIALS';
}

interface AgencyContextType {
  currentAgency: AgencyExtended | null;
  loading: boolean;
  reload: () => Promise<void>;
}

function initialsFrom(name: string): string {
  return name
    .split(' ')
    .filter((part) => part.length > 2)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

export function AgencyProvider({ children }: { children: React.ReactNode }) {
  const [currentAgency, setCurrentAgency] = useState<AgencyExtended | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const agency = await apiService.agencies.me();
      setCurrentAgency({
        ...agency,
        initials: initialsFrom(agency.name),
        logoType: agency.logoUrl ? 'IMAGE' : 'INITIALS',
      });
    } catch {
      setCurrentAgency(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo(() => ({ currentAgency, loading, reload }), [currentAgency, loading, reload]);

  return <AgencyContext.Provider value={value}>{children}</AgencyContext.Provider>;
}

export function useAgency() {
  const context = useContext(AgencyContext);
  if (!context) {
    throw new Error('useAgency deve ser usado dentro de AgencyProvider');
  }
  return context;
}
