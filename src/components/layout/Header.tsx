"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colors } from "@/config/colors";
import { routes } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";
import Logo from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

/**
 * 🌐 Header — Header public (landing page)
 * Auth-aware : affiche le bon dashboard selon le rôle
 */
export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    router.push(routes.public.home);
  };

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offsetPosition =
        element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const navItems = [
    { id: "comment-ca-marche", label: "Comment ça marche" },
    { id: "pourquoi-nous-choisir", label: "Avantages" },
    { id: "categories", label: "Prestations" },
    { id: "temoignages", label: "Témoignages" },
  ];

  const dashboardRoute =
    user?.role === "CLIENT"
      ? routes.client.dashboard
      : routes.prestataire.dashboard;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Logo />

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.id}
                onClick={scrollTo(item.id)}
                className={`${colors.text.secondary} hover:text-purple-600 transition cursor-pointer`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {!isHydrated ? null : isAuthenticated ? (
              <>
                <Link href={dashboardRoute}>
                  <Button
                    variant="outline"
                    className={
                      user?.role === "CLIENT"
                        ? `${colors.primary.border} ${colors.primary.text} ${colors.primary.bgHover}`
                        : `${colors.secondary.border} ${colors.secondary.text} ${colors.secondary.bgHover}`
                    }
                  >
                    Mon dashboard
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className={colors.text.secondary}
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <Link
                href={routes.auth.login}
                className={`px-4 py-2 font-medium ${colors.text.secondary} hover:text-purple-600 transition`}
              >
                Se connecter
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 -mr-2 text-gray-600 hover:text-purple-600 transition"
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

        {mobileOpen && (
          <div className="md:hidden mt-4 pb-2 border-t border-gray-200 pt-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.id}
                onClick={scrollTo(item.id)}
                className={`${colors.text.secondary} hover:text-purple-600 transition cursor-pointer`}
              >
                {item.label}
              </a>
            ))}
            {!isHydrated ? null : isAuthenticated ? (
              <>
                <Link href={dashboardRoute} onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="outline"
                    className={`w-full ${
                      user?.role === "CLIENT"
                        ? `${colors.primary.border} ${colors.primary.text} ${colors.primary.bgHover}`
                        : `${colors.secondary.border} ${colors.secondary.text} ${colors.secondary.bgHover}`
                    }`}
                  >
                    Mon dashboard
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className={`w-full ${colors.text.secondary}`}
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <Link
                href={routes.auth.login}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2 font-medium ${colors.text.secondary} hover:text-purple-600 transition`}
              >
                Se connecter
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
