/**
 * 🛠️ TASKY - Design System Helpers
 *
 * Fonctions utilitaires pour faciliter l'utilisation du Design System
 *
 * Usage:
 * import { getStatusColor, formatPrice, getRoleColor } from '@/lib/design-system';
 */

import { colors, roleColors } from "@/config/colors";
import { gradients, shadows, transitions } from "@/config/design-tokens";

/**
 * 🎨 Obtenir la couleur selon le statut
 */
export function getStatusColor(status: string) {
  const statusMap: Record<string, typeof colors.status.publiee> = {
    // Demandes
    publiee: colors.status.publiee,
    en_attente: colors.status.enAttente,
    acceptee: colors.status.acceptee,
    en_cours: colors.status.enCours,
    terminee: colors.status.terminee,
    annulee: colors.status.annulee,

    // Devis
    envoye: colors.status.envoye,
    refuse: colors.status.refuse,
  };

  return statusMap[status] || colors.status.publiee;
}

/**
 * 🏷️ Obtenir le label de statut en français
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    // Demandes
    publiee: "Publiée",
    en_attente: "En attente",
    acceptee: "Acceptée",
    en_cours: "En cours",
    terminee: "Terminée",
    annulee: "Annulée",

    // Devis
    envoye: "Envoyé",
    accepte: "Accepté",
    refuse: "Refusé",

    // Prestations
    a_deposer: "À déposer",
    deposee: "Déposée",
    recuperee: "Récupérée",
    en_travail: "En travail",
    prete: "Prête",
    livree: "Livrée",
  };

  return labels[status] || status;
}

/**
 * 🎭 Obtenir la couleur selon le rôle
 */
export function getRoleColor(role: "client" | "artisan" | "admin") {
  return roleColors[role] || roleColors.client;
}

/**
 * 🎨 Obtenir le gradient selon le rôle
 */
export function getRoleGradient(role: "client" | "artisan") {
  return role === "client" ? gradients.primary : gradients.secondary;
}

/**
 * 💰 Formater un prix
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
}

/**
 * 💰 Calculer la commission
 */
export function calculateCommission(
  price: number,
  rate: number = 0.15,
): number {
  return price * rate;
}

/**
 * 💰 Formater un prix avec commission
 */
export function formatPriceWithCommission(
  price: number,
  commissionRate: number = 0.15,
) {
  const commission = calculateCommission(price, commissionRate);
  const net = price - commission;

  return {
    brut: formatPrice(price),
    commission: formatPrice(commission),
    net: formatPrice(net),
  };
}

/**
 * 📏 Formater une distance
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

/**
 * 📅 Formater une date relative
 */
export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const diffInMs = now.getTime() - targetDate.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return "À l'instant";
  } else if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} min`;
  } else if (diffInHours < 24) {
    return `Il y a ${diffInHours}h`;
  } else if (diffInDays < 7) {
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
  } else {
    return targetDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year:
        targetDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

/**
 * 📅 Formater une date complète
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  return targetDate.toLocaleDateString("fr-FR", options || defaultOptions);
}

/**
 * 📅 Formater une heure
 */
export function formatTime(date: Date | string): string {
  const targetDate = typeof date === "string" ? new Date(date) : date;
  return targetDate.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * ⭐ Générer des étoiles pour les notes
 */
export function generateStars(rating: number): {
  full: number;
  half: boolean;
  empty: number;
} {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return { full, half, empty };
}

/**
 * 🎨 Combiner des classes CSS (comme cn() mais simple)
 */
export function classNames(
  ...classes: (string | undefined | null | boolean)[]
): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * 🎨 Obtenir les classes de shadow avec hover
 */
export function getShadowClasses(withHover: boolean = true): string {
  return classNames(shadows.card, withHover && shadows.cardHover);
}

/**
 * 🎨 Obtenir les classes de transition
 */
export function getTransitionClasses(
  type: "base" | "fast" | "slow" = "base",
): string {
  return transitions[type];
}

/**
 * 🔤 Tronquer un texte
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

/**
 * 🔤 Extraire les initiales
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

/**
 * 📊 Calculer le pourcentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * 📱 Détecter si mobile
 */
export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

/**
 * 🎨 Obtenir la classe de badge selon le type
 */
export function getBadgeClasses(type: "demo" | "new" | "verified" | "popular") {
  const badgeMap = {
    demo: colors.badge.demo,
    new: colors.badge.new,
    verified: colors.badge.verified,
    popular: colors.badge.popular,
  };

  return badgeMap[type];
}

/**
 * 🔔 Obtenir les classes de notification
 */
export function getNotificationClasses(isRead: boolean) {
  return isRead ? colors.notification.read : colors.notification.unread;
}

/**
 * 📝 Valider un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 📝 Valider un code postal français
 */
export function isValidPostalCode(postalCode: string): boolean {
  const postalCodeRegex = /^[0-9]{5}$/;
  return postalCodeRegex.test(postalCode);
}

/**
 * 📝 Valider un numéro de téléphone français
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
}

/**
 * 🎯 Obtenir l'URL d'avatar par défaut
 */
export function getDefaultAvatar(name: string): string {
  const initials = getInitials(name);
  return `https://ui-avatars.com/api/?name=${initials}&background=ec4899&color=fff`;
}

/**
 * 📊 Formater un nombre
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("fr-FR").format(num);
}

/**
 * 🎨 Obtenir les classes de focus selon le rôle
 */
export function getFocusClasses(role: "client" | "artisan" = "client"): string {
  return role === "client"
    ? "focus:ring-pink-500 focus:border-pink-500"
    : "focus:ring-emerald-500 focus:border-emerald-500";
}

/**
 * 🎯 Sleep utility (pour démo/tests)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 🔄 Debounce utility
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 🎨 Générer une couleur aléatoire (pour tests)
 */
export function randomColor(): string {
  const colors = ["pink", "emerald", "blue", "purple", "amber", "rose"];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default {
  getStatusColor,
  getStatusLabel,
  getRoleColor,
  getRoleGradient,
  formatPrice,
  calculateCommission,
  formatPriceWithCommission,
  formatDistance,
  formatRelativeDate,
  formatDate,
  formatTime,
  generateStars,
  classNames,
  getShadowClasses,
  getTransitionClasses,
  truncate,
  getInitials,
  calculatePercentage,
  isMobile,
  getBadgeClasses,
  getNotificationClasses,
  isValidEmail,
  isValidPostalCode,
  isValidPhoneNumber,
  getDefaultAvatar,
  formatNumber,
  getFocusClasses,
  sleep,
  debounce,
  randomColor,
};
