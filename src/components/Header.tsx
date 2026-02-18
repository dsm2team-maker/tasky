"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
                src="/images/logo-tasky2.png"
                alt="Tasky Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#comment-ca-marche"
              className="text-gray-700 hover:text-orange-600 transition"
            >
              Comment ça marche
            </a>
            <a
              href="#avantages"
              className="text-gray-700 hover:text-orange-600 transition"
            >
              Avantages
            </a>
            <a
              href="#temoignages"
              className="text-gray-700 hover:text-orange-600 transition"
            >
              Témoignages
            </a>
          </nav>
          <Link
            href="/auth/login"
            className="px-4 py-2 font-medium text-gray-700 hover:text-orange-600 transition"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </header>
  );
}
