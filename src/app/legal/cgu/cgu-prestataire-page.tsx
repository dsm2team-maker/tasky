import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { colors } from "@/config/colors";
import { typography, spacing } from "@/config/design-tokens";

export default function CGUPrestatairePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className={`${spacing.section}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colors.secondary.bg} ${colors.secondary.text} text-sm font-semibold mb-4`}
            >
              🛠️ Conditions Prestataires
            </div>
            <h1 className={`${typography.h1.base} ${colors.text.primary} mb-4`}>
              Conditions Générales Prestataires
            </h1>
            <p className={`text-lg ${colors.text.secondary} mb-2`}>
              Applicables aux <strong>prestataires</strong> de la plateforme
              Tasky
            </p>
            <p className={`text-sm ${colors.text.tertiary}`}>
              Dernière mise à jour : 4 mars 2026
            </p>
            <div
              className={`mt-4 p-3 rounded-xl ${colors.info.bg} border ${colors.info.borderLight} text-sm ${colors.info.textDark}`}
            >
              Vous êtes client ?{" "}
              <Link href="/legal/cgu-client" className="font-bold underline">
                Consultez les CGU Clients →
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
                Les présentes Conditions Générales Prestataires définissent les
                droits et obligations des prestataires utilisant la plateforme
                Tasky pour proposer leurs services artisanaux.
              </p>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                En tant que prestataire, vous proposez vos compétences
                (retouches textiles, créations, réparations, etc.) à des clients
                via la plateforme Tasky.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                2. Inscription prestataire
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Pour proposer vos services sur Tasky, vous devez créer un compte
                prestataire en fournissant des informations exactes et à jour.
                Vous vous engagez à :
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className={colors.text.secondary}>
                  Être majeur (18 ans minimum)
                </li>
                <li className={colors.text.secondary}>
                  Fournir des informations véridiques sur vos compétences
                </li>
                <li className={colors.text.secondary}>
                  Renseigner une bio honnête présentant votre expérience
                </li>
                <li className={colors.text.secondary}>
                  Maintenir vos informations à jour
                </li>
                <li className={colors.text.secondary}>
                  Protéger la confidentialité de vos identifiants
                </li>
              </ul>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Tasky se réserve le droit de vérifier vos informations et de
                refuser ou suspendre tout compte ne respectant pas ces
                conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                3. Fonctionnement pour les prestataires
              </h2>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                3.1 Consultation des demandes
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Vous pouvez consulter les demandes publiées par les clients et
                envoyer des devis détaillés incluant le prix, les délais et les
                modalités de réalisation.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                3.2 Envoi de devis
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Le prix que vous indiquez dans votre devis est le prix que le
                client paiera.{" "}
                <strong>
                  La commission Tasky de 15% est prélevée sur votre rémunération
                  et non facturée au client.
                </strong>
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                3.3 Points de dépôt et retrait
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Les échanges d'objets se font dans des lieux neutres agréés.{" "}
                <strong>
                  Il est formellement interdit de recevoir des clients à votre
                  domicile ou de vous rendre chez un client.
                </strong>
              </p>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                4. Commission et rémunération
              </h2>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                4.1 Commission Tasky
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Tasky prélève une commission de <strong>15%</strong> sur chaque
                prestation réussie. Cette commission couvre les frais de
                fonctionnement de la plateforme, la sécurisation des paiements
                et le support.
              </p>

              <div
                className={`p-5 rounded-xl ${colors.secondary.bg} border ${colors.secondary.borderLight} mb-6`}
              >
                <p
                  className={`font-semibold ${colors.secondary.textDark} mb-3`}
                >
                  📊 Exemple concret :
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-emerald-200">
                    <span className={colors.secondary.textDark}>
                      Prix de votre devis
                    </span>
                    <strong className={colors.secondary.textDark}>100 €</strong>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-emerald-200">
                    <span className={colors.secondary.textDark}>
                      Commission Tasky (15%)
                    </span>
                    <strong className="text-red-600">− 15 €</strong>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className={`font-bold ${colors.secondary.textDark}`}>
                      Vous recevez
                    </span>
                    <strong className={`text-lg ${colors.secondary.text}`}>
                      85 €
                    </strong>
                  </div>
                </div>
                <p className={`text-xs ${colors.secondary.textMuted} mt-3`}>
                  💡 Le client paie 100 € — pas de frais supplémentaires pour
                  lui. La commission est uniquement à votre charge.
                </p>
              </div>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                4.2 Séquestre des paiements
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Lorsqu'un client accepte votre devis, le montant est bloqué sur
                la plateforme jusqu'à validation de la prestation. Cela vous
                protège contre les impayés.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                4.3 Versement
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Votre rémunération (prix du devis moins 15% de commission) est
                versée dans les délais convenus après validation de la
                prestation par le client.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                5. Obligations du prestataire
              </h2>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                5.1 Engagement qualité
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                En tant que prestataire, vous vous engagez à fournir des
                services de qualité conformes au devis accepté, et à respecter
                les délais convenus avec les clients.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                5.2 Responsabilité des objets
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Vous êtes responsable des objets confiés par les clients pendant
                toute la durée de la prestation. Une assurance RC pro est
                fortement recommandée.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                5.3 Comportement général
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className={colors.text.secondary}>
                  Utiliser la plateforme de manière loyale
                </li>
                <li className={colors.text.secondary}>
                  Ne pas contourner la plateforme pour des transactions directes
                </li>
                <li className={colors.text.secondary}>
                  Respecter les clients et répondre à leurs messages
                </li>
                <li className={colors.text.secondary}>
                  Ne pas accepter de devis que vous ne pouvez pas honorer
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                6. Annulations et litiges
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                En cas de litige entre un client et un prestataire, notre équipe
                intervient comme médiateur. Les annulations abusives répétées
                peuvent entraîner des pénalités ou la suspension du compte.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                7. Vérification de l'identité
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Tasky se réserve le droit de demander une vérification
                d'identité à tout prestataire. Toute usurpation d'identité
                entraînera la fermeture immédiate du compte et des poursuites
                judiciaires.
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
                paramètres, sous réserve qu'aucune prestation ne soit en cours.
                Tasky se réserve le droit de suspendre ou supprimer tout compte
                en cas de violation des présentes conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                10. Droit applicable
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Les présentes conditions sont soumises au droit français. En cas
                de litige, et après tentative de résolution amiable, les
                tribunaux français seront compétents.
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
