import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="w-34 h-16 rounded-lg overflow-hidden">
              <img
                src="/images/logo-tasky.png"
                alt="Tasky Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-sm text-gray-400">
              La plateforme qui connecte clients et prestataires en toute
              sécurité.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Clients</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  Trouver un artisan
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Catégories
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Avis clients
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Artisans</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/auth/register/artisan/step-1"
                  className="hover:text-white transition"
                >
                  Devenir partenaire
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Tarifs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Espace pro
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Success stories
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">À propos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/legal/cgu" className="hover:text-white transition">
                  CGU
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Aide
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© 2026 Artisan Marketplace. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
