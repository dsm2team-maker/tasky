"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";
import Logo from "@/components/Logo";

/**
 * 🌿 HeaderPrestataire — Header pour les pages prestataire
 * Couleur principale : emerald (secondary)
 */
export default function HeaderPrestataire() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push(routes.auth.login);
  };

  const navLinks = [
    { href: routes.prestataire.dashboard, label: "Tableau de bord" },
    { href: routes.prestataire.requests.list, label: "Demandes disponibles" },
    { href: routes.prestataire.services.list, label: "Mes prestations" },
    { href: routes.prestataire.messages.list, label: "Messages" },
    { href: routes.prestataire.profile.view, label: "Mon profil" },
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
                  className={`text-sm transition-colors ${
                    isActive
                      ? `${colors.secondary.text} font-bold underline underline-offset-4`
                      : `${colors.premium.text} hover:${colors.secondary.text} font-medium`
                  }`}
                >
                  {link.label}
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
