/**
 * 🛣️ TASKY - Configuration des routes
 *
 * Centralisation de TOUTES les routes de l'application.
 * Facilite la navigation et la maintenance.
 *
 * Usage:
 * import { routes } from '@/config/routes';
 * <Link href={routes.client.dashboard}>Dashboard</Link>
 */

export const routes = {
  /**
   * 🏠 PUBLIC - Pages publiques
   */
  public: {
    home: "/",
    about: "/about",
    contact: "/contact",
    legal: {
      cgu: "/legal/cgu",
      privacy: "/legal/privacy",
      cookies: "/legal/cookies",
      mentions: "/legal/mentions",
    },
  },

  /**
   * 🔐 AUTH - Authentification
   */
  auth: {
    login: "/auth/login",
    register: {
      client: "/auth/register/client",
      artisan: {
        step1: "/auth/register/artisan/step-1",
        step2: "/auth/register/artisan/step-2",
        step3: "/auth/register/artisan/step-3",
        step4: "/auth/register/artisan/step-4",
      },
    },
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyEmail: "/auth/verify-email",
  },

  /**
   * 👤 CLIENT - Pages client
   */
  client: {
    // Dashboard
    dashboard: "/client/dashboard",

    // Profil
    profile: {
      view: "/client/profile",
      edit: "/client/profile/edit",
      settings: "/client/settings",
    },

    // Demandes
    requests: {
      list: "/client/requests",
      new: "/client/requests/new",
      detail: (id: string) => `/client/requests/${id}`,
      edit: (id: string) => `/client/requests/${id}/edit`,
    },

    // Devis reçus
    devis: {
      list: (requestId: string) => `/client/requests/${requestId}/devis`,
      detail: (requestId: string, devisId: string) =>
        `/client/requests/${requestId}/devis/${devisId}`,
    },

    // Recherche de prestataires
    search: {
      base: "/client/search",
      category: (categoryId: string) => `/client/search?category=${categoryId}`,
      results: "/client/search/results",
    },

    // Prestataires
    prestataires: {
      list: "/client/prestataires",
      detail: (id: string) => `/client/prestataires/${id}`,
    },

    // Messages
    messages: {
      list: "/client/messages",
      conversation: (id: string) => `/client/messages/${id}`,
    },

    // Prestations en cours
    prestations: {
      list: "/client/prestations",
      detail: (id: string) => `/client/prestations/${id}`,
      timeline: (id: string) => `/client/prestations/${id}/timeline`,
    },

    // Paiement
    payment: {
      methods: "/client/payment/methods",
      history: "/client/payment/history",
      invoice: (id: string) => `/client/payment/invoices/${id}`,
    },

    // Avis
    reviews: {
      list: "/client/reviews",
      create: (prestationId: string) =>
        `/client/reviews/new?prestation=${prestationId}`,
    },

    // Notifications
    notifications: "/client/notifications",

    // Paramètres
    settings: {
      account: "/client/settings/account",
      password: "/client/settings/password",
      email: "/client/settings/email",
      notifications: "/client/settings/notifications",
      privacy: "/client/settings/privacy",
      delete: "/client/settings/delete-account",
    },
  },

  /**
   * 🛠️ ARTISAN - Pages artisan/prestataire
   */
  artisan: {
    // Dashboard
    dashboard: "/artisan/dashboard",

    // Profil
    profile: {
      view: "/artisan/profile",
      edit: "/artisan/profile/edit",
      public: (id: string) => `/artisan/profile/${id}`,
      settings: "/artisan/settings",
    },

    // Demandes disponibles
    requests: {
      list: "/artisan/requests",
      available: "/artisan/requests/available",
      detail: (id: string) => `/artisan/requests/${id}`,
      sendDevis: (id: string) => `/artisan/requests/${id}/devis/new`,
    },

    // Mes prestations
    services: {
      list: "/artisan/services",
      enCours: "/artisan/services/en-cours",
      terminees: "/artisan/services/terminees",
      detail: (id: string) => `/artisan/services/${id}`,
      timeline: (id: string) => `/artisan/services/${id}/timeline`,
    },

    // Devis envoyés
    devis: {
      list: "/artisan/devis",
      enAttente: "/artisan/devis/en-attente",
      acceptes: "/artisan/devis/acceptes",
      refuses: "/artisan/devis/refuses",
      detail: (id: string) => `/artisan/devis/${id}`,
      edit: (id: string) => `/artisan/devis/${id}/edit`,
    },

    // Messages
    messages: {
      list: "/artisan/messages",
      conversation: (id: string) => `/artisan/messages/${id}`,
    },

    // Points neutres
    pointsNeutres: {
      list: "/artisan/points-neutres",
      add: "/artisan/points-neutres/new",
      edit: (id: string) => `/artisan/points-neutres/${id}/edit`,
    },

    // Revenus
    earnings: {
      overview: "/artisan/earnings",
      history: "/artisan/earnings/history",
      payout: "/artisan/earnings/payout",
    },

    // Statistiques
    stats: "/artisan/stats",

    // Avis reçus
    reviews: {
      list: "/artisan/reviews",
      detail: (id: string) => `/artisan/reviews/${id}`,
    },

    // Calendrier / Disponibilités
    calendar: "/artisan/calendar",

    // Notifications
    notifications: "/artisan/notifications",

    // Paramètres
    settings: {
      account: "/artisan/settings/account",
      password: "/artisan/settings/password",
      email: "/artisan/settings/email",
      paiement: "/artisan/settings/paiement",
      notifications: "/artisan/settings/notifications",
      privacy: "/artisan/settings/privacy",
      identity: "/artisan/settings/identity",
      delete: "/artisan/settings/delete-account",
    },
  },

  /**
   * 🎨 DEMO - Pages de démonstration
   */
  demo: {
    dashClient: "/demo/dashClient",
    dashArtisan: "/demo/dashArtisan",
    categoryTest: "/demo/category-test",
  },

  /**
   * 👨‍💼 ADMIN - Pages admin (futures)
   */
  admin: {
    dashboard: "/admin/dashboard",
    users: {
      list: "/admin/users",
      detail: (id: string) => `/admin/users/${id}`,
    },
    demandes: {
      list: "/admin/demandes",
      detail: (id: string) => `/admin/demandes/${id}`,
    },
    categories: {
      list: "/admin/categories",
      add: "/admin/categories/new",
      edit: (id: string) => `/admin/categories/${id}/edit`,
    },
    reports: "/admin/reports",
    settings: "/admin/settings",
  },

  /**
   * 🔔 API - Routes API (pour le backend)
   */
  api: {
    auth: {
      register: "/api/auth/register",
      login: "/api/auth/login",
      logout: "/api/auth/logout",
      refresh: "/api/auth/refresh",
      forgotPassword: "/api/auth/forgot-password",
      resetPassword: "/api/auth/reset-password",
      verifyEmail: "/api/auth/verify-email",
      me: "/api/auth/me",
    },
    users: {
      profile: "/api/users/profile",
      update: "/api/users/update",
      avatar: "/api/users/avatar",
      delete: "/api/users/delete",
    },
    demandes: {
      list: "/api/demandes",
      create: "/api/demandes",
      detail: (id: string) => `/api/demandes/${id}`,
      update: (id: string) => `/api/demandes/${id}`,
      delete: (id: string) => `/api/demandes/${id}`,
    },
    devis: {
      list: (demandeId: string) => `/api/demandes/${demandeId}/devis`,
      create: (demandeId: string) => `/api/demandes/${demandeId}/devis`,
      detail: (id: string) => `/api/devis/${id}`,
      accept: (id: string) => `/api/devis/${id}/accept`,
      refuse: (id: string) => `/api/devis/${id}/refuse`,
    },
    messages: {
      list: "/api/messages",
      conversation: (id: string) => `/api/messages/${id}`,
      send: "/api/messages/send",
    },
    categories: {
      list: "/api/categories",
      detail: (id: string) => `/api/categories/${id}`,
    },
    prestations: {
      list: "/api/prestations",
      detail: (id: string) => `/api/prestations/${id}`,
      updateStatus: (id: string) => `/api/prestations/${id}/status`,
    },
    pointsNeutres: {
      list: "/api/points-neutres",
      create: "/api/points-neutres",
      update: (id: string) => `/api/points-neutres/${id}`,
      delete: (id: string) => `/api/points-neutres/${id}`,
    },
    reviews: {
      list: "/api/reviews",
      create: "/api/reviews",
      detail: (id: string) => `/api/reviews/${id}`,
    },
    payment: {
      createPaymentIntent: "/api/payment/create-intent",
      confirmPayment: "/api/payment/confirm",
      refund: (id: string) => `/api/payment/${id}/refund`,
    },
  },
};

/**
 * 🔗 Helpers pour la navigation
 */
export const navigation = {
  /**
   * Navigation principale client
   */
  clientNav: [
    { label: "Dashboard", href: routes.client.dashboard, icon: "🏠" },
    { label: "Recherche", href: routes.client.search.base, icon: "🔍" },
    { label: "Mes demandes", href: routes.client.requests.list, icon: "📋" },
    { label: "Messages", href: routes.client.messages.list, icon: "💬" },
  ],

  /**
   * Navigation principale artisan
   */
  artisanNav: [
    { label: "Dashboard", href: routes.artisan.dashboard, icon: "🏠" },
    { label: "Demandes", href: routes.artisan.requests.list, icon: "📋" },
    {
      label: "Mes prestations",
      href: routes.artisan.services.list,
      icon: "🛠️",
    },
    { label: "Messages", href: routes.artisan.messages.list, icon: "💬" },
  ],

  /**
   * Navigation footer
   */
  footerNav: [
    { label: "À propos", href: routes.public.about },
    { label: "Contact", href: routes.public.contact },
    { label: "CGU", href: routes.public.legal.cgu },
    { label: "Confidentialité", href: routes.public.legal.privacy },
  ],
};

/**
 * 🔒 Routes protégées (nécessitent authentification)
 */
export const protectedRoutes = {
  client: Object.values(routes.client).flat(),
  artisan: Object.values(routes.artisan).flat(),
  admin: Object.values(routes.admin).flat(),
};

/**
 * 🌐 Routes publiques (accessibles sans auth)
 */
export const publicRoutes = [
  routes.public.home,
  routes.public.about,
  routes.public.contact,
  ...Object.values(routes.auth),
  ...Object.values(routes.demo),
];

export default routes;
