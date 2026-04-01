import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { colors } from "@/config/colors";
import { typography, spacing } from "@/config/design-tokens";

export default function CGUClientPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className={`${spacing.section}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colors.primary.bg} ${colors.primary.text} text-sm font-semibold mb-4`}
            >
              👤 Conditions Clients
            </div>
            <h1 className={`${typography.h1.base} ${colors.text.primary} mb-4`}>
              Conditions Générales d'Utilisation
            </h1>
            <p className={`text-lg ${colors.text.secondary} mb-2`}>
              Applicables aux <strong>clients</strong> de la plateforme Tasky
            </p>
            <p className={`text-sm ${colors.text.tertiary}`}>
              Dernière mise à jour : 4 mars 2026
            </p>
            <div
              className={`mt-4 p-3 rounded-xl ${colors.info.bg} border ${colors.info.borderLight} text-sm ${colors.info.textDark}`}
            >
              Vous êtes prestataire ?{" "}
              <Link
                href="/legal/cgu-prestataire"
                className="font-bold underline"
              >
                Consultez les CGU Prestataires →
              </Link>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                1. Objet
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Les présentes Conditions Générales d'Utilisation (CGU)
                définissent les modalités d'utilisation de la plateforme Tasky
                par les clients, accessible à l'adresse www.tasky.fr.
              </p>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Tasky met en relation des clients recherchant des prestations de
                services artisanaux (retouches textiles, créations, réparations,
                etc.) avec des prestataires qualifiés.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                2. Acceptation des CGU
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                L'utilisation de la plateforme implique l'acceptation pleine et
                entière des présentes CGU. Si vous n'acceptez pas ces
                conditions, vous ne devez pas utiliser la plateforme.
              </p>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Nous nous réservons le droit de modifier ces CGU à tout moment.
                Les modifications seront notifiées aux utilisateurs et prendront
                effet dès leur publication.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                3. Création de compte client
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Pour utiliser la plateforme en tant que client, vous devez créer
                un compte en fournissant des informations exactes. Vous vous
                engagez à :
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className={colors.text.secondary}>
                  Être majeur (18 ans minimum)
                </li>
                <li className={colors.text.secondary}>
                  Fournir des informations véridiques et complètes
                </li>
                <li className={colors.text.secondary}>
                  Maintenir vos informations à jour
                </li>
                <li className={colors.text.secondary}>
                  Protéger la confidentialité de vos identifiants de connexion
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                4. Fonctionnement pour les clients
              </h2>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                4.1 Publication d'une demande
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                En tant que client, vous pouvez publier des demandes de service
                en précisant la nature de la prestation souhaitée, votre budget
                et votre localisation. Les prestataires pourront alors vous
                envoyer des devis.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                4.2 Acceptation d'un devis
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Lorsque vous acceptez un devis, le montant total est bloqué sur
                la plateforme Tasky jusqu'à validation complète de la
                prestation.{" "}
                <strong>
                  Le prix que vous payez est le prix affiché dans le devis —
                  aucun frais supplémentaire ne vous est facturé.
                </strong>
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                4.3 Points de dépôt et retrait
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Les échanges d'objets se font dans des lieux neutres agréés
                (points relais, commerces partenaires).{" "}
                <strong>
                  Aucun échange ne doit avoir lieu au domicile des utilisateurs.
                </strong>
              </p>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                5. Paiement
              </h2>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                5.1 Séquestre des paiements
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Le montant du devis accepté est bloqué sur la plateforme jusqu'à
                votre validation de la prestation terminée. Cela garantit votre
                sécurité en tant que client.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                5.2 Ce que vous payez
              </h3>
              <div
                className={`p-5 rounded-xl ${colors.primary.bg} border ${colors.primary.borderLight} mb-4`}
              >
                <p className={`font-semibold ${colors.primary.textDark} mb-2`}>
                  Exemple de transaction :
                </p>
                <ul className={`text-sm ${colors.primary.textDark} space-y-1`}>
                  <li>
                    💰 Devis du prestataire : <strong>100 €</strong>
                  </li>
                  <li>
                    ✅ Vous payez : <strong>100 €</strong> (prix affiché)
                  </li>
                  <li>
                    📋 La commission Tasky (15%) est prélevée sur la
                    rémunération du prestataire
                  </li>
                </ul>
              </div>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                En tant que client, vous ne payez que le prix indiqué dans le
                devis. La commission de 15% prélevée par Tasky est à la charge
                du prestataire et non du client.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                5.3 Validation de la prestation
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Une fois la prestation reçue et validée par vos soins, le
                paiement est libéré vers le prestataire. En cas de litige, notre
                équipe intervient comme médiateur.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                6. Obligations du client
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Vous vous engagez à :
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className={colors.text.secondary}>
                  Utiliser la plateforme de manière loyale et conforme aux lois
                  en vigueur
                </li>
                <li className={colors.text.secondary}>
                  Ne pas publier de contenu offensant, illégal ou trompeur
                </li>
                <li className={colors.text.secondary}>
                  Respecter les prestataires et leurs délais
                </li>
                <li className={colors.text.secondary}>
                  Ne pas contourner la plateforme pour réaliser des transactions
                  en direct
                </li>
                <li className={colors.text.secondary}>
                  Valider honnêtement les prestations réalisées conformément au
                  devis
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                7. Responsabilité
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Tasky agit uniquement en tant qu'intermédiaire entre clients et
                prestataires. En cas de litige, Tasky propose un service de
                médiation pour tenter de trouver une solution amiable.
              </p>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Tasky ne peut être tenue responsable de la qualité des
                prestations réalisées par les prestataires, ni des dommages
                causés aux objets confiés.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                8. Données personnelles
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Le traitement de vos données personnelles est régi par notre
                Politique de Confidentialité. En utilisant la plateforme, vous
                acceptez ce traitement.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                9. Résiliation
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Vous pouvez supprimer votre compte à tout moment depuis vos
                paramètres. Tasky se réserve le droit de suspendre ou supprimer
                tout compte en cas de violation des présentes CGU.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                10. Droit applicable
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Les présentes CGU sont soumises au droit français. En cas de
                litige, et après tentative de résolution amiable, les tribunaux
                français seront compétents.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                11. Contact
              </h2>
              <div className={`${colors.neutral.bg} p-6 rounded-lg`}>
                <p className={`${colors.text.secondary} mb-2`}>
                  <strong>Email :</strong> contact@tasky.fr
                </p>
                <p className={`${colors.text.secondary}`}>
                  <strong>Adresse :</strong> [Adresse complète de la société]
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
