/**
 * 📐 TASKY - Design Tokens
 */

/**
 * 📏 SPACING
 */
export const spacing = {
  section: "py-16 md:py-24",
  sectionSmall: "py-12 md:py-16",
  sectionLarge: "py-20 md:py-32",
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  containerSmall: "max-w-4xl mx-auto px-4",
  containerLarge: "max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8",
  card: "p-6",
  cardSmall: "p-4",
  cardLarge: "p-8",
  form: "space-y-6",
  formSmall: "space-y-4",
  formLarge: "space-y-8",
  list: "space-y-4",
  listSmall: "space-y-2",
  listLarge: "space-y-6",
  gridGap: "gap-6",
  gridGapSmall: "gap-4",
  gridGapLarge: "gap-8",
  page: "p-6 md:p-8",
  pageSmall: "p-4 md:p-6",
  header: "py-4",
  footer: "py-12",
};

/**
 * 📝 TYPOGRAPHY
 */
export const typography = {
  h1: {
    base: "text-4xl md:text-5xl lg:text-6xl font-bold",
    mobile: "text-3xl font-bold",
    gradient:
      "text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
  },
  h2: {
    base: "text-3xl md:text-4xl font-bold",
    mobile: "text-2xl font-bold",
  },
  h3: {
    base: "text-2xl md:text-3xl font-bold",
    mobile: "text-xl font-bold",
  },
  h4: {
    base: "text-xl md:text-2xl font-semibold",
    mobile: "text-lg font-semibold",
  },
  h5: {
    base: "text-lg md:text-xl font-semibold",
    mobile: "text-base font-semibold",
  },
  h6: {
    base: "text-base md:text-lg font-semibold",
    mobile: "text-sm font-semibold",
  },
  body: {
    base: "text-base",
    large: "text-lg",
    small: "text-sm",
  },
  p: {
    base: "text-base leading-relaxed",
    large: "text-lg leading-relaxed",
    small: "text-sm leading-relaxed",
  },
  link: {
    base: "text-pink-600 hover:text-pink-700 underline transition",
    noUnderline: "text-pink-600 hover:text-pink-700 transition",
    external:
      "text-pink-600 hover:text-pink-700 underline inline-flex items-center gap-1",
  },
  label: {
    base: "block text-sm font-medium text-gray-700 mb-2",
    required:
      'block text-sm font-medium text-gray-700 mb-2 after:content-["*"] after:ml-0.5 after:text-red-500',
    optional: "block text-sm font-medium text-gray-700 mb-2",
  },
  helper: {
    base: "text-sm text-gray-500 mt-1",
    error: "text-sm text-red-600 mt-1",
    success: "text-sm text-green-600 mt-1",
  },
  caption: {
    base: "text-xs text-gray-500",
    muted: "text-xs text-gray-400",
  },
  code: {
    inline: "px-1.5 py-0.5 bg-gray-100 text-pink-600 rounded text-sm font-mono",
    block:
      "p-4 bg-gray-900 text-gray-100 rounded-lg text-sm font-mono overflow-x-auto",
  },
  list: {
    ul: "list-disc list-inside space-y-2 text-gray-600",
    ol: "list-decimal list-inside space-y-2 text-gray-600",
  },
};

/**
 * 🔄 TRANSITIONS - utilisées dans dashboard prestataire/client
 */
export const transitions = {
  base: "transition-all duration-200",
  fast: "transition-all duration-100",
  slow: "transition-all duration-300",
  colors: "transition-colors duration-200",
  transform: "transition-transform duration-200",
  opacity: "transition-opacity duration-200",
  shadow: "transition-shadow duration-200",
  hover: "transition-all duration-200 hover:scale-105",
  hoverShadow: "transition-all duration-200 hover:shadow-xl",
};

/**
 * 🎨 GRADIENTS - utilisés dans verify-email, reset-password, dashboard
 */
export const gradients = {
  primary: "bg-gradient-to-r from-pink-500 to-pink-600",
  primaryHover: "hover:from-pink-600 hover:to-pink-700",
  primaryText:
    "bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent",
  secondary: "bg-gradient-to-r from-emerald-500 to-teal-600",
  secondaryHover: "hover:from-emerald-600 hover:to-teal-700",
  secondaryText:
    "bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent",
  neutral: "bg-gradient-to-r from-blue-100 to-indigo-100",
  neutralDark: "bg-gradient-to-r from-blue-500 to-indigo-600",
  lightPrimary: "bg-gradient-to-r from-pink-50 to-pink-50",
  lightSecondary: "bg-gradient-to-r from-emerald-50 to-teal-50",
  lightNeutral: "bg-gradient-to-r from-blue-50 to-indigo-50",
  subtle: "bg-gradient-to-b from-gray-50 to-white",
  subtleReverse: "bg-gradient-to-b from-white to-gray-50",
};

/**
 * 📐 BORDERS
 */
export const borders = {
  thin: "border",
  medium: "border-2",
  thick: "border-4",
  radius: {
    none: "rounded-none",
    sm: "rounded-sm",
    base: "rounded-lg",
    md: "rounded-lg",
    lg: "rounded-xl",
    xl: "rounded-2xl",
    full: "rounded-full",
  },
  card: "border border-gray-200 rounded-lg",
  input: "border border-gray-300 rounded-lg",
  button: "border-2 rounded-lg",
};

/**
 * 🎬 ANIMATIONS
 */
export const animations = {
  bounce: "animate-bounce",
  spin: "animate-spin",
  pulse: "animate-pulse",
  float: "animate-float",
  floatDelayed: "animate-float-delayed",
  fadeIn: "animate-fadeIn",
  slideInUp: "animate-slideInUp",
  slideInDown: "animate-slideInDown",
  slideInLeft: "animate-slideInLeft",
  slideInRight: "animate-slideInRight",
};

/**
 * 📱 BREAKPOINTS
 */
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

/**
 * 🔲 SIZES
 */
export const sizes = {
  avatar: {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    base: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
    "2xl": "w-20 h-20",
  },
  icon: {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    base: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  },
  logo: {
    sm: "h-8 w-auto",
    base: "h-10 w-auto",
    lg: "h-12 w-auto",
  },
  button: {
    sm: "px-3 py-1.5 text-sm",
    base: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  },
  input: {
    sm: "px-3 py-1.5 text-sm",
    base: "px-4 py-2 text-base",
    lg: "px-4 py-3 text-lg",
  },
};

/**
 * 🎯 FOCUS STATES
 */
export const focus = {
  base: "focus:outline-none focus:ring-2 focus:ring-offset-2",
  primary:
    "focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2",
  secondary:
    "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
  neutral:
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  error:
    "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
};

/**
 * 🖼️ ASPECT RATIOS
 */
export const aspectRatios = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
  ultraWide: "aspect-[21/9]",
};

/**
 * 📊 Z-INDEX
 */
export const zIndex = {
  base: "z-0",
  dropdown: "z-10",
  sticky: "z-20",
  fixed: "z-30",
  modalBackdrop: "z-40",
  modal: "z-50",
  popover: "z-60",
  tooltip: "z-70",
  toast: "z-80",
};

/**
 * 🎨 EFFECTS
 */
export const effects = {
  backdropBlur: {
    none: "backdrop-blur-none",
    sm: "backdrop-blur-sm",
    base: "backdrop-blur",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  },
  glass: "bg-white/80 backdrop-blur-md border border-gray-200",
  glassDark: "bg-gray-900/80 backdrop-blur-md border border-gray-700",
};

export default {
  spacing,
  typography,
  transitions,
  gradients,
  borders,
  animations,
  breakpoints,
  sizes,
  focus,
  aspectRatios,
  zIndex,
  effects,
};
