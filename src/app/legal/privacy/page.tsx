import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { colors } from "@/config/colors";
import { typography, spacing } from "@/config/design-tokens";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className={`${spacing.section}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h1 className={`${typography.h1.base} ${colors.text.primary} mb-4`}>
              Politique de Confidentialité
            </h1>
            <p className={`text-lg ${colors.text.secondary}`}>
              Dernière mise à jour : 4 mars 2026
            </p>
          </div>

          {/* Contenu */}
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                Introduction
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Tasky s'engage à protéger la vie privée de ses utilisateurs et à
                respecter la réglementation en vigueur concernant la protection
                des données personnelles, notamment le Règlement Général sur la
                Protection des Données (RGPD).
              </p>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Cette Politique de Confidentialité décrit comment nous
                collectons, utilisons, stockons et protégeons vos données
                personnelles lorsque vous utilisez notre plateforme.
              </p>
            </section>

            {/* Article 1 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                1. Responsable du traitement
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Le responsable du traitement des données est :
              </p>
              <div className={`${colors.neutral.bg} p-6 rounded-lg mb-4`}>
                <p className={`${colors.text.secondary} mb-2`}>
                  <strong>Tasky</strong>
                </p>
                <p className={`${colors.text.secondary} mb-2`}>
                  Adresse : [Adresse complète]
                </p>
                <p className={`${colors.text.secondary} mb-2`}>
                  Email : dpo@tasky.fr
                </p>
                <p className={`${colors.text.secondary}`}>
                  Téléphone : [Numéro de téléphone]
                </p>
              </div>
            </section>

            {/* Article 2 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                2. Données collectées
              </h2>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                2.1 Données d'identification
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className={colors.text.secondary}>Nom et prénom</li>
                <li className={colors.text.secondary}>Adresse email</li>
                <li className={colors.text.secondary}>Numéro de téléphone</li>
                <li className={colors.text.secondary}>
                  Ville de résidence (sans adresse précise)
                </li>
                <li className={colors.text.secondary}>
                  Date de naissance (pour vérifier la majorité)
                </li>
              </ul>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                2.2 Données spécifiques aux artisans
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className={colors.text.secondary}>
                  Justificatifs d'identité (carte d'identité, passeport)
                </li>
                <li className={colors.text.secondary}>
                  Informations professionnelles (SIRET le cas échéant)
                </li>
                <li className={colors.text.secondary}>
                  Compétences et catégories de services proposés
                </li>
                <li className={colors.text.secondary}>
                  Portfolio (photos de réalisations)
                </li>
              </ul>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                2.3 Données de transaction
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className={colors.text.secondary}>
                  Historique des demandes et devis
                </li>
                <li className={colors.text.secondary}>
                  Messages échangés via la plateforme
                </li>
                <li className={colors.text.secondary}>
                  Montants des transactions
                </li>
                <li className={colors.text.secondary}>Avis et notes laissés</li>
              </ul>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                2.4 Données de connexion
              </h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className={colors.text.secondary}>Adresse IP</li>
                <li className={colors.text.secondary}>Type de navigateur</li>
                <li className={colors.text.secondary}>Pages consultées</li>
                <li className={colors.text.secondary}>
                  Dates et heures de connexion
                </li>
              </ul>
            </section>

            {/* Article 3 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                3. Finalités du traitement
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Vos données personnelles sont collectées et traitées pour les
                finalités suivantes :
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className={colors.text.secondary}>
                  <strong>Gestion de votre compte :</strong> Création,
                  authentification, gestion de votre profil
                </li>
                <li className={colors.text.secondary}>
                  <strong>Mise en relation :</strong> Permettre aux clients et
                  artisans de se trouver
                </li>
                <li className={colors.text.secondary}>
                  <strong>Traitement des transactions :</strong> Gestion des
                  paiements et commissions
                </li>
                <li className={colors.text.secondary}>
                  <strong>Communication :</strong> Envoi de notifications,
                  messages système, support client
                </li>
                <li className={colors.text.secondary}>
                  <strong>Sécurité :</strong> Prévention de la fraude,
                  vérification d'identité
                </li>
                <li className={colors.text.secondary}>
                  <strong>Amélioration du service :</strong> Analyses
                  statistiques anonymisées
                </li>
                <li className={colors.text.secondary}>
                  <strong>Obligations légales :</strong> Conformité aux lois
                  fiscales et comptables
                </li>
              </ul>
            </section>

            {/* Article 4 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                4. Base légale du traitement
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Le traitement de vos données repose sur :
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className={colors.text.secondary}>
                  <strong>L'exécution du contrat :</strong> Pour fournir nos
                  services
                </li>
                <li className={colors.text.secondary}>
                  <strong>Votre consentement :</strong> Pour les communications
                  marketing (que vous pouvez retirer à tout moment)
                </li>
                <li className={colors.text.secondary}>
                  <strong>Nos intérêts légitimes :</strong> Sécurité, prévention
                  de la fraude, amélioration du service
                </li>
                <li className={colors.text.secondary}>
                  <strong>Obligations légales :</strong> Conservation des
                  données comptables, lutte contre le blanchiment
                </li>
              </ul>
            </section>

            {/* Article 5 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                5. Destinataires des données
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Vos données personnelles sont accessibles :
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className={colors.text.secondary}>
                  <strong>En interne :</strong> Personnel habilité de Tasky
                </li>
                <li className={colors.text.secondary}>
                  <strong>Aux autres utilisateurs :</strong> Informations de
                  profil public, messages échangés
                </li>
                <li className={colors.text.secondary}>
                  <strong>Prestataires techniques :</strong> Hébergement (AWS,
                  OVH), paiement (Stripe), email (SendGrid)
                </li>
                <li className={colors.text.secondary}>
                  <strong>Autorités :</strong> Sur demande légale (police,
                  justice, fisc)
                </li>
              </ul>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Nous ne vendons jamais vos données personnelles à des tiers.
              </p>
            </section>

            {/* Article 6 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                6. Durée de conservation
              </h2>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className={colors.text.secondary}>
                  <strong>Compte actif :</strong> Pendant toute la durée de
                  votre utilisation de la Plateforme
                </li>
                <li className={colors.text.secondary}>
                  <strong>Compte supprimé :</strong> 30 jours après suppression
                  (délai de rétractation)
                </li>
                <li className={colors.text.secondary}>
                  <strong>Données de transaction :</strong> 10 ans (obligations
                  comptables et fiscales)
                </li>
                <li className={colors.text.secondary}>
                  <strong>Logs de connexion :</strong> 12 mois maximum
                </li>
              </ul>
            </section>

            {/* Article 7 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                7. Vos droits
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Conformément au RGPD, vous disposez des droits suivants :
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                7.1 Droit d'accès
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Vous pouvez demander une copie de toutes les données
                personnelles que nous détenons sur vous.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                7.2 Droit de rectification
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Vous pouvez corriger vos données inexactes directement depuis
                vos paramètres de compte.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                7.3 Droit à l'effacement
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Vous pouvez demander la suppression de vos données, sauf si nous
                devons les conserver pour des raisons légales.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                7.4 Droit à la portabilité
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Vous pouvez recevoir vos données dans un format structuré et les
                transférer à un autre service.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                7.5 Droit d'opposition
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Vous pouvez vous opposer au traitement de vos données à des fins
                de marketing direct.
              </p>

              <h3
                className={`text-xl font-semibold ${colors.text.primary} mb-3 mt-6`}
              >
                7.6 Exercice de vos droits
              </h3>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Pour exercer ces droits, contactez-nous à :{" "}
                <strong>dpo@tasky.fr</strong>
              </p>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Nous répondrons dans un délai maximum d'un mois.
              </p>
            </section>

            {/* Article 8 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                8. Sécurité des données
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Nous mettons en œuvre des mesures techniques et
                organisationnelles appropriées pour protéger vos données :
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className={colors.text.secondary}>
                  Chiffrement des données sensibles (HTTPS, SSL/TLS)
                </li>
                <li className={colors.text.secondary}>
                  Mots de passe hashés et salés
                </li>
                <li className={colors.text.secondary}>
                  Accès restreint aux données personnelles
                </li>
                <li className={colors.text.secondary}>
                  Sauvegardes régulières
                </li>
                <li className={colors.text.secondary}>Audits de sécurité</li>
              </ul>
            </section>

            {/* Article 9 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                9. Cookies
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Notre site utilise des cookies pour améliorer votre expérience.
                Nous utilisons :
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li className={colors.text.secondary}>
                  <strong>Cookies essentiels :</strong> Nécessaires au
                  fonctionnement du site (connexion, panier)
                </li>
                <li className={colors.text.secondary}>
                  <strong>Cookies analytiques :</strong> Pour comprendre comment
                  vous utilisez le site (avec votre consentement)
                </li>
              </ul>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Vous pouvez gérer vos préférences de cookies dans les paramètres
                de votre navigateur.
              </p>
            </section>

            {/* Article 10 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                10. Transferts internationaux
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Vos données sont hébergées au sein de l'Union Européenne. En cas
                de transfert hors UE, nous garantissons un niveau de protection
                adéquat via des clauses contractuelles types approuvées par la
                Commission européenne.
              </p>
            </section>

            {/* Article 11 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                11. Modifications
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Nous pouvons modifier cette Politique de Confidentialité. Les
                modifications importantes vous seront notifiées par email. La
                version en vigueur est toujours disponible sur cette page.
              </p>
            </section>

            {/* Article 12 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                12. Réclamation
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Si vous estimez que vos droits ne sont pas respectés, vous
                pouvez introduire une réclamation auprès de la CNIL (Commission
                Nationale de l'Informatique et des Libertés) :
              </p>
              <div className={`${colors.neutral.bg} p-6 rounded-lg`}>
                <p className={`${colors.text.secondary} mb-2`}>
                  <strong>CNIL</strong>
                </p>
                <p className={`${colors.text.secondary} mb-2`}>
                  3 Place de Fontenoy - TSA 80715
                </p>
                <p className={`${colors.text.secondary} mb-2`}>
                  75334 PARIS CEDEX 07
                </p>
                <p className={`${colors.text.secondary}`}>www.cnil.fr</p>
              </div>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                13. Contact
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Pour toute question concernant cette politique de
                confidentialité ou l'exercice de vos droits :
              </p>
              <div className={`${colors.neutral.bg} p-6 rounded-lg`}>
                <p className={`${colors.text.secondary} mb-2`}>
                  <strong>Délégué à la Protection des Données (DPO)</strong>
                </p>
                <p className={`${colors.text.secondary} mb-2`}>
                  Email : dpo@tasky.fr
                </p>
                <p className={`${colors.text.secondary}`}>
                  Adresse : [Adresse complète de la société]
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
