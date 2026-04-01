/**
 * 🛣️ TASKY - Configuration des routes
 */
export const routes = {
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

  auth: {
    login: "/auth/login",
    register: {
      client: "/auth/register/client",
      prestataire: "/auth/register/prestataire",
    },
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyEmail: "/auth/verify-email",
  },

  client: {
    dashboard: "/client/dashboard",
    profile: {
      view: "/client/profile",
      edit: "/client/profile/edit",
      settings: "/client/settings",
    },
    requests: {
      list: "/client/requests",
      new: "/client/requests/new",
      detail: (id: string) => `/client/requests/${id}`,
      edit: (id: string) => `/client/requests/${id}/edit`,
    },
    devis: {
      list: (requestId: string) => `/client/requests/${requestId}/devis`,
      detail: (requestId: string, devisId: string) =>
        `/client/requests/${requestId}/devis/${devisId}`,
    },
    search: {
      base: "/client/search",
      category: (categoryId: string) => `/client/search?category=${categoryId}`,
      results: "/client/search/results",
    },
    prestataires: {
      list: "/client/prestataires",
      detail: (id: string) => `/client/prestataires/${id}`,
    },
    messages: {
      list: "/client/messages",
      conversation: (id: string) => `/client/messages/${id}`,
    },
    prestations: {
      list: "/client/prestations",
      detail: (id: string) => `/client/prestations/${id}`,
      timeline: (id: string) => `/client/prestations/${id}/timeline`,
    },
    payment: {
      methods: "/client/payment/methods",
      history: "/client/payment/history",
      invoice: (id: string) => `/client/payment/invoices/${id}`,
    },
    reviews: {
      list: "/client/reviews",
      create: (prestationId: string) =>
        `/client/reviews/new?prestation=${prestationId}`,
    },
    notifications: "/client/notifications",
    settings: {
      account: "/client/settings/account",
      password: "/client/settings/password",
      email: "/client/settings/email",
      notifications: "/client/settings/notifications",
      privacy: "/client/settings/privacy",
      delete: "/client/settings/delete-account",
    },
  },

  prestataire: {
    dashboard: "/prestataire/dashboard",
    profile: {
      view: "/prestataire/profile",
      edit: "/prestataire/profile/edit",
      public: (id: string) => `/prestataire/profile/${id}`,
      settings: "/prestataire/settings",
    },
    requests: {
      list: "/prestataire/requests",
      available: "/prestataire/requests/available",
      detail: (id: string) => `/prestataire/requests/${id}`,
      sendDevis: (id: string) => `/prestataire/requests/${id}/devis/new`,
    },
    services: {
      list: "/prestataire/services",
      enCours: "/prestataire/services/en-cours",
      terminees: "/prestataire/services/terminees",
      detail: (id: string) => `/prestataire/services/${id}`,
      timeline: (id: string) => `/prestataire/services/${id}/timeline`,
    },
    devis: {
      list: "/prestataire/devis",
      enAttente: "/prestataire/devis/en-attente",
      acceptes: "/prestataire/devis/acceptes",
      refuses: "/prestataire/devis/refuses",
      detail: (id: string) => `/prestataire/devis/${id}`,
      edit: (id: string) => `/prestataire/devis/${id}/edit`,
    },
    messages: {
      list: "/prestataire/messages",
      conversation: (id: string) => `/prestataire/messages/${id}`,
    },
    pointsNeutres: {
      list: "/prestataire/points-neutres",
      add: "/prestataire/points-neutres/new",
      edit: (id: string) => `/prestataire/points-neutres/${id}/edit`,
    },
    earnings: {
      overview: "/prestataire/earnings",
      history: "/prestataire/earnings/history",
      payout: "/prestataire/earnings/payout",
    },
    stats: "/prestataire/stats",
    reviews: {
      list: "/prestataire/reviews",
      detail: (id: string) => `/prestataire/reviews/${id}`,
    },
    calendar: "/prestataire/calendar",
    notifications: "/prestataire/notifications",
    settings: {
      account: "/prestataire/settings/account",
      password: "/prestataire/settings/password",
      email: "/prestataire/settings/email",
      paiement: "/prestataire/settings/paiement",
      notifications: "/prestataire/settings/notifications",
      privacy: "/prestataire/settings/privacy",
      delete: "/prestataire/settings/delete-account",
    },
  },

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
      avatar: "/api/users/avatar",
      requestPhoneChange: "/api/users/profile/request-phone-change",
      verifyPhoneOtp: "/api/users/profile/verify-phone-otp",
      requestEmailChange: "/api/users/profile/request-email-change",
      verifyEmailOtp: "/api/users/profile/verify-email-otp",
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

export const navigation = {
  clientNav: [
    { label: "Dashboard", href: routes.client.dashboard, icon: "🏠" },
    { label: "Recherche", href: routes.client.search.base, icon: "🔍" },
    { label: "Mes demandes", href: routes.client.requests.list, icon: "📋" },
    { label: "Messages", href: routes.client.messages.list, icon: "💬" },
  ],
  prestataireNav: [
    { label: "Dashboard", href: routes.prestataire.dashboard, icon: "🏠" },
    { label: "Demandes", href: routes.prestataire.requests.list, icon: "📋" },
    {
      label: "Mes prestations",
      href: routes.prestataire.services.list,
      icon: "🛠️",
    },
    { label: "Messages", href: routes.prestataire.messages.list, icon: "💬" },
  ],
  footerNav: [
    { label: "À propos", href: routes.public.about },
    { label: "Contact", href: routes.public.contact },
    { label: "CGU", href: routes.public.legal.cgu },
    { label: "Confidentialité", href: routes.public.legal.privacy },
  ],
};

export default routes;
