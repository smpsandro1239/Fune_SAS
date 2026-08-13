export type SubscriptionPlan = 'FREE' | 'PRO' | 'ENTERPRISE';
export type UserRole = 'ADMIN' | 'OPERATOR' | 'DESIGNER';
export type FuneralStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
export type DocumentType = 'CERTIFICATE' | 'AUTHORIZATION' | 'CONTRACT' | 'IDENTITY';

export interface Agency {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  location?: string | null;
  foundedYear?: string | null;
  website?: string | null;
  subscriptionPlan: SubscriptionPlan;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agencyId: string;
}

export interface Deceased {
  id: string;
  fullName: string;
  age: number;
  dateOfBirth?: string | null;
  dateOfDeath: string;
  placeOfDeath?: string | null;
  photoUrl?: string | null;
  agencyId: string;
}

export interface Funeral {
  id: string;
  deceasedId: string;
  deceased: Deceased;
  agencyId: string;
  agency: Agency;
  funeralDate: string;
  funeralTime: string;
  locationParish: string;
  cemeteryLocation: string;
  wakeLocation: string;
  wakeDate?: string | null;
  wakeTime?: string | null;
  notes?: string | null;
  status: FuneralStatus;
  publicNoticeEnabled: boolean;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: DocumentType;
  fileUrl: string;
  fileSize?: string | null;
  agencyId: string;
  funeralId?: string | null;
  uploadedAt: string;
}

export interface FlyerTemplateConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: 'serif' | 'sans';
  layoutStyle: 'casa-hortas' | 'classico-ouro' | 'sereno-minimal';
}

export interface FlyerData {
  title: string; // e.g. "PARTICIPAÇÃO DE FALECIMENTO"
  deceasedName: string;
  age: number | string;
  photoUrl: string;
  funeralDateFormatted: string; // e.g. "Quarta-feira, dia 8 de julho, 17:00 horas"
  parishLocation: string; // e.g. "Igreja Paroquial da Ventosa, Braga"
  cemeteryLocation: string; // e.g. "Ventosa, Vieira do Minho"
  deathLocation: string; // e.g. "Hospital de Braga"
  wakeDetailsFormatted: string; // e.g. "Quarta-feira, dia 8 de julho, 15:30 horas, na Igreja Paroquial da Ventosa"
  agencyName: string; // e.g. "Funerária Casa Hortas, Lda"
  agencyAddress: string; // e.g. "Rua das Maceirinhas, Cabreiros, Braga"
  agencyLocation: string; // e.g. "Ventosa, Vieira do Minho"
  agencyFounded: string; // e.g. "DESDE 1890"
  agencyWebsite: string; // e.g. "www.casahortas.com"
  agencyLogoUrl: string;
  primaryColor: string;
  accentColor: string;
}
