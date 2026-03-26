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
 * 🌸 HeaderClient — Header pour les pages client
 * Couleur principale : pink (primary)
 */
export default function HeaderClient() {
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
              href={routes.client.dashboard}
              className={`${colors.premium.text} font-semibold`}
            >
              Tableau de bord
            </Link>
            <Link
              href={routes.client.search.base}
              className={`${colors.premium.text} hover:text-purple-600 transition-colors`}
            >
              Trouver un prestataire
            </Link>
            <Link
              href={routes.client.requests.list}
              className={`${colors.premium.text} hover:text-purple-600 transition-colors`}
            >
              Mes demandes
            </Link>
            <Link
              href={routes.client.messages.list}
              className={`${colors.premium.text} hover:text-purple-600 transition-colors`}
            >
              Messages
            </Link>
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-3">
            <span
              className={`hidden md:block text-sm font-medium ${colors.premium.text}`}
            >
              👤 {user?.firstName || user?.email?.split("@")[0]}
            </span>
            <Link
              href={routes.client.profile.view}
              className={`${colors.premium.text} hover:text-purple-600 transition-colors`}
            >
              Mon profil
            </Link>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className={colors.premium.text}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
