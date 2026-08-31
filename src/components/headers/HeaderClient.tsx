"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";
import Logo from "@/components/ui/Logo";
import { useUnreadMessageCount } from "@/hooks/useMessages";

/**
 * 🌸 HeaderClient — Header pour les pages client
 * Couleur principale : pink (primary)
 */
export default function HeaderClient() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { data: unread } = useUnreadMessageCount();
  const unreadCount = unread ?? 0;
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    router.push(routes.auth.login);
  };

  const navLinks: { href: string; label: string; badge?: number }[] = [
    { href: routes.client.dashboard, label: "Tableau de bord" },
    { href: routes.client.prestataires.list, label: "Trouver un prestataire" },
    { href: routes.client.requests.list, label: "Mes demandes" },
    { href: routes.client.messages.list, label: "Messages", badge: unreadCount },
    { href: routes.client.profile.view, label: "Mon profil" },
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
                      ? `${colors.primary.text} font-bold underline underline-offset-4`
                      : `${colors.premium.text} hover:${colors.primary.text} font-medium`
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
              👤 {user?.firstName || user?.email?.split("@")[0]}
            </span>
            <button
              onClick={handleLogout}
              className={`hidden md:block text-sm font-medium ${colors.premium.text} hover:${colors.primary.text} transition-colors`}
            >
              Déconnexion
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className={`md:hidden p-2 -mr-2 ${colors.premium.text} hover:${colors.primary.text} transition-colors`}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-200 mt-2 flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`relative text-sm transition-colors ${
                    isActive
                      ? `${colors.primary.text} font-bold`
                      : `${colors.premium.text} hover:${colors.primary.text} font-medium`
                  }`}
                >
                  {link.label}
                  {!!link.badge && link.badge > 0 && (
                    <span className="ml-2 inline-flex min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full items-center justify-center">
                      {link.badge > 99 ? "99+" : link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <span className={`text-sm font-medium ${colors.text.secondary}`}>
              👤 {user?.firstName || user?.email?.split("@")[0]}
            </span>
            <button
              onClick={handleLogout}
              className={`text-left text-sm font-medium ${colors.premium.text} hover:${colors.primary.text} transition-colors`}
            >
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
