export type SubscriptionPlan = 'FREE' | 'PRO' | 'ENTERPRISE';
export type UserRole = 'ADMIN' | 'OPERATOR' | 'DESIGNER';
export type FuneralStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
export type DocumentType = 'CERTIFICATE' | 'AUTHORIZATION' | 'CONTRACT' | 'IDENTITY';
export type FlyerPlan = 'FREE' | 'PREMIUM' | 'ULTRA';
export type FlyerFontFamily = 'serif' | 'sans' | 'display';

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

export type FlyerLayoutStyle =
  | 'casa-hortas'
  | 'classico-ouro'
  | 'sereno-minimal'
  | 'elegante-minimal'
  | 'classico-sobrio'
  | 'floral-suave'
  | 'dourado-premium'
  | 'marmore-premium'
  | 'luz-radiante'
  | 'jardim-premium'
  | 'velas-premium'
  | 'profundidade-3d'
  | 'aquarela-ultra'
  | 'video-ultra'
  | 'cruz-dourada'
  | 'rosa-eterna'
  | 'pomba-paz'
  | 'horizonte-sereno'
  | 'noite-estrelada'
  | 'memoria-viva'
  | 'anjo-guardiao'
  | 'folhas-outono'
  | 'cristal-azul'
  | 'aurora-boreal'
  | 'pergaminho-classico'
  | 'ondas-serenidade'
  | 'luz-eterna';

export interface FlyerTemplateConfig {
  id: string;
  name: string;
  plan: FlyerPlan;
  category: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: FlyerFontFamily;
  layoutStyle: FlyerLayoutStyle;
  animated?: boolean;
}

export interface PhotoTransform {
  x: number;
  y: number;
  zoom: number;
}

export interface FlyerData {
  title: string;
  deceasedName: string;
  age: number | string;
  photoUrl: string;
  photoDataUrl?: string;
  photoTransform?: PhotoTransform;
  funeralDate?: string;
  funeralTime?: string;
  funeralDateFormatted: string;
  parishLocation: string;
  cemeteryLocation: string;
  deathLocation: string;
  wakeDate?: string;
  wakeTime?: string;
  wakeLocation?: string;
  wakeDetailsFormatted: string;
  agencyName: string;
  agencyAddress: string;
  agencyLocation: string;
  agencyFounded: string;
  agencyWebsite: string;
  agencyLogoUrl: string;
  agencyLogoDataUrl?: string;
  agencyLogoType: 'IMAGE' | 'INITIALS';
  agencyInitials: string;
  primaryColor: string;
  accentColor: string;
  fontFamily?: FlyerFontFamily;
}
