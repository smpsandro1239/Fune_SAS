'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Agency } from '@/lib/types';

export interface AgencyExtended extends Agency {
  badge?: string;
  initials?: string;
  logoType?: 'IMAGE' | 'INITIALS';
}

interface AgencyContextType {
  agencies: AgencyExtended[];
  currentAgency: AgencyExtended;
  switchAgency: (slug: string) => void;
  addAgency: (newAgency: Omit<AgencyExtended, 'id'>) => void;
}

const INITIAL_AGENCIES: AgencyExtended[] = [
  {
    id: '1',
    name: 'Funerária Casa Hortas, Lda',
    slug: 'casa-hortas',
    logoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=300',
    initials: 'CH',
    logoType: 'INITIALS',
    phone: '+351 253 123 456',
    email: 'geral@casahortas.com',
    address: 'Rua das Maceirinhas, Cabreiros, Braga',
    location: 'Ventosa, Vieira do Minho',
    foundedYear: 'DESDE 1890',
    website: 'www.casahortas.com',
    subscriptionPlan: 'PRO',
    badge: 'Sede Principal',
  },
  {
    id: '2',
    name: 'Agência Funerária Minho Central',
    slug: 'minho-central',
    logoUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=300',
    initials: 'MC',
    logoType: 'IMAGE',
    phone: '+351 253 987 654',
    email: 'contacto@minhocentral.pt',
    address: 'Avenida Central, 140, Braga',
    location: 'Braga',
    foundedYear: 'DESDE 1975',
    website: 'www.minhocentral.pt',
    subscriptionPlan: 'ENTERPRISE',
    badge: 'Filial Braga',
  },
];

const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

export function AgencyProvider({ children }: { children: React.ReactNode }) {
  const [agencies, setAgencies] = useState<AgencyExtended[]>(INITIAL_AGENCIES);
  const [currentSlug, setCurrentSlug] = useState<string>('casa-hortas');

  const currentAgency = agencies.find((a) => a.slug === currentSlug) || agencies[0];

  const switchAgency = (slug: string) => {
    setCurrentSlug(slug);
  };

  const addAgency = (agencyData: Omit<AgencyExtended, 'id'>) => {
    const newAgencyObj: AgencyExtended = {
      ...agencyData,
      id: Date.now().toString(),
    };
    setAgencies((prev) => [...prev, newAgencyObj]);
    setCurrentSlug(newAgencyObj.slug);
  };

  return (
    <AgencyContext.Provider
      value={{
        agencies,
        currentAgency,
        switchAgency,
        addAgency,
      }}
    >
      {children}
    </AgencyContext.Provider>
  );
}

export function useAgency() {
  const context = useContext(AgencyContext);
  if (!context) {
    throw new Error('useAgency must be used within an AgencyProvider');
  }
  return context;
}
