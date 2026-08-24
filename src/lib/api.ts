import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const API_ORIGIN = API_BASE.replace(/\/api$/, '');

export const ACCESS_TOKEN_KEY = 'fune.accessToken';
export const REFRESH_TOKEN_KEY = 'fune.refreshToken';

export type SubscriptionPlan = 'FREE' | 'PRO' | 'ENTERPRISE';
export type UserRole = 'ADMIN' | 'OPERATOR' | 'DESIGNER';
export type FuneralStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
export type ServiceType = 'CERIMONIA' | 'VELORIO' | 'CREMACAO' | 'TRANSPORTE' | 'ACOLHIMENTO' | 'OUTRO';
export type DocumentType = 'CERTIFICATE' | 'AUTHORIZATION' | 'CONTRACT' | 'IDENTITY' | 'PRESENCA' | 'PROGRAMA' | 'CREMACAO' | 'TRANSPORTE_DOCS' | 'RELATORIO' | 'SEPULTURA' | 'CONDOLENCIA';

export type PublicationPlatform = 'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN' | 'TWITTER' | 'TIKTOK' | 'YOUTUBE';
export type PublicationStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED' | 'CANCELED';

export interface ApiAgency {
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
  facebookPageUrl?: string | null;
  facebookPageId?: string | null;
  facebookPageAccessToken?: string | null;
  instagramPageUrl?: string | null;
  instagramBusinessId?: string | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiUser {
  id: string;
  agencyId: string;
  name: string;
  email: string;
  role: UserRole;
  agency?: ApiAgency;
  createdAt: string;
  updatedAt: string;
}

export interface ApiDeceased {
  id: string;
  agencyId: string;
  fullName: string;
  age?: number | null;
  dateOfBirth?: string | null;
  dateOfDeath?: string | null;
  placeOfDeath?: string | null;
  photoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiDocument {
  id: string;
  agencyId: string;
  funeralId?: string | null;
  funeral?: {
    id: string;
    funeralDate: string;
    deceased: { fullName: string };
  } | null;
  title: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedById?: string | null;
  createdAt: string;
}

export interface ApiFuneral {
  id: string;
  agencyId: string;
  deceasedId: string;
  deceased: ApiDeceased;
  serviceType: ServiceType;
  funeralDate: string;
  funeralTime?: string | null;
  locationParish?: string | null;
  cemeteryLocation?: string | null;
  wakeLocation?: string | null;
  wakeDate?: string | null;
  wakeTime?: string | null;
  notes?: string | null;
  status: FuneralStatus;
  publicNoticeEnabled: boolean;
  documents?: ApiDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

export interface DashboardSummary {
  funerals: number;
  completed: number;
  scheduled: number;
  documents: number;
  templates: number;
}

export interface FuneralsPerPeriod {
  groupBy: 'day' | 'month' | 'year';
  total: number;
  periods: { period: string; count: number }[];
}

export interface ServicesUsage {
  total: number;
  services: { serviceType: ServiceType; count: number; percentage: number }[];
}

export interface ApiNotification {
  id: string;
  agencyId: string;
  userId: string | null;
  type: 'EMAIL' | 'SMS' | 'TAREFA' | 'LEMBRETE' | 'SISTEMA';
  title: string;
  message: string;
  readAt: string | null;
  sentAt: string;
}

export interface ApiSubscription {
  id: string;
  agencyId: string;
  plan: SubscriptionPlan;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
  priceCents: number | null;
  validUntil: string | null;
  startedAt: string;
  createdAt: string;
  agency?: { subscriptionPlan: SubscriptionPlan };
}

export interface ApiPublication {
  id: string;
  agencyId: string;
  funeralId?: string | null;
  funeral?: { id: string; funeralDate: string; deceased: { fullName: string } } | null;
  title: string;
  caption: string;
  imageUrl?: string | null;
  platform: PublicationPlatform;
  status: PublicationStatus;
  scheduledFor?: string | null;
  publishedAt?: string | null;
  externalPostId?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SocialStatus {
  facebook: { connected: boolean; pageId?: string; pageUrl?: string };
  instagram: { connected: boolean; account?: string; pageUrl?: string };
  linkedin: { connected: boolean; url?: string };
  twitter: { connected: boolean; url?: string };
  youtube: { connected: boolean; url?: string };
  tiktok: { connected: boolean; url?: string };
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function storeTokens(pair: TokenPair) {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, pair.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, pair.refreshToken);
}

export function clearTokens() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function resolveFileUrl(fileUrl?: string | null): string {
  if (!fileUrl) return '';
  if (fileUrl.startsWith('http')) return fileUrl;
  // Uploads deixaram de ser estáticos: /uploads/X é servido por /documents/file/X (autenticado)
  const uploadsMatch = fileUrl.match(/^\/uploads\/(.+)$/);
  if (uploadsMatch) return `${API_ORIGIN}/documents/file/${uploadsMatch[1]}`;
  return `${API_ORIGIN}${fileUrl}`;
}

/**
 * Descarrega um ficheiro de upload com autenticação e devolve um object URL
 * utilizável em <iframe>/<img>/<a> (que não conseguem enviar headers Bearer).
 */
export async function fetchFileBlobUrl(fileUrl: string): Promise<string> {
  const token = getAccessToken();
  const res = await fetch(resolveFileUrl(fileUrl), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error('Não foi possível carregar o ficheiro.');
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function apiErrorMessage(error: unknown, fallback = 'Ocorreu um erro. Tente novamente.'): string {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string | string[] })?.message;
    if (Array.isArray(message)) return message[0];
    if (typeof message === 'string' && message) return message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post<TokenPair>(`${API_BASE}/auth/refresh`, { refreshToken });
    storeTokens(data);
    return data.accessToken;
  } catch {
    clearTokens();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isAuthEndpoint = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/refresh');
    if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      if (!refreshing) {
        refreshing = refreshAccessToken().finally(() => {
          refreshing = null;
        });
      }
      const newToken = await refreshing;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export const apiService = {
  auth: {
    login: (email: string, password: string) =>
      api.post<TokenPair>('/auth/login', { email, password }).then((r) => r.data),
    refresh: (refreshToken: string) =>
      api.post<TokenPair>('/auth/refresh', { refreshToken }).then((r) => r.data),
    logout: (refreshToken: string) =>
      api.post<{ success: boolean }>('/auth/logout', { refreshToken }).then((r) => r.data),
    me: () => api.get<ApiUser>('/auth/me').then((r) => r.data),
    updateProfile: (data: { name?: string; email?: string }) =>
      api.patch<ApiUser>('/auth/me', data).then((r) => r.data),
    changePassword: (currentPassword: string, newPassword: string) =>
      api.post<{ success: boolean }>('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),
  },

  agencies: {
    me: () => api.get<ApiAgency>('/agencies/me').then((r) => r.data),
    update: (data: Partial<ApiAgency>) => api.patch<ApiAgency>('/agencies/me', data).then((r) => r.data),
  },

  funerals: {
    list: (params?: { search?: string; status?: FuneralStatus; from?: string; to?: string }) =>
      api.get<ApiFuneral[]>('/funerals', { params }).then((r) => r.data),
    get: (id: string) => api.get<ApiFuneral>(`/funerals/${id}`).then((r) => r.data),
    create: (data: Record<string, unknown>) => api.post<ApiFuneral>('/funerals', data).then((r) => r.data),
    update: (id: string, data: Record<string, unknown>) =>
      api.patch<ApiFuneral>(`/funerals/${id}`, data).then((r) => r.data),
    remove: (id: string) => api.delete<{ success: boolean }>(`/funerals/${id}`).then((r) => r.data),
  },

  deceased: {
    list: (search?: string) => api.get<ApiDeceased[]>('/deceased', { params: { search } }).then((r) => r.data),
    create: (data: Record<string, unknown>) => api.post<ApiDeceased>('/deceased', data).then((r) => r.data),
    update: (id: string, data: Record<string, unknown>) =>
      api.patch<ApiDeceased>(`/deceased/${id}`, data).then((r) => r.data),
    remove: (id: string) => api.delete<{ success: boolean }>(`/deceased/${id}`).then((r) => r.data),
  },

  documents: {
    list: (params?: { search?: string; type?: DocumentType; from?: string; to?: string }) =>
      api.get<ApiDocument[]>('/documents', { params }).then((r) => r.data),
    get: (id: string) => api.get<ApiDocument>(`/documents/${id}`).then((r) => r.data),
    upload: (formData: FormData) =>
      api.post<ApiDocument>('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data),
    remove: (id: string) => api.delete<{ success: boolean }>(`/documents/${id}`).then((r) => r.data),
  },

  users: {
    list: () => api.get<ApiUser[]>('/users').then((r) => r.data),
    create: (data: { name: string; email: string; password: string; role: UserRole }) =>
      api.post<ApiUser>('/users', data).then((r) => r.data),
    update: (id: string, data: Partial<{ name: string; email: string; password: string; role: UserRole }>) =>
      api.patch<ApiUser>(`/users/${id}`, data).then((r) => r.data),
    remove: (id: string) => api.delete<{ success: boolean }>(`/users/${id}`).then((r) => r.data),
  },

  reports: {
    dashboard: () => api.get<DashboardSummary>('/reports/dashboard').then((r) => r.data),
    funeralsPerPeriod: (groupBy: 'day' | 'month' | 'year' = 'month') =>
      api.get<FuneralsPerPeriod>('/reports/funerals-per-period', { params: { groupBy } }).then((r) => r.data),
    servicesUsage: () => api.get<ServicesUsage>('/reports/services-usage').then((r) => r.data),
  },

  notifications: {
    list: (unreadOnly = false) =>
      api.get<ApiNotification[]>('/notifications', { params: unreadOnly ? { unread: 'true' } : {} }).then((r) => r.data),
    markRead: (id: string) =>
      api.patch<ApiNotification>(`/notifications/${id}/read`).then((r) => r.data),
    markAllRead: () =>
      api.post<{ count: number }>('/notifications/read-all').then((r) => r.data),
  },

  subscriptions: {
    current: () =>
      api.get<ApiSubscription>('/subscriptions/current').then((r) => r.data),
    history: () =>
      api.get<ApiSubscription[]>('/subscriptions/history').then((r) => r.data),
    changePlan: (plan: SubscriptionPlan) =>
      api.post<ApiSubscription>('/subscriptions/change-plan', { plan }).then((r) => r.data),
  },

  drafts: {
    list: () =>
      api.get<{ id: string; name: string; layoutStyle: string; createdAt: string; updatedAt: string }[]>('/drafts').then((r) => r.data),
    get: (id: string) =>
      api.get<{ id: string; name: string; layoutStyle: string; data: any; createdAt: string; updatedAt: string }>(`/drafts/${id}`).then((r) => r.data),
    save: (name: string, layoutStyle: string, data: any) =>
      api.post<{ id: string }>('/drafts', { name, layoutStyle, data }).then((r) => r.data),
    update: (id: string, name: string, layoutStyle: string, data: any) =>
      api.put<{ id: string }>(`/drafts/${id}`, { name, layoutStyle, data }).then((r) => r.data),
    delete: (id: string) =>
      api.delete(`/drafts/${id}`).then((r) => r.data),
  },

  docGenerate: {
    generate: async (funeralId: string, type: string, extraData?: Record<string, any>): Promise<Blob> => {
      const response = await api.post('/documents/generate', { funeralId, type, extraData }, { responseType: 'blob' });
      return response.data;
    },
  },

  publications: {
    list: (status?: string) =>
      api.get<ApiPublication[]>('/publications', { params: status ? { status } : {} }).then((r) => r.data),
    get: (id: string) =>
      api.get<ApiPublication>(`/publications/${id}`).then((r) => r.data),
    create: (data: { title: string; caption: string; platform: string; funeralId?: string; imageUrl?: string; scheduledFor?: string }) =>
      api.post<ApiPublication>('/publications', data).then((r) => r.data),
    update: (id: string, data: { title?: string; caption?: string; scheduledFor?: string; status?: string }) =>
      api.patch<ApiPublication>(`/publications/${id}`, data).then((r) => r.data),
    remove: (id: string) =>
      api.delete<{ success: boolean }>(`/publications/${id}`).then((r) => r.data),
    upcoming: () =>
      api.get<ApiPublication[]>('/publications/upcoming').then((r) => r.data),
  },

  social: {
    status: () =>
      api.get<SocialStatus>('/social/status').then((r) => r.data),
    publish: (publicationId: string, platform: string) =>
      api.post<{ success: boolean; postId?: string; error?: string }>(`/social/publish/${publicationId}/${platform}`).then((r) => r.data),
    processScheduled: () =>
      api.post<{ processed: number }>('/social/process-scheduled').then((r) => r.data),
  },
};

export default api;
