import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { colors } from "@/config/colors";
import { typography, spacing } from "@/config/design-tokens";

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className={`${spacing.section}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h1 className={`${typography.h1.base} ${colors.text.primary} mb-4`}>
              Conditions Générales d'Utilisation
            </h1>
            <p className={`text-lg ${colors.text.secondary}`}>
              Dernière mise à jour : 4 mars 2026
            </p>
          </div>

          {/* Contenu légal */}
          <div className="prose prose-lg max-w-none">
            {/* Article 1 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                1. Objet
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Les présentes Conditions Générales d'Utilisation (ci-après les «
                CGU ») ont pour objet de définir les modalités et conditions
                d'utilisation de la plateforme Tasky, accessible à l'adresse
                www.tasky.fr (ci-après la « Plateforme »).
              </p>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                La Plateforme Tasky met en relation des clients recherchant des
                prestations de services artisanaux (retouches textiles,
                créations, réparations, etc.) avec des prestataires qualifiés
                (ci-après les « Artisans »).
              </p>
            </section>

            {/* Article 2 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                2. Acceptation des CGU
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                L'utilisation de la Plateforme implique l'acceptation pleine et
                entière des présentes CGU. Si vous n'acceptez pas ces
                conditions, vous ne devez pas utiliser la Plateforme.
              </p>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Nous nous réservons le droit de modifier ces CGU à tout moment.
                Les modifications seront notifiées aux utilisateurs et prendront
                effet dès leur publication sur la Plateforme.
              </p>
            </section>

            {/* Article 3 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                3. Inscription et création de compte
              </h2>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                3.1 Conditions d'inscription
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Pour utiliser la Plateforme, vous devez créer un compte en
                fournissant des informations exactes et à jour. Vous vous
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

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                3.2 Comptes artisans
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Les artisans souhaitant proposer leurs services doivent fournir
                des justificatifs d'identité et de compétences. Tasky se réserve
                le droit de vérifier ces informations et de refuser ou suspendre
                tout compte.
              </p>
            </section>

            {/* Article 4 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                4. Fonctionnement de la Plateforme
              </h2>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                4.1 Pour les clients
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Les clients peuvent publier des demandes de service en précisant
                la nature de la prestation souhaitée. Les artisans peuvent
                ensuite proposer leurs services en envoyant des devis.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                4.2 Pour les artisans
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Les artisans peuvent consulter les demandes publiées et
                soumettre des devis détaillés incluant le prix, les délais et
                les modalités de réalisation.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                4.3 Points de dépôt et retrait
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Les échanges d'objets se font exclusivement dans des lieux
                neutres agréés (points relais, commerces partenaires).{" "}
                <strong>
                  Aucun échange ne doit avoir lieu au domicile des utilisateurs.
                </strong>
              </p>
            </section>

            {/* Article 5 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                5. Paiement et commission
              </h2>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                5.1 Séquestre des paiements
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Lorsqu'un client accepte un devis, le montant est bloqué sur la
                plateforme Tasky jusqu'à validation complète de la prestation.
                Cela garantit la sécurité des deux parties.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                5.2 Commission de la plateforme
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Tasky prélève une commission de [X]% sur chaque transaction
                réussie. Cette commission couvre les frais de fonctionnement de
                la plateforme, la sécurisation des paiements et le support
                client.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                5.3 Versement aux artisans
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Le paiement est versé à l'artisan dans les [X] jours suivant la
                validation de la prestation par le client.
              </p>
            </section>

            {/* Article 6 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                6. Obligations des utilisateurs
              </h2>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                6.1 Comportement général
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Vous vous engagez à :
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className={colors.text.secondary}>
                  Utiliser la Plateforme de manière loyale et conforme aux lois
                  en vigueur
                </li>
                <li className={colors.text.secondary}>
                  Ne pas publier de contenu offensant, illégal ou trompeur
                </li>
                <li className={colors.text.secondary}>
                  Respecter les autres utilisateurs
                </li>
                <li className={colors.text.secondary}>
                  Ne pas contourner la Plateforme pour réaliser des transactions
                  en direct
                </li>
              </ul>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                6.2 Sécurité
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Pour votre sécurité, tous les échanges doivent se faire via les
                points neutres agréés. Il est formellement interdit de
                communiquer votre adresse personnelle ou de rencontrer d'autres
                utilisateurs à votre domicile.
              </p>
            </section>

            {/* Article 7 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                7. Responsabilité
              </h2>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                7.1 Rôle de Tasky
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Tasky agit uniquement en tant qu'intermédiaire entre clients et
                artisans. Nous ne sommes pas partie prenante aux contrats
                conclus entre utilisateurs.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                7.2 Limitation de responsabilité
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Tasky ne peut être tenue responsable :
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className={colors.text.secondary}>
                  De la qualité des prestations réalisées par les artisans
                </li>
                <li className={colors.text.secondary}>
                  Des litiges entre utilisateurs
                </li>
                <li className={colors.text.secondary}>
                  Des dommages causés aux objets confiés
                </li>
                <li className={colors.text.secondary}>
                  Des problèmes techniques indépendants de notre volonté
                </li>
              </ul>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                7.3 Médiation
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                En cas de litige entre utilisateurs, Tasky propose un service de
                médiation pour tenter de trouver une solution amiable.
              </p>
            </section>

            {/* Article 8 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                8. Propriété intellectuelle
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Tous les éléments de la Plateforme (logos, textes, images,
                design, etc.) sont la propriété exclusive de Tasky ou de ses
                partenaires. Toute reproduction, même partielle, est interdite
                sans autorisation préalable.
              </p>
            </section>

            {/* Article 9 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                9. Données personnelles
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Le traitement de vos données personnelles est régi par notre
                Politique de Confidentialité, consultable séparément. En
                utilisant la Plateforme, vous acceptez ce traitement.
              </p>
            </section>

            {/* Article 10 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                10. Résiliation
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Vous pouvez supprimer votre compte à tout moment depuis vos
                paramètres. Tasky se réserve le droit de suspendre ou supprimer
                tout compte en cas de violation des présentes CGU.
              </p>
            </section>

            {/* Article 11 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                11. Droit applicable et juridiction
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Les présentes CGU sont soumises au droit français. En cas de
                litige, et après tentative de résolution amiable, les tribunaux
                français seront compétents.
              </p>
            </section>

            {/* Article 12 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                12. Contact
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Pour toute question concernant ces CGU, vous pouvez nous
                contacter à :
              </p>
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
