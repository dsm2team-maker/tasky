"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { colors } from "@/config/colors";
import { routes } from "@/config/routes";

export default function Header() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-34 h-16 rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src="/images/logo-tasky.png"
                alt="Tasky Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#comment-ca-marche"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("comment-ca-marche");
                if (element) {
                  const offset = 80; // Hauteur du header
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition =
                    elementPosition + window.pageYOffset - offset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
              className={`${colors.text.secondary} hover:${colors.premium.text} transition cursor-pointer`}
            >
              Comment ça marche
            </a>
            <a
              href="#pourquoi-nous-choisir"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(
                  "pourquoi-nous-choisir",
                );
                if (element) {
                  const offset = 80; // Hauteur du header
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition =
                    elementPosition + window.pageYOffset - offset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
              className={`${colors.text.secondary} hover:${colors.premium.text} transition cursor-pointer`}
            >
              Avantages
            </a>
            <a
              href="#categories"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("categories");
                if (element) {
                  const offset = 80; // Hauteur du header
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition =
                    elementPosition + window.pageYOffset - offset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
              className={`${colors.text.secondary} hover:${colors.premium.text} transition cursor-pointer`}
            >
              Prestations
            </a>
            <a
              href="#temoignages"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("temoignages");
                if (element) {
                  const offset = 80; // Hauteur du header
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition =
                    elementPosition + window.pageYOffset - offset;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
              className={`${colors.text.secondary} hover:${colors.premium.text} transition cursor-pointer`}
            >
              Témoignages
            </a>
          </nav>
          <Link
            href={routes.auth.login}
            className={`px-4 py-2 font-medium ${colors.text.secondary} hover:${colors.premium.text} transition`}
          >
            Se connecter
          </Link>
        </div>
      </div>
    </header>
  );
}
