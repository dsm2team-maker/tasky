/**
 * 🎨 TASKY - Configuration des couleurs
 *
 * Centralisation de TOUTES les couleurs utilisées dans l'application.
 * Ne JAMAIS utiliser de couleurs hardcodées ailleurs !
 *
 * Usage:
 * import { colors } from '@/config/colors';
 * <div className={colors.primary.gradient} />
 */

export const colors = {
  /**
   * 🌸 PRIMARY - Pink (Rose)
   * Utilisé pour : Client, CTA principaux, actions importantes
   */
  primary: {
    // Classes de base
    base: "bg-pink-600 text-white",
    light: "bg-pink-50",
    dark: "bg-pink-700",

    // Gradients (CORRIGÉ : rose-600 → pink-600)
    gradient: "bg-gradient-to-r from-pink-500 via-pink-500 to-pink-600",

    gradientHover: "hover:from-pink-600 hover:to-pink-700",
    gradientText: "text-pink-600", // Rose uni

    // Textes
    text: "text-pink-600",
    textLight: "text-pink-500",
    textDark: "text-pink-700",
    textMuted: "text-pink-800",

    // Bordures
    border: "border-pink-600",
    borderLight: "border-pink-200",

    // Backgrounds
    bg: "bg-pink-50",
    bgHover: "hover:bg-pink-50",

    // Focus states
    focus: "focus:ring-pink-500 focus:border-pink-500",
    focusRing: "focus:ring-2 focus:ring-pink-500 focus:ring-offset-2",
  },

  /**
   * 🌿 SECONDARY - Emerald/Vert (GARDÉ TEL QUEL)
   * Utilisé pour : Artisan, succès, confirmations
   */
  secondary: {
    // Classes de base
    base: "bg-emerald-500 text-white",
    light: "bg-emerald-50",
    dark: "bg-emerald-700",

    // Gradients
    gradient: "bg-gradient-to-r from-emerald-500 to-teal-600",
    gradientHover: "hover:from-emerald-600 hover:to-teal-700",
    gradientText:
      "bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent",

    // Textes
    text: "text-emerald-600",
    textLight: "text-emerald-500",
    textDark: "text-emerald-700",
    textMuted: "text-emerald-800",

    // Bordures
    border: "border-emerald-600",
    borderLight: "border-emerald-200",

    // Backgrounds
    bg: "bg-emerald-50",
    bgHover: "hover:bg-emerald-50",

    // Focus states
    focus: "focus:ring-emerald-500 focus:border-emerald-500",
    focusRing: "focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
  },

  /**
   * 💜 PREMIUM - Indigo/Purple (NOUVEAU !)
   * Utilisé pour : Badges premium, highlights spéciaux, messagerie
   */
  premium: {
    // Classes de base
    base: "bg-purple-600 text-white",
    light: "bg-purple-50",
    dark: "bg-purple-600",

    // Gradients
    gradient: "bg-gradient-to-r from-indigo-500 to-purple-600",
    gradientHover: "hover:from-indigo-600 hover:to-purple-700",
    gradientText:
      "bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent",

    // Textes
    text: "text-purple-600",
    textLight: "text-purple-500",
    textDark: "text-purple-700",
    textMuted: "text-purple-800",

    // Bordures
    border: "border-purple-600",
    borderLight: "border-purple-200",

    // Backgrounds
    bg: "bg-purple-50",
    bgHover: "hover:bg-purple-50",

    // Focus states
    focus: "focus:ring-purple-500 focus:border-purple-500",
    focusRing: "focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
  },

  /**
   * 💙 NEUTRAL - Bleu/Indigo
   * Utilisé pour : Info, pages publiques, éléments neutres
   */
  neutral: {
    // Classes de base
    base: "bg-blue-500 text-white",
    light: "bg-blue-50",
    dark: "bg-blue-900",

    // Gradients
    gradient: "bg-gradient-to-r from-blue-100 to-indigo-100",
    gradientDark: "bg-gradient-to-r from-blue-500 to-indigo-600",

    // Textes
    text: "text-blue-600",
    textLight: "text-blue-500",
    textDark: "text-blue-900",
    textMuted: "text-blue-800",

    // Bordures
    border: "border-blue-600",
    borderLight: "border-blue-200",

    // Backgrounds
    bg: "bg-blue-50",
    bgHover: "hover:bg-blue-50",

    // Focus states
    focus: "focus:ring-blue-500 focus:border-blue-500",
  },

  /**
   * 📝 TEXT - Couleurs de texte
   */
  text: {
    primary: "text-gray-900", // Titres principaux
    secondary: "text-gray-600", // Texte courant
    tertiary: "text-gray-500", // Texte secondaire
    muted: "text-gray-400", // Texte très discret
    white: "text-white", // Sur fond foncé
    inverse: "text-gray-50", // Sur fond très foncé
  },

  /**
   * ✅ SUCCESS - Vert
   * Utilisé pour : Validations, succès, confirmations
   */
  success: {
    base: "bg-green-600 text-white",
    light: "bg-green-50",
    text: "text-green-600",
    textDark: "text-green-700",
    border: "border-green-600",
    borderLight: "border-green-200",
    bg: "bg-green-50",
  },

  /**
   * ⚠️ WARNING - Ambre/Jaune
   * Utilisé pour : Avertissements, en attente
   */
  warning: {
    base: "bg-amber-600 text-white",
    light: "bg-amber-50",
    text: "text-amber-600",
    textDark: "text-amber-800",
    border: "border-amber-600",
    borderLight: "border-amber-200",
    bg: "bg-amber-50",
  },

  /**
   * ❌ ERROR - Rouge
   * Utilisé pour : Erreurs, alertes, suppressions
   */
  error: {
    base: "bg-red-600 text-white",
    light: "bg-red-50",
    text: "text-red-600",
    textDark: "text-red-700",
    border: "border-red-600",
    borderLight: "border-red-200",
    bg: "bg-red-50",
  },

  /**
   * ℹ️ INFO - Bleu clair
   * Utilisé pour : Informations, tips, aide
   */
  info: {
    base: "bg-blue-600 text-white",
    light: "bg-blue-50",
    text: "text-blue-600",
    textDark: "text-blue-800",
    border: "border-blue-600",
    borderLight: "border-blue-200",
    bg: "bg-blue-50",
  },

  /**
   * 🎨 BACKGROUNDS
   * Couleurs de fond pour différentes sections
   */
  background: {
    white: "bg-white",
    gray: "bg-gray-50",
    light: "bg-gray-100",
    dark: "bg-gray-900",
  },

  /**
   * 🔲 BORDERS
   * Couleurs de bordures
   */
  border: {
    light: "border-gray-200",
    default: "border-gray-300",
    dark: "border-gray-400",
  },

  /**
   * 📊 STATUS - Couleurs de statut pour demandes/prestations
   */
  status: {
    // Demandes
    publiee: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    enAttente: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    acceptee: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    enCours: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    terminee: {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-200",
    },
    annulee: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-200",
    },

    // Devis
    envoye: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    refuse: {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
    },
  },

  /**
   * 💰 PRICE - Couleurs pour affichage des prix
   */
  price: {
    text: "text-gray-900 font-bold",
    small: "text-gray-600 text-sm",
    large: "text-2xl font-bold text-gray-900",
    commission: "text-gray-500 text-sm",
  },

  /**
   * ⭐ RATING - Couleurs pour les notes
   */
  rating: {
    star: "text-yellow-400",
    starEmpty: "text-gray-300",
    text: "text-gray-600 text-sm",
  },

  /**
   * 🏷️ BADGE - Couleurs pour badges/étiquettes
   */
  badge: {
    demo: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-400",
    },
    new: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    verified: {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-200",
    },
    popular: {
      bg: "bg-pink-100",
      text: "text-pink-700",
      border: "border-pink-200",
    },
  },

  /**
   * 🔔 NOTIFICATION - Couleurs pour notifications
   */
  notification: {
    unread: "bg-pink-50 border-l-4 border-pink-600",
    read: "bg-white border-l-4 border-gray-200",
    dot: "bg-pink-600",
  },
};

/**
 * 🎭 Variantes de couleurs selon le rôle utilisateur
 */
export const roleColors = {
  client: colors.primary, // Rose pour client
  artisan: colors.secondary, // Vert pour artisan
  admin: colors.neutral, // Bleu pour admin
};

/**
 * 📱 Couleurs responsive (adaptatif mobile/desktop)
 */
export const responsiveColors = {
  header: {
    mobile: "bg-white/90 backdrop-blur-md",
    desktop: "bg-white/80 backdrop-blur-md",
  },
  sidebar: {
    mobile: "bg-white",
    desktop: "bg-gray-50",
  },
};

export default colors;
