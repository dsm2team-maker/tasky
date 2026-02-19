"use client";
import Link from "next/link";
import { colors } from "@/config/colors";
import { typography, gradients } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import CategoriesSection from "@/components/CategoriesSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-34 h-16 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src="images/logo-tasky2.png"
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
                className={`${colors.text.secondary} hover:${colors.primary.text} transition cursor-pointer`}
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
                className={`${colors.text.secondary} hover:${colors.primary.text} transition cursor-pointer`}
              >
                Avantages
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
                className={`${colors.text.secondary} hover:${colors.primary.text} transition cursor-pointer`}
              >
                Témoignages
              </a>
            </nav>
            <Link
              href={routes.auth.login}
              className={`px-4 py-2 font-medium ${colors.text.secondary} hover:${colors.primary.text} transition`}
            >
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="{`relative overflow-hidden ${gradients.lightPrimary}`}">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1
                className={`${typography.h1.base} ${colors.text.primary} mb-4 leading-tight`}
              >
                <span className={colors.primary.gradientText}>
                  La bonne personne,
                </span>
                <br />
                pour la bonne tâche,
                <br />
                <span className={colors.secondary.gradientText}>
                  près de chez vous.
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Retouches • Tricot • Réparations • Créations artisanales
                <br />
                <strong className="text-gray-900">
                  Zéro contact domicile.
                </strong>{" "}
                Tout se passe en lieu neutre et sécurisé.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* LIEN 1 - Comme votre exemple qui fonctionne */}
                <Link
                  href={routes.auth.register.client}
                  className={`group px-8 py-4 ${colors.primary.gradient} font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-center`}
                >
                  {/* Pas de div parent supplémentaire ! */}
                  <div className="font-bold text-lg mt-1 opacity-90">
                    Commander un service
                  </div>
                </Link>

                {/* LIEN 2 */}
                <Link
                  href={routes.auth.register.artisan.step1}
                  className={`group px-8 py-4 ${colors.premium.gradient} font-semibold rounded-xl border-2 border-gray-200 hover:${colors.primary.border} hover:shadow-lg transition-all duration-300 text-center`}
                >
                  <div className="font-bold text-lg mt-1 opacity-90">
                    Proposer mes services
                  </div>
                </Link>
              </div>

              {/* Trust Badges   // je l'ai commenté parceque prou l'nstant tous ces information sont complement fausses
              <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start flex-wrap">
                Indicateur : nombre de prestataires 
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">1 200+</div>
                  <div className="text-sm text-gray-600">Prestataires</div>
                </div> 
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">4.8/5</div>
                  <div className="text-sm text-gray-600">⭐ Note moyenne</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">100%</div>
                  <div className="text-sm text-gray-600">
                    🔒 Click & Collect
                  </div>
                </div>
              </div> */}
            </div>

            {/* Right Visual - Floating Cards */}
            <div className="relative hidden lg:block h-96">
              <div className="absolute top-10 right-10 bg-white rounded-2xl shadow-2xl p-6 w-64 animate-float">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sophie L.</div>
                    <div className="text-sm text-gray-500">Il y a 5 min</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  "Ma veste réparée en 2 jours via Tasky. Dépôt au relais, super
                  simple !"
                </p>
                <div className="flex gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ⭐
                    </span>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-10 left-10 bg-white rounded-2xl shadow-2xl p-6 w-64 animate-float-delayed">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🧵</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Claire M.</div>
                    <div className="text-sm text-gray-500">
                      Couturière passionnée
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  "+40% de demandes grâce à Tasky"
                </p>
                <div className="mt-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full inline-block">
                  Vérifiée ✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi nous choisir - Avantages clés */}
      <section id="pourquoi-nous-choisir" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`${typography.h2.base} ${colors.text.primary} mb-4`}>
              Pourquoi nous choisir ?
            </h2>

            {/* ✅ NOUVEAU : 2 phrases mises en avant */}
            <div className="max-w-4xl mx-auto space-y-3">
              <p className={`text-xl font-semibold ${colors.secondary.text}`}>
                💰 Transformez votre savoir-faire en revenus depuis chez vous.
              </p>
              <p className={`text-xl font-semibold ${colors.primary.text}`}>
                🔍 Trouvez le bon artisan en quelques clics, en toute confiance.
              </p>
            </div>
          </div>

          {/* Pour les Clients */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8 flex items-center justify-center gap-3">
              <span className="text-3xl">👤</span> Pour les clients
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Client 1 - Trouver près de chez soi */}
              <div
                className={`group text-center p-6 rounded-2xl hover:${gradients.lightPrimary} transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:${colors.primary.border}`}
              >
                <div
                  className={`w-14 h-14 ${colors.primary.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  📍 Artisans locaux
                </h4>
                <p className="text-sm text-gray-600">
                  Trouvez des professionnels près de chez vous, disponibles
                  rapidement
                </p>
              </div>

              {/* Client 2 - Gagner du temps */}
              <div
                className={`group text-center p-6 rounded-2xl hover:${gradients.neutral} transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:${colors.neutral.border}`}
              >
                <div
                  className={`w-14 h-14 ${colors.primary.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  ⏱️ Gagnez du temps
                </h4>
                <p className="text-sm text-gray-600">
                  Une demande, plusieurs propositions. Comparez et choisissez
                  facilement
                </p>
              </div>

              {/* Client 3 - Paiement sécurisé */}
              <div
                className={`group text-center p-6 rounded-2xl hover:${gradients.neutral} transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:${colors.neutral.border}`}
              >
                <div
                  className={`w-14 h-14 ${colors.primary.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  💳 Paiement protégé
                </h4>
                <p className="text-sm text-gray-600">
                  Argent bloqué jusqu'à validation. Protection acheteur garantie
                </p>
              </div>

              {/* Client 4 - Avis vérifiés */}
              <div
                className={`group text-center p-6 rounded-2xl hover:${gradients.lightPrimary} transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:${colors.primary.border}`}
              >
                <div
                  className={`w-14 h-14 ${gradients.primary} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  ⭐ Avis vérifiés
                </h4>
                <p className="text-sm text-gray-600">
                  Choisissez sur la base de vraies expériences clients
                </p>
              </div>
            </div>
          </div>

          {/* Pour les Prestataires */}
          <div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8 flex items-center justify-center gap-3">
              <span className="text-3xl">🛠️</span> Pour les prestataires
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Prestataire 1 - Augmenter revenus */}
              <div
                className={`group text-center p-6 rounded-2xl hover:${gradients.lightPrimary} transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:${colors.primary.border}`}
              >
                <div
                  className={`w-14 h-14 ${colors.secondary.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  💰 Revenus complémentaires
                </h4>
                <p className="text-sm text-gray-600">
                  Recevez des demandes qualifiées sans prospection ni publicité
                </p>
              </div>

              {/* Prestataire 2 - Travailler de chez soi */}
              <div
                className={`group text-center p-6 rounded-2xl hover:${gradients.neutral} transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:${colors.neutral.border}`}
              >
                <div
                  className={`w-14 h-14 ${colors.secondary.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  🏠 Travaillez de chez vous
                </h4>
                <p className="text-sm text-gray-600">
                  Gérez vos demandes et échangez en ligne. Récupérez au point
                  relais
                </p>
              </div>

              {/* Prestataire 3 - Valoriser savoir-faire */}
              <div
                className={`group text-center p-6 rounded-2xl hover:${colors.secondary.bg} transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:${colors.secondary.border}`}
              >
                <div
                  className={`w-14 h-14 ${colors.secondary.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  🏅 Valorisez vos talents
                </h4>
                <p className="text-sm text-gray-600">
                  Vos avis positifs attirent plus de clients et renforcent votre
                  crédibilité
                </p>
              </div>

              {/* Prestataire 4 - Clients sérieux */}
              <div
                className={`group text-center p-6 rounded-2xl hover:${gradients.lightSecondary} transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:${colors.primary.border}`}
              >
                <div
                  className={`w-14 h-14 ${colors.secondary.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  🤝 Clients qualifiés
                </h4>
                <p className="text-sm text-gray-600">
                  Moins de clients fantômes, plus de demandes concrètes et
                  sérieuses
                </p>
              </div>
            </div>
          </div>

          {/* Messagerie instantanée */}
          <div className="mt-16 max-w-4xl mx-auto bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  💬 Messagerie intégrée
                </h4>
                <p className="text-gray-600">
                  Communication simple et fluide entre clients et prestataires
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Pour les clients :</strong> Posez vos questions avant
                  de choisir, ajustez votre demande, relation humaine
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Pour les prestataires :</strong> Clarifiez les
                  besoins, évitez les malentendus, gagnez du temps
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche - Double parcours */}
      <section
        id="comment-ca-marche"
        className="py-20 bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className={`${typography.h2.base} ${colors.text.primary} mb-4`}>
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600">
              Un parcours simple et sécurisé, que vous soyez client ou
              prestataire
            </p>
          </div>

          {/* Parcours Client */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <div
                className={`inline-flex items-center gap-3 px-6 py-3 ${colors.primary.gradient} rounded-full mb-4`}
              >
                <span className="text-3xl">👤</span>
                <h3 className="text-2xl font-bold text-white">
                  Besoin d'un service ?
                </h3>
              </div>
              <p className="text-xl text-gray-600">
                Votre parcours en 4 étapes
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Client Étape 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-300">
                <div
                  className={`w-16 h-16 ${colors.primary.gradient} rounded-full flex items-center justify-center mb-4`}
                >
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Décrivez ce dont vous avez besoin
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Retouche de vêtement, réparation d'objet, tricot sur-mesure...
                  Publiez votre demande en quelques mots. Ajoutez des photos si
                  besoin.
                </p>
                <div className="inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                  ✓ Gratuit et sans engagement
                </div>
              </div>

              {/* Client Étape 2 */}

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-300">
                <div
                  className={`w-16 h-16 ${colors.primary.gradient} rounded-full flex items-center justify-center mb-4`}
                >
                  <span className="text-white text-2xl font-bold">2</span>
                </div>

                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Les artisans vous contactent
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Recevez plusieurs propositions de prestataires locaux.
                  Comparez les tarifs, les délais et les avis. Discutez
                  directement par messagerie.
                </p>
                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                  ✓ Vous choisissez le meilleur profil
                </div>
              </div>

              {/* Client Étape 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-300">
                <div
                  className={`w-16 h-16 ${colors.primary.gradient} rounded-full flex items-center justify-center mb-4`}
                >
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Votre argent est protégé
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Une fois votre prestataire choisi, confirmez la prestation.
                  Votre paiement est bloqué en zone sécurisée jusqu'à votre
                  validation finale.
                </p>
                <div className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
                  ✓ Zéro risque, vous êtes protégé
                </div>
              </div>

              {/* Client Étape 4 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-300">
                <div
                  className={`w-16 h-16 ${colors.primary.gradient} rounded-full flex items-center justify-center mb-4`}
                >
                  <span className="text-white text-2xl font-bold">4</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Récupérez votre objet terminé
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Récupérez votre objet en lieu neutre. Vérifiez que tout est
                  parfait. Validez la prestation pour débloquer le paiement au
                  prestataire.
                </p>
                <div
                  className={`inline-block px-3 py-1 ${colors.success.bg} ${colors.success.text} text-xs font-semibold rounded-full`}
                >
                  ✓ Satisfaction garantie
                </div>
              </div>
            </div>
          </div>

          {/* Parcours Prestataire */}
          <div className="mb-12">
            <div className="text-center mb-12">
              <div
                className={`inline-flex items-center gap-3 px-6 py-3 ${colors.secondary.gradient} rounded-full mb-4`}
              >
                <span className="text-3xl">🛠️</span>
                <h3 className="text-2xl font-bold text-white">
                  Vous avez un savoir-faire ?
                </h3>
              </div>
              <p className="text-xl text-gray-600">
                Votre parcours en 4 étapes
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Prestataire Étape 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-300">
                <div
                  className={`w-16 h-16 ${colors.secondary.gradient} rounded-full flex items-center justify-center mb-4`}
                >
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Présentez vos talents
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Artisan professionnel ou particulier passionné ? Créez votre
                  profil en quelques minutes. Décrivez vos services, fixez vos
                  tarifs, ajoutez vos réalisations.
                </p>
                <div
                  className={`inline-block px-3 py-1 ${colors.success.bg} ${colors.success.text} text-xs font-semibold rounded-full`}
                >
                  ✓ Gratuit et sans engagement
                </div>
              </div>

              {/* Prestataire Étape 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-300">
                <div
                  className={`w-16 h-16 ${colors.secondary.gradient} rounded-full flex items-center justify-center mb-4`}
                >
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Les demandes arrivent à vous
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Consultez les demandes publiées dans votre zone. Choisissez
                  celles qui vous intéressent. Contactez les clients par
                  messagerie pour clarifier les détails.
                </p>
                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                  ✓ Fini la prospection
                </div>
              </div>

              {/* Prestataire Étape 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-300">
                <div
                  className={`w-16 h-16 ${colors.secondary.gradient} rounded-full flex items-center justify-center mb-4`}
                >
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Travaillez en toute tranquillité
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Le client paie, l'argent est bloqué en sécurité. Vous
                  récupérez l'objet en lieu neutre, réalisez votre prestation
                  depuis chez vous, et redéposez l'objet terminé.
                </p>
                <div className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
                  ✓ Paiement garanti
                </div>
              </div>

              {/* Prestataire Étape 4 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-300">
                <div
                  className={`w-16 h-16 ${colors.secondary.gradient} rounded-full flex items-center justify-center mb-4`}
                >
                  <span className="text-white text-2xl font-bold">4</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Vous êtes payé rapidement
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Le client récupère l'objet et valide la prestation. Votre
                  paiement est automatiquement débloqué et versé sur votre
                  compte. Vos avis positifs attirent de nouveaux clients.
                </p>
                <div
                  className={`inline-block px-3 py-1 ${colors.success.bg} ${colors.success.text} text-xs font-semibold rounded-full`}
                >
                  ✓ Réputation valorisée
                </div>
              </div>
            </div>
          </div>

          {/* Encadré sécurité */}
          <div
            className={`max-w-4xl mx-auto ${gradients.neutral} border-2 ${colors.neutral.border} rounded-2xl p-8`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 ${colors.primary.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-gray-900 mb-3">
                  🔒 Votre sécurité, notre priorité
                </h4>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Tous les échanges se font en <strong>lieux neutres</strong>{" "}
                  (Boulangerie, centre commercial,boucherie...).
                  <strong className="text-blue-700">
                    {" "}
                    Zéro contact domicile.
                  </strong>{" "}
                  Votre paiement est protégé jusqu'à validation complète de la
                  prestation. En cas de litige, notre équipe intervient pour
                  trouver une solution équitable.
                </p>

                {/* Badges de réassurance */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                    <div className="text-2xl mb-1">💳</div>
                    <div className="text-xs font-semibold text-gray-700">
                      Paiement sécurisé
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                    <div className="text-2xl mb-1">🛡️</div>
                    <div className="text-xs font-semibold text-gray-700">
                      Protection acheteur
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                    <div className="text-2xl mb-1">📍</div>
                    <div className="text-xs font-semibold text-gray-700">
                      Lieux neutres
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                    <div className="text-2xl mb-1">💬</div>
                    <div className="text-xs font-semibold text-gray-700">
                      Messagerie intégrée
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                    <div className="text-2xl mb-1">⭐</div>
                    <div className="text-xs font-semibold text-gray-700">
                      Avis vérifiés
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CategoriesSection />

      {/* Double CTA - Client/Artisan */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`${typography.h2.base} ${colors.text.primary} mb-4`}>
              Prêt à commencer ?
            </h2>
            <p className={`text-xl ${colors.text.secondary}`}>
              Rejoignez notre communauté dès aujourd'hui
            </p>
          </div>
          <div className=" max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
            <div
              className={`group relative overflow-hidden ${gradients.lightPrimary} rounded-3xl p-8 border-2 border-transparent hover:${colors.primary.border} hover:shadow-2xl transition-all duration-300`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-50"></div>
              <div className="relative">
                <div className="text-5xl mb-4">👤</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Vous êtes client ?
                </h3>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <span className={`${colors.primary.text} mt-1`}>✓</span>
                    <span className="text-gray-700">
                      Retouches, tricot, réparations, créations
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className={`${colors.primary.text} mt-1`}>✓</span>
                    <span className="text-gray-700">
                      Dépôt/retrait en lieu neutre sécurisé
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className={`${colors.primary.text} mt-1`}>✓</span>
                    <span className="text-gray-700">
                      Paiement bloqué jusqu'à satisfaction
                    </span>
                  </li>
                </ul>

                <div className="flex flex-col items-center gap-2">
                  <Link
                    href={routes.auth.register.client}
                    className={`group px-8 py-4 ${colors.primary.gradient} text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all text-center`}
                  >
                    <span className="text-lg">
                      {" "}
                      📝Publier ma première demande
                    </span>
                    <div className="text-sm mt-1 opacity-90">
                      Sans engagement
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div
              className={`group relative overflow-hidden ${gradients.neutral} rounded-3xl p-8 border-2 border-transparent hover:${colors.neutral.border} hover:shadow-2xl transition-all duration-300`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200 rounded-full blur-3xl opacity-50"></div>

              <div className="relative">
                <div className="text-5xl mb-4">🛠️</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Vous avez un savoir-faire ?
                </h3>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <span className={`${colors.secondary.text} mt-1`}>✓</span>
                    <span className="text-gray-700">
                      Artisan pro ou particulier qualifié ? Bienvenue !
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className={`${colors.secondary.text} mt-1`}>✓</span>
                    <span className="text-gray-700">
                      Récupérez les objets en point relais
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className={`${colors.secondary.text} mt-1`}>✓</span>
                    <span className="text-gray-700">
                      Travaillez en toute sécurité, sans domicile
                    </span>
                  </li>
                </ul>
                <div className="flex flex-col items-center gap-2">
                  <Link
                    href={routes.auth.register.artisan.step1}
                    className={`group px-8 py-4 ${colors.secondary.gradient} text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all text-center`}
                  >
                    <span className="text-lg">🛠️ Créer mon profil artisan</span>
                    <div className="text-sm mt-1 opacity-90">
                      Pros & Particuliers bienvenus
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section
        id="temoignages"
        className="py-20 bg-gradient-to-br from-purple-50 to-pink-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600">
              Plus de 10 000 projets réalisés avec succès
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">
                    ⭐
                  </span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "J'ai fait réparer ma veste préférée via Tasky. Dépôt et retrait
                au relais près de chez moi, super pratique et sécurisé !"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  SL
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sophie L.</div>
                  <div className="text-sm text-gray-500">Cliente à Paris</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">
                    ⭐
                  </span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Je propose mes retouches via Tasky sans me déplacer. Les
                clients déposent au point relais, je récupère, je travaille
                tranquille !"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 ${colors.primary.gradient} rounded-full flex items-center justify-center text-white font-bold`}
                >
                  CM
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Claire M.</div>
                  <div className="text-sm text-gray-500">Couturière à Lyon</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">
                    ⭐
                  </span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "Mon pull troué réparé par une tricoteuse locale trouvée sur
                Tasky. Résultat impeccable, contact zéro stress !"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 ${colors.secondary.gradient} rounded-full flex items-center justify-center text-white font-bold`}
                >
                  MR
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Marc R.</div>
                  <div className="text-sm text-gray-500">
                    Client à Marseille
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à utiliser Tasky ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Rejoignez des milliers d'utilisateurs qui trouvent ou proposent des
            services en toute sécurité
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={routes.auth.register.client}
              className={`px-8 py-4 bg-white ${colors.primary.text} font-bold rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-xl`}
            >
              Publier une demande
            </Link>
            <Link
              href={routes.auth.register.artisan.step1}
              className="px-8 py-4 bg-transparent text-white font-bold rounded-xl border-2 border-white hover:bg-white/10 transition-all"
            >
              Proposer mes services
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Professionnel */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="w-34 h-16 rounded-lg overflow-hidden">
                <img
                  src="images/logo-tasky2.png"
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
                    href={routes.auth.register.artisan.step1}
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
                  <Link
                    href={routes.public.legal.cgu}
                    className="hover:text-white transition"
                  >
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
    </div>
  );
}
