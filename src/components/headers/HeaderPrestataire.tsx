"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";
import Logo from "@/components/ui/Logo";
import { useUnreadMessageCount } from "@/hooks/useMessages";

/**
 * 🌿 HeaderPrestataire — Header pour les pages prestataire
 * Couleur principale : emerald (secondary)
 */
export default function HeaderPrestataire() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { data: unread } = useUnreadMessageCount();
  const unreadCount = unread ?? 0;

  const handleLogout = () => {
    logout();
    router.push(routes.auth.login);
  };

  const navLinks: { href: string; label: string; badge?: number }[] = [
    { href: routes.prestataire.dashboard, label: "Tableau de bord" },
    { href: routes.prestataire.requests.list, label: "Demandes disponibles" },
    { href: routes.prestataire.services.list, label: "Mes prestations" },
    { href: routes.prestataire.messages.list, label: "Messages", badge: unreadCount },
    { href: routes.prestataire.profile.view, label: "Mon profil" },
    { href: routes.public.contact, label: "Contact" },
  ];

  return (
    <header
      className={`${colors.background.white} shadow-sm border-b ${colors.border.light} sticky top-0 z-50`}
    >
      <div className={spacing.container}>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={routes.public.home}>
            <Logo />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm transition-colors ${
                    isActive
                      ? `${colors.secondary.text} font-bold underline underline-offset-4`
                      : `${colors.premium.text} hover:${colors.secondary.text} font-medium`
                  }`}
                >
                  {link.label}
                  {!!link.badge && link.badge > 0 && (
                    <span className="absolute -top-2 -right-3 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {link.badge > 99 ? "99+" : link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-4">
            <span
              className={`hidden md:block text-sm font-medium ${colors.text.secondary}`}
            >
              🛠️ {user?.firstName || user?.email?.split("@")[0]}
            </span>
            <button
              onClick={handleLogout}
              className={`text-sm font-medium ${colors.premium.text} hover:${colors.secondary.text} transition-colors`}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
