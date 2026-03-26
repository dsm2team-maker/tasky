"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { colors } from "@/config/colors";
import { typography, gradients } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import { useAuthStore } from "@/stores/auth-store";
import CategoriesSection from "@/components/CategoriesSection";
import { Button } from "@/components/Button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // ✅ Redirection automatique si connecté
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      if (user?.role === "CLIENT") router.push(routes.client.dashboard);
      else if (user?.role === "PRESTATAIRE")
        router.push(routes.prestataire.dashboard);
    }
  }, [isHydrated, isAuthenticated, user, router]);

  // Loader pendant hydration
  if (!isHydrated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className={`relative overflow-hidden ${gradients.lightPrimary}`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                <span className={colors.secondary.text}>
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
                <Link
                  href={routes.auth.register.client}
                  className={`group px-8 py-4 ${colors.primary.gradient} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 text-center`}
                >
                  <div className="font-bold text-lg mt-1 opacity-90">
                    Commander un service
                  </div>
                </Link>
                <Link
                  href={routes.auth.register.prestataire.step1}
                  className={`group px-8 py-4 ${colors.secondary.gradient} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 text-center`}
                >
                  <div className="font-bold text-lg mt-1 opacity-90">
                    Proposer mes services
                  </div>
                </Link>
              </div>
            </div>

            {/* Floating Cards */}
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

      {/* Pourquoi nous choisir */}
      <section id="pourquoi-nous-choisir" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`${typography.h2.base} ${colors.text.primary} mb-4`}>
              Pourquoi nous choisir ?
            </h2>
          </div>

          {/* Pour les Clients */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2 flex items-center justify-center gap-3">
              <span className="text-3xl">👤</span> Pour les clients
            </h3>
            <div className="max-w-4xl mx-auto space-y-3 text-center mb-6">
              <p className={`text-xl font-semibold ${colors.primary.text}`}>
                🔍 Trouvez le bon prestataire en quelques clics, en toute
                confiance.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
                  title: "📍 Artisans locaux",
                  desc: "Trouvez des professionnels près de chez vous, disponibles rapidement",
                },
                {
                  icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                  title: "⏱️ Gagnez du temps",
                  desc: "Une demande, plusieurs propositions. Comparez et choisissez facilement",
                },
                {
                  icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                  title: "💳 Paiement protégé",
                  desc: "Argent bloqué jusqu'à validation. Protection acheteur garantie",
                },
                {
                  icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
                  title: "⭐ Avis vérifiés",
                  desc: "Choisissez sur la base de vraies expériences clients",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`group text-center p-6 rounded-2xl hover:shadow-xl border-2 border-transparent hover:${colors.primary.border} transition-all duration-300`}
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
                        d={item.icon}
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pour les Prestataires */}
          <div>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2 flex items-center justify-center gap-3">
              <span className="text-3xl">🛠️</span> Pour les prestataires
            </h3>
            <div className="max-w-4xl mx-auto space-y-3 text-center mb-6">
              <p className={`text-xl font-semibold ${colors.secondary.text}`}>
                💰 Transformez votre savoir-faire en revenus depuis chez vous.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                  title: "💰 Revenus complémentaires",
                  desc: "Recevez des demandes qualifiées sans prospection ni publicité",
                },
                {
                  icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
                  title: "🏠 Travaillez de chez vous",
                  desc: "Gérez vos demandes et échangez en ligne. Récupérez au point relais",
                },
                {
                  icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
                  title: "🏅 Valorisez vos talents",
                  desc: "Vos avis positifs attirent plus de clients et renforcent votre crédibilité",
                },
                {
                  icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                  title: "🤝 Clients qualifiés",
                  desc: "Moins de clients fantômes, plus de demandes concrètes et sérieuses",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`group text-center p-6 rounded-2xl hover:shadow-xl border-2 border-transparent hover:${colors.secondary.border} transition-all duration-300`}
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
                        d={item.icon}
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Messagerie */}
          <div className="mt-16 max-w-4xl mx-auto bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
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

      {/* Comment ça marche */}
      <section
        id="comment-ca-marche"
        className={`py-10 ${gradients.lightPrimary}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
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
              <div className="flex items-center justify-center gap-3 mb-8">
                <span className="text-4xl">👤</span>
                <h3 className={`${typography.h3.base} ${colors.premium.text}`}>
                  Besoin d'un service ?
                </h3>
              </div>
              <p className="text-xl text-gray-600">
                Votre parcours en 4 étapes
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  num: 1,
                  title: "Décrivez ce dont vous avez besoin",
                  desc: "Retouche de vêtement, réparation d'objet, tricot sur-mesure... Publiez votre demande en quelques mots.",
                  badge: "✓ Gratuit et sans engagement",
                  badgeColor: "bg-green-50 text-green-700",
                },
                {
                  num: 2,
                  title: "Les prestataires vous contactent",
                  desc: "Recevez plusieurs propositions de prestataires locaux. Comparez les tarifs, les délais et les avis.",
                  badge: "✓ Vous choisissez le meilleur profil",
                  badgeColor: "bg-blue-50 text-blue-700",
                },
                {
                  num: 3,
                  title: "Votre argent est protégé",
                  desc: "Votre paiement est bloqué en zone sécurisée jusqu'à votre validation finale.",
                  badge: "✓ Zéro risque, vous êtes protégé",
                  badgeColor: "bg-purple-50 text-purple-700",
                },
                {
                  num: 4,
                  title: "Récupérez votre objet terminé",
                  desc: "Récupérez votre objet en lieu neutre. Validez la prestation pour débloquer le paiement.",
                  badge: "✓ Satisfaction garantie",
                  badgeColor: `${colors.success.bg} ${colors.success.text}`,
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-300"
                >
                  <div
                    className={`w-12 h-12 ${colors.primary.gradient} rounded-full flex items-center justify-center mb-4`}
                  >
                    <span className="text-white text-2xl font-bold">
                      {step.num}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">{step.desc}</p>
                  <div
                    className={`inline-block px-3 py-1 ${step.badgeColor} text-xs font-semibold rounded-full`}
                  >
                    {step.badge}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Parcours Prestataire */}
          <div className="mb-12">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-8">
                <span className="text-4xl">🛠️</span>
                <h3 className={`${typography.h3.base} ${colors.premium.text}`}>
                  Vous avez un savoir-faire ?
                </h3>
              </div>
              <p className="text-xl text-gray-600">
                Votre parcours en 4 étapes
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  num: 1,
                  title: "Présentez vos talents",
                  desc: "Créez votre profil en quelques minutes. Décrivez vos services, fixez vos tarifs, ajoutez vos réalisations.",
                  badge: "✓ Gratuit et sans engagement",
                  badgeColor: `${colors.success.bg} ${colors.success.text}`,
                },
                {
                  num: 2,
                  title: "Les demandes arrivent à vous",
                  desc: "Consultez les demandes publiées dans votre zone. Choisissez celles qui vous intéressent.",
                  badge: "✓ Fini la prospection",
                  badgeColor: "bg-blue-50 text-blue-700",
                },
                {
                  num: 3,
                  title: "Travaillez en toute tranquillité",
                  desc: "Récupérez l'objet en lieu neutre, réalisez votre prestation depuis chez vous, redéposez l'objet terminé.",
                  badge: "✓ Paiement garanti",
                  badgeColor: "bg-purple-50 text-purple-700",
                },
                {
                  num: 4,
                  title: "Vous êtes payé rapidement",
                  desc: "Le client valide la prestation. Votre paiement est automatiquement débloqué et versé sur votre compte.",
                  badge: "✓ Réputation valorisée",
                  badgeColor: `${colors.success.bg} ${colors.success.text}`,
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-emerald-300"
                >
                  <div
                    className={`w-12 h-12 ${colors.secondary.gradient} rounded-full flex items-center justify-center mb-4`}
                  >
                    <span className="text-white text-2xl font-bold">
                      {step.num}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">{step.desc}</p>
                  <div
                    className={`inline-block px-3 py-1 ${step.badgeColor} text-xs font-semibold rounded-full`}
                  >
                    {step.badge}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sécurité */}
          <div
            className={`max-w-4xl mx-auto ${gradients.neutral} border-2 ${colors.neutral.border} rounded-2xl p-8`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 ${colors.premium.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}
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
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  🔒 Votre sécurité, notre priorité
                </h4>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Tous les échanges se font en <strong>lieux neutres</strong>{" "}
                  (Boulangerie, centre commercial, boucherie...).
                  <strong className="text-blue-700">
                    {" "}
                    Zéro contact domicile.
                  </strong>{" "}
                  Votre paiement est protégé jusqu'à validation complète.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                  {[
                    ["💳", "Paiement sécurisé"],
                    ["🛡️", "Protection acheteur"],
                    ["📍", "Lieux neutres"],
                    ["💬", "Messagerie intégrée"],
                    ["⭐", "Avis vérifiés"],
                  ].map(([icon, label]) => (
                    <div
                      key={label}
                      className="bg-white rounded-lg p-3 text-center shadow-sm"
                    >
                      <div className="text-2xl mb-1">{icon}</div>
                      <div className="text-xs font-semibold text-gray-700">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div id="categories">
        <CategoriesSection />
      </div>

      {/* Double CTA */}
      <section className={`py-10 ${gradients.lightPrimary}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`${typography.h2.base} ${colors.text.primary} mb-4`}>
              Prêt à commencer ?
            </h2>
            <p className={`text-xl ${colors.text.secondary}`}>
              Rejoignez notre communauté dès aujourd'hui
            </p>
          </div>
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
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
                <Link
                  href={routes.auth.register.client}
                  className={`inline-block px-8 py-4 ${colors.primary.gradient} text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all text-center`}
                >
                  <span className="text-lg">📝 Publier une demande</span>
                  <div className="text-sm mt-1 opacity-90">Sans engagement</div>
                </Link>
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
                <Link
                  href={routes.auth.register.prestataire.step1}
                  className={`inline-block px-8 py-4 ${colors.secondary.gradient} text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all text-center`}
                >
                  <span className="text-lg">
                    🛠️ Créer mon profil prestataire
                  </span>
                  <div className="text-sm mt-1 opacity-90">
                    Pros & Particuliers bienvenus
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section id="temoignages" className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className={`${typography.h2.base} ${colors.text.primary} mb-4`}>
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600">
              Plus de 10 000 projets réalisés avec succès
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                initials: "SL",
                name: "Sophie L.",
                location: "Cliente à Paris",
                text: '"J\'ai fait réparer ma veste préférée via Tasky. Dépôt et retrait au relais près de chez moi, super pratique et sécurisé !"',
                gradient: "bg-gradient-to-br from-blue-400 to-purple-600",
              },
              {
                initials: "CM",
                name: "Claire M.",
                location: "Couturière à Lyon",
                text: '"Je propose mes retouches via Tasky sans me déplacer. Les clients déposent au point relais, je récupère, je travaille tranquille !"',
                gradient: colors.primary.gradient,
              },
              {
                initials: "MR",
                name: "Marc R.",
                location: "Client à Marseille",
                text: '"Mon pull troué réparé par une tricoteuse locale trouvée sur Tasky. Résultat impeccable, contact zéro stress !"',
                gradient: colors.secondary.gradient,
              },
            ].map((t) => (
              <div
                key={t.initials}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 ${t.gradient} rounded-full flex items-center justify-center text-white font-bold`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className={`py-10 ${gradients.lightPrimary}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`${typography.h2.base} ${colors.text.primary} mb-4`}>
            Prêt à utiliser Tasky ?
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            Rejoignez des milliers d'utilisateurs qui trouvent ou proposent des
            services en toute sécurité
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={routes.auth.register.client}>
              <Button variant="primary" size="lg" className="shadow-xl">
                Publier une demande
              </Button>
            </Link>
            <Link href={routes.auth.register.prestataire.step1}>
              <Button variant="secondary" size="lg" className="shadow-xl">
                Proposer mes services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
