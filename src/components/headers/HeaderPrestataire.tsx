"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";
import Logo from "@/components/Logo";
import { Button } from "@/components/Button";

/**
 * 🌿 HeaderPrestataire — Header pour les pages prestataire
 * Couleur principale : emerald (secondary)
 */
export default function HeaderPrestataire() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push(routes.public.home);
  };

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
            <Link
              href={routes.prestataire.dashboard}
              className={`${colors.premium.text} font-semibold`}
            >
              Tableau de bord
            </Link>
            <Link
              href={routes.prestataire.requests.list}
              className={`${colors.premium.text} hover:text-purple-600 transition-colors`}
            >
              Demandes disponibles
            </Link>
            <Link
              href={routes.prestataire.services.list}
              className={`${colors.premium.text} hover:text-purple-600 transition-colors`}
            >
              Mes prestations
            </Link>
            <Link
              href={routes.prestataire.messages.list}
              className={`${colors.premium.text} hover:text-purple-600 transition-colors`}
            >
              Messages
            </Link>
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-3">
            <span
              className={`hidden md:block text-sm font-medium ${colors.text.secondary}`}
            >
              🛠️ {user?.firstName || user?.email?.split("@")[0]}
            </span>
            <Link href={routes.prestataire.profile.view}>
              <Button
                variant="outline"
                className={`${colors.secondary.border} ${colors.secondary.text} ${colors.secondary.bgHover}`}
              >
                Mon profil
              </Button>
            </Link>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className={colors.text.secondary}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
