import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { colors } from "@/config/colors";
import { typography, spacing } from "@/config/design-tokens";

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className={`${spacing.section}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="text-center mb-12">
            <h1 className={`${typography.h1.base} ${colors.text.primary} mb-4`}>
              Mentions Légales
            </h1>
            <p className={`text-lg ${colors.text.secondary}`}>
              Informations légales concernant Tasky
            </p>
          </div>

          {/* Contenu */}
          <div className="prose prose-lg max-w-none">
            {/* Section 1 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                1. Éditeur du site
              </h2>
              <div className={`${colors.neutral.bg} p-6 rounded-lg mb-4`}>
                <p className={`${colors.text.secondary} mb-3`}>
                  <strong>Raison sociale :</strong> Tasky [Forme juridique -
                  SAS, SARL, etc.]
                </p>
                <p className={`${colors.text.secondary} mb-3`}>
                  <strong>Siège social :</strong> [Adresse complète]
                </p>
                <p className={`${colors.text.secondary} mb-3`}>
                  <strong>Capital social :</strong> [Montant] euros
                </p>
                <p className={`${colors.text.secondary} mb-3`}>
                  <strong>RCS :</strong> [Ville] [Numéro]
                </p>
                <p className={`${colors.text.secondary} mb-3`}>
                  <strong>SIRET :</strong> [Numéro SIRET]
                </p>
                <p className={`${colors.text.secondary} mb-3`}>
                  <strong>Numéro TVA intracommunautaire :</strong> [Numéro]
                </p>
                <p className={`${colors.text.secondary} mb-3`}>
                  <strong>Directeur de la publication :</strong> [Nom et Prénom]
                </p>
                <p className={`${colors.text.secondary} mb-3`}>
                  <strong>Email :</strong> contact@tasky.fr
                </p>
                <p className={`${colors.text.secondary}`}>
                  <strong>Téléphone :</strong> [Numéro de téléphone]
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                2. Hébergement du site
              </h2>
              <div className={`${colors.neutral.bg} p-6 rounded-lg mb-4`}>
                <p className={`${colors.text.secondary} mb-3`}>
                  <strong>Hébergeur :</strong> [Nom de l'hébergeur - ex: Vercel,
                  OVH, AWS]
                </p>
                <p className={`${colors.text.secondary} mb-3`}>
                  <strong>Adresse :</strong> [Adresse complète de l'hébergeur]
                </p>
                <p className={`${colors.text.secondary}`}>
                  <strong>Téléphone :</strong> [Numéro de l'hébergeur]
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                3. Propriété intellectuelle
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Le site Tasky et l'ensemble de son contenu (textes, images,
                vidéos, logos, graphismes, icônes, sons, logiciels, etc.) sont
                la propriété exclusive de Tasky ou de ses partenaires et sont
                protégés par les lois françaises et internationales relatives à
                la propriété intellectuelle.
              </p>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Toute reproduction, représentation, modification, publication,
                adaptation de tout ou partie des éléments du site, quel que soit
                le moyen ou le procédé utilisé, est interdite, sauf autorisation
                écrite préalable de Tasky.
              </p>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Toute exploitation non autorisée du site ou de l'un quelconque
                des éléments qu'il contient sera considérée comme constitutive
                d'une contrefaçon et poursuivie conformément aux dispositions
                des articles L.335-2 et suivants du Code de Propriété
                Intellectuelle.
              </p>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                4. Marques
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                « Tasky » ainsi que tous les autres signes distinctifs figurant
                sur le site sont des marques déposées. Toute reproduction totale
                ou partielle de ces marques sans autorisation préalable et
                écrite de Tasky est interdite.
              </p>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                5. Liens hypertextes
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Le site Tasky peut contenir des liens hypertextes vers d'autres
                sites. Tasky ne peut être tenu responsable du contenu de ces
                sites externes.
              </p>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                La création de liens hypertextes vers le site Tasky nécessite
                une autorisation préalable écrite. Cette autorisation peut être
                demandée par email à contact@tasky.fr.
              </p>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                6. Protection des données personnelles
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Conformément à la loi n° 78-17 du 6 janvier 1978 modifiée
                relative à l'informatique, aux fichiers et aux libertés, et au
                Règlement Général sur la Protection des Données (RGPD), vous
                disposez d'un droit d'accès, de rectification, d'effacement, de
                portabilité, de limitation et d'opposition au traitement de vos
                données personnelles.
              </p>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Pour plus d'informations sur le traitement de vos données
                personnelles, veuillez consulter notre{" "}
                <strong>Politique de Confidentialité</strong>.
              </p>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Pour exercer vos droits, vous pouvez contacter notre Délégué à
                la Protection des Données (DPO) à l'adresse : dpo@tasky.fr
              </p>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                7. Cookies
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Le site Tasky utilise des cookies pour améliorer l'expérience
                utilisateur et réaliser des statistiques de visites.
              </p>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Un cookie est un petit fichier texte déposé sur votre ordinateur
                lors de la visite d'un site web. Il permet au site de se
                souvenir de vos actions et préférences pendant une période
                donnée.
              </p>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                Vous pouvez à tout moment désactiver les cookies depuis les
                paramètres de votre navigateur. Toutefois, cela peut affecter le
                bon fonctionnement du site.
              </p>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                8. Droit applicable et juridiction compétente
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Les présentes mentions légales sont régies par le droit
                français.
              </p>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                En cas de litige et à défaut d'accord amiable, le litige sera
                porté devant les tribunaux français conformément aux règles de
                compétence en vigueur.
              </p>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                9. Crédits
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                <strong>Conception et développement :</strong> Tasky
              </p>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                <strong>Design :</strong> [Nom du designer ou de l'agence]
              </p>
              <p className={`${colors.text.secondary} leading-relaxed`}>
                <strong>Icônes et illustrations :</strong> [Sources des icônes -
                ex: Heroicons, Lucide]
              </p>
            </section>

            {/* Section 10 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                10. Médiation de la consommation
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Conformément à l'article L.612-1 du Code de la consommation,
                Tasky propose à ses utilisateurs, dans le cadre de litiges qui
                n'auraient pas pu être réglés à l'amiable, la médiation d'un
                médiateur de la consommation, dont les coordonnées sont les
                suivantes :
              </p>
              <div className={`${colors.neutral.bg} p-6 rounded-lg mb-4`}>
                <p className={`${colors.text.secondary} mb-3`}>
                  <strong>Médiateur :</strong> [Nom du médiateur ou de
                  l'organisme]
                </p>
                <p className={`${colors.text.secondary} mb-3`}>
                  <strong>Adresse :</strong> [Adresse complète]
                </p>
                <p className={`${colors.text.secondary} mb-3`}>
                  <strong>Email :</strong> [Email du médiateur]
                </p>
                <p className={`${colors.text.secondary}`}>
                  <strong>Site web :</strong> [URL du site du médiateur]
                </p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="mb-8">
              <h2
                className={`${typography.h2.base} ${colors.text.primary} mb-4`}
              >
                11. Contact
              </h2>
              <p className={`${colors.text.secondary} leading-relaxed mb-4`}>
                Pour toute question concernant les mentions légales ou le
                fonctionnement du site, vous pouvez nous contacter :
              </p>
              <div className={`${colors.neutral.bg} p-6 rounded-lg`}>
                <p className={`${colors.text.secondary} mb-3`}>
                  <strong>Par email :</strong> contact@tasky.fr
                </p>
                <p className={`${colors.text.secondary} mb-3`}>
                  <strong>Par téléphone :</strong> [Numéro de téléphone]
                </p>
                <p className={`${colors.text.secondary} mb-3`}>
                  <strong>Par courrier :</strong> [Adresse complète]
                </p>
                <p className={`${colors.text.secondary}`}>
                  <strong>Horaires :</strong> Du lundi au vendredi, de 9h à 18h
                </p>
              </div>
            </section>

            {/* Dernière mise à jour */}
            <section className="mb-8">
              <div
                className={`${colors.info.bg} border-l-4 ${colors.info.border} p-6 rounded`}
              >
                <p className={`${colors.text.secondary} text-sm`}>
                  <strong>Dernière mise à jour :</strong> 4 mars 2026
                </p>
                <p className={`${colors.text.secondary} text-sm mt-2`}>
                  Ces mentions légales peuvent être modifiées à tout moment.
                  Nous vous invitons à les consulter régulièrement.
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
