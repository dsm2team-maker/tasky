"use client";

import Link from "next/link";
import { routes } from "@/config/routes";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo et description */}
          <div>
            <div className="w-34 h-16 rounded-lg overflow-hidden mb-4">
              <Logo />
            </div>
            <p className="text-sm text-gray-400">
              La plateforme qui connecte clients et prestataires en toute
              sécurité.
            </p>
          </div>

          {/* Section Clients */}
          <div>
            <h4 className="text-white font-semibold mb-4">Clients</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={routes.auth.register.client}
                  className="hover:text-white transition"
                >
                  Créer mon compte
                </Link>
              </li>
              <li>
                <a
                  href="#comment-ca-marche"
                  className="hover:text-white transition cursor-pointer"
                >
                  Comment ça marche
                </a>
              </li>
              <li>
                <a
                  href="#categories"
                  className="hover:text-white transition cursor-pointer"
                >
                  Catégories
                </a>
              </li>
              <li>
                <a
                  href="#temoignages"
                  className="hover:text-white transition cursor-pointer"
                >
                  Témoignages
                </a>
              </li>
            </ul>
          </div>

          {/* Section Artisans */}
          <div>
            <h4 className="text-white font-semibold mb-4">Artisans</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={routes.auth.register.artisan.step1}
                  className="hover:text-white transition"
                >
                  Devenir prestataire
                </Link>
              </li>
              <li>
                <a
                  href="#pourquoi-nous-choisir"
                  className="hover:text-white transition cursor-pointer"
                >
                  Avantages
                </a>
              </li>
              <li>
                <a
                  href="#comment-ca-marche"
                  className="hover:text-white transition cursor-pointer"
                >
                  Comment ça marche
                </a>
              </li>
              <li>
                <a
                  href="#temoignages"
                  className="hover:text-white transition cursor-pointer"
                >
                  Success stories
                </a>
              </li>
            </ul>
          </div>

          {/* Section À propos / Légal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={routes.public.legal.cgu}
                  className="hover:text-white transition"
                >
                  CGU
                </Link>
              </li>
              <li>
                <Link
                  href={routes.public.legal.privacy}
                  className="hover:text-white transition"
                >
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href={routes.public.legal.mentions}
                  className="hover:text-white transition"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href={routes.auth.login}
                  className="hover:text-white transition"
                >
                  Se connecter
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© 2026 Tasky. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
