/**
 * 🎨 TASKY - Configuration des couleurs
 *
 * Centralisation de TOUTES les couleurs utilisées dans l'application.
 * Ne JAMAIS utiliser de couleurs hardcodées ailleurs !
 *
 * Convention : colors.GROUPE.PROPRIÉTÉ
 *   - GROUPE  = thème ou usage (primary, secondary, premium, text, error...)
 *   - PROPRIÉTÉ = ce qu'on applique (text, bg, border, gradient...)
 *
 * Exemples corrects :
 *   colors.primary.text       → rose, pour les clients
 *   colors.secondary.text     → vert, pour les prestataires
 *   colors.premium.text       → violet, couleur marque Tasky
 *   colors.text.secondary     → gris, texte courant neutre
 *   colors.error.text         → rouge, message d'erreur
 */

export const colors = {
  /**
   * 🌸 PRIMARY - Rose
   * Utilisé pour : Client, CTA principaux, actions importantes
   */
  primary: {
    base: "bg-pink-600 text-white",
    light: "bg-pink-50",
    dark: "bg-pink-700",
    gradient: "bg-gradient-to-r from-pink-500 via-pink-500 to-pink-600",
    gradientHover: "hover:from-pink-600 hover:to-pink-700",
    gradientText: "text-pink-600",
    text: "text-pink-600",
    textLight: "text-pink-500",
    textDark: "text-pink-700",
    textMuted: "text-pink-800",
    border: "border-pink-600",
    borderLight: "border-pink-200",
    bg: "bg-pink-50",
    bgHover: "hover:bg-pink-50",
    focus: "focus:ring-pink-500 focus:border-pink-500",
    focusRing: "focus:ring-2 focus:ring-pink-500 focus:ring-offset-2",
  },

  /**
   * 🌿 SECONDARY - Vert Émeraude
   * Utilisé pour : Prestataire, succès, confirmations
   */
  secondary: {
    base: "bg-emerald-500 text-white",
    light: "bg-emerald-50",
    dark: "bg-emerald-700",
    gradient: "bg-gradient-to-r from-emerald-500 to-teal-600",
    gradientHover: "hover:from-emerald-600 hover:to-teal-700",
    gradientText:
      "bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent",
    text: "text-emerald-600",
    textLight: "text-emerald-500",
    textDark: "text-emerald-700",
    textMuted: "text-emerald-800",
    border: "border-emerald-600",
    borderLight: "border-emerald-200",
    bg: "bg-emerald-50",
    bgHover: "hover:bg-emerald-50",
    focus: "focus:ring-emerald-500 focus:border-emerald-500",
    focusRing: "focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
  },

  /**
   * 💜 PREMIUM - Indigo/Violet
   * Utilisé pour : Marque Tasky, titres, boutons principaux, pop-ups
   */
  premium: {
    base: "bg-purple-600 text-white",
    light: "bg-purple-50",
    dark: "bg-purple-700",
    gradient: "bg-gradient-to-r from-indigo-500 to-purple-600",
    gradientHover: "hover:from-indigo-600 hover:to-purple-700",
    gradientText:
      "bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent",
    text: "text-purple-600",
    textLight: "text-purple-500",
    textDark: "text-purple-700",
    textMuted: "text-purple-800",
    border: "border-purple-600",
    borderLight: "border-purple-200",
    bg: "bg-purple-50",
    bgHover: "hover:bg-purple-50",
    focus: "focus:ring-purple-500 focus:border-purple-500",
    focusRing: "focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
  },

  /**
   * 💙 NEUTRAL - Bleu
   * Utilisé pour : Info, pages publiques, éléments neutres
   */
  neutral: {
    base: "bg-blue-500 text-white",
    light: "bg-blue-50",
    dark: "bg-blue-900",
    gradient: "bg-gradient-to-r from-blue-100 to-indigo-100",
    gradientDark: "bg-gradient-to-r from-blue-500 to-indigo-600",
    text: "text-blue-600",
    textLight: "text-blue-500",
    textDark: "text-blue-900",
    textMuted: "text-blue-800",
    border: "border-blue-600",
    borderLight: "border-blue-200",
    bg: "bg-blue-50",
    bgHover: "hover:bg-blue-50",
    focus: "focus:ring-blue-500 focus:border-blue-500",
  },

  /**
   * 📝 TEXT - Textes neutres (gris)
   * Pour les textes sans appartenance à un thème de couleur
   */
  text: {
    primary: "text-gray-900", // Titres, contenus importants
    secondary: "text-gray-600", // Texte courant
    tertiary: "text-gray-500", // Texte secondaire, labels
    muted: "text-gray-400", // Texte très discret, placeholders
    white: "text-white", // Sur fond foncé
    inverse: "text-gray-50", // Sur fond très foncé
  },

  /**
   * ✅ SUCCESS - Vert
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
   * ⚠️ WARNING - Ambre
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
   * 🎨 BACKGROUND
   */
  background: {
    white: "bg-white",
    gray: "bg-gray-50",
    light: "bg-gray-100",
    dark: "bg-gray-900",
  },

  /**
   * 🔲 BORDER
   */
  border: {
    light: "border-gray-200",
    default: "border-gray-300",
    dark: "border-gray-400",
  },

  /**
   * 📊 STATUS
   */
  status: {
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
   * 💰 PRICE
   */
  price: {
    text: "text-gray-900 font-bold",
    small: "text-gray-600 text-sm",
    large: "text-2xl font-bold text-gray-900",
    commission: "text-gray-500 text-sm",
  },

  /**
   * ⭐ RATING
   */
  rating: {
    star: "text-yellow-400",
    starEmpty: "text-gray-300",
    text: "text-gray-600 text-sm",
  },

  /**
   * 🏷️ BADGE
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
   * 🔔 NOTIFICATION
   */
  notification: {
    unread: "bg-pink-50 border-l-4 border-pink-600",
    read: "bg-white border-l-4 border-gray-200",
    dot: "bg-pink-600",
  },
};

/**
 * 🎭 Couleurs par rôle utilisateur
 */
export const roleColors = {
  client: colors.primary, // 🌸 Rose
  prestataire: colors.secondary, // 🌿 Vert
  admin: colors.neutral, // 💙 Bleu
};

/**
 * 📱 Couleurs responsive
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
