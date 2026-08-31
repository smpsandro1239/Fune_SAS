export type Locales = 'pt' | 'en' | 'fr' | 'es';

export const defaultLocale: Locales = 'pt';

const pt = {
  nav: {
    dashboard: 'Painel',
    overview: 'Visão Geral',
    funerals: 'Funerais & Falecidos',
    flyers: 'Editor de Flyers',
    documents: 'Gestão Documental',
    agenda: 'Agenda & Serviços',
    analytics: 'Relatórios & Métricas',
    generate: 'Gerar Documentos',
    publications: 'Publicações Sociais',
    condolences: 'Moderação Condolências',
    notifications: 'Notificações',
    agency: 'Configurações Agência',
    admin: 'Administração',
    profile: 'Meu Perfil',
    subscription: 'Plano & Subscrição',
    logout: 'Sair',
    section: 'Navegação Principal',
    interactive: 'Interativo',
    subtitle: 'Plataforma Funerária',
    newFlyer: 'Novo Flyer',
    logoutTitle: 'Terminar sessão',
    participationPortal: 'Portal de Participações',
    currentPlan: 'Plano Atual',
    managePlan: 'Gerir plano →',
  },
  welcome: {
    title: 'Bem-vindo',
  },
  btn: {
    save: 'Guardar',
    cancel: 'Cancelar',
    load: 'Carregar',
    export: 'Exportar',
  },
};

type Translation = typeof pt;

export const translations: Record<Locales, Translation> = {
  pt,
  en: {
    nav: {
      dashboard: 'Dashboard',
      overview: 'Overview',
      funerals: 'Funerals & Deceased',
      flyers: 'Flyer Editor',
      documents: 'Document Management',
      agenda: 'Agenda & Services',
      analytics: 'Reports & Metrics',
      generate: 'Generate Documents',
      publications: 'Social Publications',
      condolences: 'Condolence Moderation',
      notifications: 'Notifications',
      agency: 'Agency Settings',
      admin: 'Administration',
      profile: 'My Profile',
      subscription: 'Plan & Subscription',
      logout: 'Logout',
      section: 'Main Navigation',
      interactive: 'Interactive',
      subtitle: 'Funeral Platform',
      newFlyer: 'New Flyer',
      logoutTitle: 'End session',
      participationPortal: 'Participation Portal',
      currentPlan: 'Current Plan',
      managePlan: 'Manage plan →',
    },
    welcome: {
      title: 'Welcome',
    },
    btn: {
      save: 'Save',
      cancel: 'Cancel',
      load: 'Load',
      export: 'Export',
    },
  },
  fr: {
    nav: {
      dashboard: 'Tableau de bord',
      overview: "Vue d'ensemble",
      funerals: 'Funérailles & Défunts',
      flyers: 'Éditeur de flyers',
      documents: 'Gestion documentaire',
      agenda: 'Agenda & Services',
      analytics: 'Rapports & Métriques',
      generate: 'Générer des documents',
      publications: 'Publications sociales',
      condolences: 'Modération des condoléances',
      notifications: 'Notifications',
      agency: 'Paramètres de l’agence',
      admin: 'Administration',
      profile: 'Mon profil',
      subscription: 'Forfait & Abonnement',
      logout: 'Se déconnecter',
      section: 'Navigation principale',
      interactive: 'Interactif',
      subtitle: 'Plateforme funéraire',
      newFlyer: 'Nouveau flyer',
      logoutTitle: 'Mettre fin à la session',
      participationPortal: 'Portail de participation',
      currentPlan: 'Forfait actuel',
      managePlan: 'Gérer le forfait →',
    },
    welcome: {
      title: 'Bienvenue',
    },
    btn: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      load: 'Charger',
      export: 'Exporter',
    },
  },
  es: {
    nav: {
      dashboard: 'Panel',
      overview: 'Resumen',
      funerals: 'Funerales & Fallecidos',
      flyers: 'Editor de flyers',
      documents: 'Gestión documental',
      agenda: 'Agenda & Servicios',
      analytics: 'Informes & Métricas',
      generate: 'Generar documentos',
      publications: 'Publicaciones sociales',
      condolences: 'Moderación de condolencias',
      notifications: 'Notificaciones',
      agency: 'Ajustes de la agencia',
      admin: 'Administración',
      profile: 'Mi perfil',
      subscription: 'Plan & Suscripción',
      logout: 'Salir',
      section: 'Navegación principal',
      interactive: 'Interactivo',
      subtitle: 'Plataforma funeraria',
      newFlyer: 'Nuevo flyer',
      logoutTitle: 'Finalizar sesión',
      participationPortal: 'Portal de participación',
      currentPlan: 'Plan actual',
      managePlan: 'Gestionar plan →',
    },
    welcome: {
      title: 'Bienvenido',
    },
    btn: {
      save: 'Guardar',
      cancel: 'Cancelar',
      load: 'Cargar',
      export: 'Exportar',
    },
  },
};

export type TranslationKey = {
  [K in keyof Translation]: Translation[K] extends object
    ? `${K & string}.${{
        [J in keyof Translation[K]]: Translation[K][J] extends object
          ? `${J & string}.${Extract<keyof Translation[K][J], string>}`
          : J & string;
      }[keyof Translation[K]]}`
    : K & string;
}[keyof Translation];
