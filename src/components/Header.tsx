"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colors } from "@/config/colors";
import { routes } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";
import Logo from "@/components/Logo";
import { Button } from "@/components/Button";

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push(routes.public.home);
  };

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const offsetPosition =
        element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const dashboardRoute =
    user?.role === "CLIENT"
      ? routes.client.dashboard
      : routes.artisan.dashboard;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-34 h-16 rounded-lg overflow-hidden flex items-center justify-center">
              <Logo />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              onClick={scrollTo("comment-ca-marche")}
              className={`${colors.text.secondary} hover:${colors.premium.text} transition cursor-pointer`}
            >
              Comment ça marche
            </a>
            <a
              onClick={scrollTo("pourquoi-nous-choisir")}
              className={`${colors.text.secondary} hover:${colors.premium.text} transition cursor-pointer`}
            >
              Avantages
            </a>
            <a
              onClick={scrollTo("categories")}
              className={`${colors.text.secondary} hover:${colors.premium.text} transition cursor-pointer`}
            >
              Prestations
            </a>
            <a
              onClick={scrollTo("temoignages")}
              className={`${colors.text.secondary} hover:${colors.premium.text} transition cursor-pointer`}
            >
              Témoignages
            </a>
          </nav>

          {/* Boutons droite — selon état connexion */}
          <div className="flex items-center gap-3">
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
                className={`px-4 py-2 font-medium ${colors.text.secondary} hover:${colors.premium.text} transition`}
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
