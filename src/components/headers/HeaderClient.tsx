"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";
import Logo from "@/components/ui/Logo";

/**
 * 🌸 HeaderClient — Header pour les pages client
 * Couleur principale : pink (primary)
 */
export default function HeaderClient() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push(routes.auth.login);
  };

  const navLinks = [
    { href: routes.client.dashboard, label: "Tableau de bord" },
    { href: routes.client.search.base, label: "Trouver un prestataire" },
    { href: routes.client.requests.list, label: "Mes demandes" },
    { href: routes.client.messages.list, label: "Messages" },
    { href: routes.client.profile.view, label: "Mon profil" },
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
                      ? `${colors.primary.text} font-bold underline underline-offset-4`
                      : `${colors.premium.text} hover:${colors.primary.text} font-medium`
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
              👤 {user?.firstName || user?.email?.split("@")[0]}
            </span>
            <button
              onClick={handleLogout}
              className={`text-sm font-medium ${colors.premium.text} hover:${colors.primary.text} transition-colors`}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
