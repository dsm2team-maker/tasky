# Cahier de spécifications fonctionnelles — Acteur CLIENT
## Tasky — Marketplace de services artisanaux (retouche, création, formation textile)

*Document à usage de l'équipe QA pour la conception des cas de test. Contenu strictement fonctionnel, extrait de l'application réelle.*

---

# 1. Présentation générale du projet

## 1.1 Contexte métier
Tasky est une marketplace mettant en relation des **clients** ayant un besoin (retouche de vêtement, création sur-mesure, formation couture...) avec des **prestataires** artisans (couturiers, retoucheurs...) capables d'y répondre. Le client publie une demande décrivant son besoin, reçoit des devis de prestataires intéressés, en sélectionne un, suit la réalisation de la prestation (avec, selon le cas, une étape de vérification de l'objet avant travaux), paie en ligne, valide la prestation terminée puis laisse un avis.

## 1.2 Objectif du document
Décrire de façon exhaustive et testable toutes les fonctionnalités accessibles à l'acteur **Client**, afin de permettre à l'équipe QA de concevoir des tests fonctionnels, négatifs, aux limites, de régression et exploratoires.

## 1.3 Utilisateurs concernés
Toute personne physique inscrite avec le rôle **CLIENT** sur la plateforme Tasky. Un même individu ne peut être que Client ou Prestataire pour un compte donné (un compte a un rôle unique et fixe ; il n'existe pas de bascule ou de double-rôle).

## 1.4 Périmètre fonctionnel couvert par ce document
- Inscription, connexion, gestion du compte (vérification email, mot de passe oublié, changement d'email/téléphone, suppression de compte)
- Création, consultation et suppression de demandes de service
- Consultation et gestion des devis reçus (acceptation, refus)
- Suivi du cycle de vie de la prestation : validation de l'état des lieux (le cas échéant), paiement, suivi d'exécution, validation ou contestation de la prestation terminée
- Messagerie avec le prestataire dans le cadre d'une prestation
- Signalement d'un litige auprès de l'équipe Tasky
- Dépôt d'un avis (note + commentaire) après une prestation terminée
- Gestion du profil personnel (informations de base)

## 1.5 Fonctionnalités hors périmètre de ce document
- Tout ce qui relève exclusivement du rôle Prestataire (gestion de compétences, matching, point de dépôt, IBAN, etc.) — voir le cahier de spécifications dédié « Prestataire »
- Tout ce qui relève exclusivement du rôle Administrateur (dashboard, gestion des utilisateurs, résolution des signalements, etc.) — voir le cahier de spécifications dédié « Admin »
- Les aspects techniques d'implémentation (infrastructure, sécurité applicative détaillée, choix technologiques) — ce document est volontairement fonctionnel et ne formule aucune recommandation technique

---

# 2. Acteurs du système

| Acteur | Rôle | Actions possibles (résumé) | Droits et restrictions |
|---|---|---|---|
| **Visiteur** (non connecté) | Découvrir la plateforme | Consulter les pages publiques, s'inscrire, se connecter, initier une récupération de compte | Aucun accès aux données personnelles ou aux fonctionnalités métier |
| **Client** | Émetteur d'une demande de service | Créer/consulter/supprimer une demande, consulter et traiter les devis reçus, valider un état des lieux, payer, suivre et valider une prestation, contester, signaler, envoyer des messages, laisser un avis, gérer son propre profil | Ne voit et n'agit que sur ses propres demandes/prestations. Aucun accès aux données d'un autre client ni aux fonctions d'administration |
| **Prestataire** | Répondant à une demande de service | (hors périmètre détaillé de ce document — voir cahier dédié) | N/A ici |
| **Administrateur** | Supervision de la plateforme | (hors périmètre détaillé de ce document — voir cahier dédié) | N/A ici |

---

# 3. Catalogue des fonctionnalités

## 3.1 Inscription (Client)

**Objectif métier** : permettre à un visiteur de créer un compte Client afin de pouvoir publier des demandes.

**Acteur concerné** : Visiteur → devient Client.

**Préconditions** : n'être connecté à aucun compte.

**Déclencheur** : soumission du formulaire d'inscription client.

**Workflow nominal détaillé** :
1. Le visiteur saisit : email, mot de passe, prénom, nom, ville, téléphone.
2. Le système vérifie le format de l'email.
3. Le système vérifie qu'aucun compte n'existe déjà avec cet email.
4. Le système vérifie qu'aucun compte n'existe déjà avec ce numéro de téléphone (si fourni).
5. Le mot de passe est chiffré (haché) avant stockage.
6. Le compte Utilisateur et le profil Client associé sont créés simultanément.
7. Un jeton de session (connexion) et un jeton de renouvellement sont générés ; le visiteur est immédiatement connecté.
8. Un email de vérification est envoyé à l'adresse fournie (valable 24 heures).
9. Confirmation de création de compte affichée au client.

**Règles de gestion associées** :
- **RG-CLI-001** : Le mot de passe doit contenir au moins 8 caractères (règle stricte affichée à l'utilisateur : 8 à 12 caractères avec au moins une majuscule, une minuscule, un chiffre et un caractère spécial).
- **RG-CLI-002** : Le prénom et le nom doivent contenir au moins 2 caractères chacun.
- **RG-CLI-003** : La ville est obligatoire (au moins 2 caractères).
- **RG-CLI-004** : Le formulaire impose un numéro de téléphone (obligatoire à la saisie côté interface).
- **RG-CLI-005** : Un email ne peut être associé qu'à un seul compte sur toute la plateforme (tous rôles confondus).
- **RG-CLI-006** : Un numéro de téléphone ne peut être associé qu'à un seul compte sur toute la plateforme.
- **RG-CLI-007** : Le lien de vérification d'email envoyé à l'inscription est valable 24 heures.

**Cas alternatifs** :
- Vérification en temps réel de la disponibilité de l'email et du téléphone pendant la saisie (avant même la soumission du formulaire), avec message d'indisponibilité immédiat.

**Cas d'erreur** :
- Email au format invalide → message d'erreur de validation, formulaire non soumis.
- Email déjà utilisé → « Un compte existe déjà avec cet email. »
- Téléphone déjà utilisé → « Un compte existe déjà avec ce numéro de téléphone. »
- Mot de passe trop court → « Mot de passe trop court (min 8 caractères) » (ou message de validation renforcée côté interface si complexité insuffisante).
- Prénom/nom trop court → « Prénom trop court » / « Nom trop court ».
- Ville manquante → « Ville requise ».

**Données manipulées** :
| Champ | Obligatoire | Format / contrainte |
|---|---|---|
| email | Oui | Format email valide, unique sur la plateforme |
| mot de passe | Oui | Min. 8 caractères (règle renforcée affichée : 8-12, majuscule/minuscule/chiffre/spécial) |
| prénom | Oui | Min. 2 caractères |
| nom | Oui | Min. 2 caractères |
| ville | Oui | Min. 2 caractères |
| téléphone | Oui (interface) | Unique sur la plateforme |

---

## 3.2 Connexion

**Objectif métier** : permettre à un client déjà inscrit d'accéder à son espace personnel.

**Acteur concerné** : Client (et tout utilisateur inscrit, le mécanisme étant commun aux 3 rôles).

**Préconditions** : posséder un compte existant.

**Déclencheur** : soumission du formulaire de connexion (email + mot de passe).

**Workflow nominal détaillé** :
1. Saisie de l'email et du mot de passe.
2. Le système recherche le compte par email.
3. Le système vérifie que le compte est actif (non suspendu).
4. Le système vérifie la correspondance du mot de passe.
5. Le système vérifie que l'email a été vérifié.
6. Un jeton de session et un jeton de renouvellement sont générés.
7. Le client est redirigé vers son tableau de bord.

**Règles de gestion associées** :
- **RG-CLI-008** : L'ordre de vérification à la connexion est : compte actif → mot de passe correct → email vérifié. Un compte suspendu affichera toujours le message de suspension, même avec le bon mot de passe.
- **RG-CLI-009** : Un compte dont l'email n'a pas été vérifié ne peut pas se connecter tant que la vérification n'a pas été effectuée.

**Cas alternatifs** :
- Depuis l'écran de connexion, un lien permet d'initier une récupération de mot de passe oublié.
- Depuis l'écran de connexion, un lien permet d'initier une récupération d'email perdu (voir §3.6).

**Cas d'erreur** :
- Email inconnu → « Aucun compte trouvé avec cet email. »
- Mot de passe incorrect → « Mot de passe incorrect. »
- Compte désactivé/suspendu → « Votre compte a été désactivé. Contactez le support. »
- Email non vérifié → « Veuillez vérifier votre email avant de vous connecter. » (avec proposition de renvoyer l'email de vérification)

**Données manipulées** : email (requis, format email), mot de passe (requis).

---

## 3.3 Vérification de l'email

**Objectif métier** : confirmer que l'adresse email fournie appartient bien à l'utilisateur, condition requise pour se connecter.

**Acteur concerné** : Client (via lien reçu par email).

**Préconditions** : posséder un compte créé, avec email non encore vérifié.

**Déclencheur** : clic sur le lien de vérification reçu par email, ou demande de renvoi du lien.

**Workflow nominal détaillé** :
1. Le client clique sur le lien de vérification reçu par email (valable 24h).
2. Le système vérifie la validité du lien.
3. L'email du compte est marqué comme vérifié.
4. Confirmation affichée, invitation à se connecter.

**Règles de gestion associées** :
- **RG-CLI-010** : Le lien de vérification expire 24 heures après son envoi.
- **RG-CLI-011** : Un lien déjà utilisé ne peut pas être réutilisé.
- **RG-CLI-012** : Un renvoi de lien de vérification est possible à tout moment tant que l'email n'est pas déjà vérifié ; aucune limite de nombre d'envois n'est appliquée.

**Cas alternatifs** :
- Renvoi du lien de vérification depuis un formulaire dédié (saisie de l'email) : par mesure de confidentialité, la réponse est toujours un message neutre de type « Si ce compte existe, un email a été envoyé », que le compte existe ou non.

**Cas d'erreur** :
- Lien invalide (jamais existé) → « Token invalide » — action bloquée.
- Lien expiré (> 24h) → « Token expiré » — l'utilisateur doit demander un renvoi.
- Lien déjà utilisé → « Token déjà utilisé ».
- Email déjà vérifié, tentative de renvoi → « Cet email est déjà vérifié. »

**Données manipulées** : jeton de vérification (transmis via l'URL du lien, non ressaisi manuellement).

---

## 3.4 Mot de passe oublié

**Objectif métier** : permettre à un client de réinitialiser son mot de passe s'il l'a oublié, à condition de conserver l'accès à sa boîte email.

**Acteur concerné** : Client (Visiteur au moment de la demande, puisqu'il n'est pas connecté).

**Préconditions** : posséder un compte existant et avoir accès à sa messagerie email.

**Déclencheur** : soumission du formulaire « mot de passe oublié » (saisie de l'email).

**Workflow nominal détaillé** :
1. Saisie de l'adresse email.
2. Le système recherche le compte.
3. Un lien de réinitialisation est envoyé par email (valable 1 heure).
4. Le client clique sur le lien, saisit un nouveau mot de passe.
5. Le système vérifie la validité du lien et met à jour le mot de passe.
6. Confirmation, invitation à se reconnecter avec le nouveau mot de passe.

**Règles de gestion associées** :
- **RG-CLI-013** : Le lien de réinitialisation de mot de passe est valable 1 heure.
- **RG-CLI-014** : Un lien de réinitialisation déjà utilisé ne peut pas être réutilisé.
- **RG-CLI-015** : Les sessions actives du client ne sont **pas** automatiquement déconnectées après une réinitialisation de mot de passe (comportement à valider en test — les autres appareils connectés restent connectés).

**Cas alternatifs** : aucun.

**Cas d'erreur** :
- Email inconnu → message d'erreur explicite indiquant qu'aucun compte n'est associé à cette adresse (à noter : ce comportement diffère du message neutre affiché à l'écran, voir §8 Points d'attention QA).
- Lien invalide/expiré/déjà utilisé → « Token invalide » / « Token expiré » / « Token déjà utilisé ».
- Nouveau mot de passe ou jeton manquant dans la requête → « Données invalides ».

**Données manipulées** : email (étape 1) ; nouveau mot de passe + jeton de réinitialisation (étape 2, aucune contrainte de complexité vérifiée par le serveur au-delà de sa présence).

---

## 3.5 Renvoi de l'email de vérification

Voir §3.3 (fonctionnalité intégrée à la vérification email).

---

## 3.6 Récupération d'un email perdu (via code envoyé par SMS)

**Objectif métier** : permettre à un client n'ayant plus accès à sa boîte email de recouvrer l'accès à son compte, en prouvant son identité via son numéro de téléphone, afin de changer son adresse email.

**Acteur concerné** : Client (non connecté au moment de la démarche).

**Préconditions** : posséder un compte avec un numéro de téléphone renseigné.

**Déclencheur** : action « Je n'ai plus accès à mon email » depuis l'écran de connexion.

**Workflow nominal détaillé** :
1. Le client saisit l'email actuel (perdu) du compte concerné.
2. Le système vérifie l'existence du compte et la présence d'un numéro de téléphone associé.
3. Un code à 6 chiffres est envoyé (valable 10 minutes) ; le numéro de téléphone est affiché masqué (ex. « 06•• •• •• 78 ») pour confirmation visuelle.
4. Le client saisit le code reçu ainsi que la nouvelle adresse email souhaitée.
5. Le système vérifie le code et l'absence d'usage de cette nouvelle adresse par un autre compte.
6. L'email du compte est mis à jour.
7. Toutes les sessions actives du compte sont déconnectées de force.
8. Un lien de réinitialisation de mot de passe est envoyé à la nouvelle adresse email (valable 1h) pour permettre au client de définir un nouveau mot de passe et se reconnecter.

**Règles de gestion associées** :
- **RG-CLI-016** : Un délai minimal de 2 minutes doit être respecté entre deux demandes de code pour un même compte.
- **RG-CLI-017** : Le code a une durée de validité de 10 minutes.
- **RG-CLI-018** : Un maximum de 5 tentatives de saisie du code est autorisé ; au-delà, un message invite à patienter avant de réessayer (voir remarque au §8 sur la durée réellement observée).
- **RG-CLI-019** : La nouvelle adresse email ne peut pas être identique à l'adresse actuelle, ni déjà utilisée par un autre compte (double vérification, y compris juste avant la validation finale, pour couvrir une tentative simultanée).

**Cas alternatifs** : aucun.

**Cas d'erreur** :
- Email introuvable → « Aucun compte trouvé avec cette adresse email. »
- Aucun téléphone associé au compte → « Aucun numéro de téléphone associé à ce compte. Contactez le support. »
- Demande de code trop rapprochée → message d'attente avec compte à rebours en secondes.
- Nouvel email identique à l'actuel → « C'est déjà votre adresse email actuelle. »
- Nouvel email déjà utilisé → « Cette adresse est déjà associée à un compte. »
- Code expiré ou introuvable → message invitant à recommencer la demande.
- Code incorrect → message indiquant le nombre de tentatives restantes.
- Trop de tentatives incorrectes → message invitant à patienter.

**Données manipulées** : email actuel (étape 1) ; code à 6 chiffres + nouvelle adresse email (étape 2).

---

## 3.7 Changement de numéro de téléphone (compte connecté)

**Objectif métier** : permettre à un client connecté de mettre à jour son numéro de téléphone.

**Acteur concerné** : Client connecté.

**Préconditions** : être connecté.

**Déclencheur** : action « Changer mon numéro » depuis la page profil.

**Workflow nominal détaillé** :
1. Saisie du nouveau numéro de téléphone.
2. Le système vérifie le format (numéro français commençant par 06 ou 07, 10 chiffres, espaces tolérés).
3. Le système vérifie que ce numéro diffère de l'actuel et n'est pas déjà utilisé par un autre compte.
4. Un code de vérification à 6 chiffres est envoyé (valable 10 minutes).
5. Le client saisit le code reçu.
6. Le système vérifie le code (et revérifie l'unicité du numéro au moment de la validation).
7. Le numéro de téléphone est mis à jour.
8. Toutes les sessions actives sont déconnectées ; le client doit se reconnecter.
9. Une alerte de sécurité est envoyée à l'ancienne adresse email, mentionnant le nouveau numéro (masqué).

**Règles de gestion associées** :
- **RG-CLI-020** : Format attendu du numéro : commence par 06 ou 07, suivi de 8 chiffres (espaces ignorés lors de la vérification).
- **RG-CLI-021** : Délai minimal de 2 minutes entre deux demandes de code.
- **RG-CLI-022** : Code valable 10 minutes, 5 tentatives maximum.
- **RG-CLI-023** : Le changement de numéro déconnecte systématiquement toutes les sessions actives du compte, par mesure de sécurité.

**Cas alternatifs** : aucun.

**Cas d'erreur** :
- Format invalide → « Numéro invalide — format 06 ou 07 attendu. »
- Numéro identique à l'actuel → « C'est déjà votre numéro actuel. »
- Numéro déjà utilisé → « Ce numéro est déjà associé à un compte. »
- Code invalide/expiré → messages équivalents au §3.6.
- Numéro pris entre-temps par un autre compte (cas de concurrence) → « Ce numéro vient d'être pris par un autre compte. »

**Données manipulées** : nouveau numéro de téléphone (étape 1) ; code à 6 chiffres (étape 2).

---

## 3.8 Changement d'adresse email (compte connecté)

**Objectif métier** : permettre à un client connecté de mettre à jour son adresse email, en la confirmant via un code envoyé.

**Acteur concerné** : Client connecté.

**Préconditions** : être connecté.

**Déclencheur** : action « Changer mon email » depuis la page profil.

**Workflow nominal détaillé** :
1. Saisie de la nouvelle adresse email.
2. Vérification du format et de l'unicité (par rapport aux autres comptes et à l'email actuel).
3. Un code à 6 chiffres est envoyé (valable 10 minutes) — canal d'envoi : boîte mail actuelle du compte, ou nouvelle adresse selon configuration du flux.
4. Le client saisit le code reçu.
5. Vérification du code (et revérification de l'unicité au moment de la validation).
6. L'adresse email du compte est mise à jour.
7. Toutes les sessions actives sont déconnectées ; reconnexion nécessaire.
8. Une alerte de sécurité est envoyée à l'ancienne adresse email pour l'informer du changement.

**Règles de gestion associées** :
- **RG-CLI-024** : Délai minimal de 2 minutes entre deux demandes de code.
- **RG-CLI-025** : Code valable 10 minutes, 5 tentatives maximum.
- **RG-CLI-026** : Le changement d'email déconnecte systématiquement toutes les sessions actives du compte.

**Cas alternatifs** : aucun.

**Cas d'erreur** :
- Format d'email invalide → « Email invalide. »
- Email identique à l'actuel → refus, message dédié.
- Email déjà utilisé par un autre compte → « Cette adresse est déjà associée à un compte. »
- Code invalide/expiré/tentatives épuisées → messages équivalents au §3.6-3.7.
- Email pris entre-temps par un autre compte → « Cette adresse vient d'être prise par un autre compte. »

**Données manipulées** : nouvel email (étape 1) ; code à 6 chiffres (étape 2).

---

## 3.9 Suppression du compte (anonymisation)

**Objectif métier** : permettre à un client d'exercer son droit à la suppression de ses données personnelles.

**Acteur concerné** : Client connecté.

**Préconditions** : être connecté ; ne pas avoir de prestation active en cours.

**Déclencheur** : action « Supprimer mon compte » depuis la page profil.

**Workflow nominal détaillé** :
1. Le client demande la suppression de son compte.
2. Le système vérifie que le compte n'est pas déjà désactivé.
3. Le système vérifie l'absence de prestations en cours (statut autre que Terminée ou Annulée) liées au client.
4. Un code à 6 chiffres est envoyé par email (valable 10 minutes).
5. Le client saisit le code pour confirmer définitivement la suppression.
6. Le compte est anonymisé : nom, prénom, téléphone, avatar, ville sont remplacés par des valeurs génériques ; l'email est remplacé par une adresse technique interne ; le compte est désactivé.
7. Toutes les sessions actives sont déconnectées.

**Règles de gestion associées** :
- **RG-CLI-027** : La suppression est bloquée tant qu'il existe au moins une prestation en cours (statut autre que Terminée ou Annulée) liée au client.
- **RG-CLI-028** : Délai minimal de 2 minutes entre deux demandes de code ; code valable 10 minutes, 5 tentatives maximum (règles identiques aux autres flux OTP).
- **RG-CLI-029** : La suppression est une anonymisation et une désactivation du compte, non une suppression physique des données historiques (les demandes, prestations et avis passés du client restent conservés en base, mais son identité y apparaît anonymisée).
- **RG-CLI-030** : Aucune vérification de mot de passe supplémentaire n'est requise à l'étape de confirmation — le code suffit (le client étant déjà authentifié).

**Cas alternatifs** : aucun.

**Cas d'erreur** :
- Compte déjà désactivé → « Ce compte est déjà désactivé. »
- Prestations actives existantes → « Vous avez des prestations en cours. Finalisez-les avant de supprimer votre compte. »
- Code invalide/expiré/tentatives épuisées → messages équivalents aux autres flux OTP.

**Données manipulées** : code à 6 chiffres (confirmation).

---

## 3.10 Création d'une demande de service

**Objectif métier** : permettre au client de décrire son besoin afin de recevoir des propositions (devis) de prestataires.

**Acteur concerné** : Client connecté.

**Préconditions** : être connecté avec un profil Client.

**Déclencheur** : soumission du formulaire de création de demande.

**Workflow nominal détaillé** :
1. Le client renseigne : titre, description, type de prestation (Modification / Création / Formation), catégorie (et éventuellement sous-catégorie et interventions précises), budget indicatif (facultatif), ville, photos (facultatif), délai souhaité en jours, niveau d'urgence.
2. Le système valide chaque champ (voir règles ci-dessous).
3. Le système vérifie que la catégorie (et la sous-catégorie le cas échéant) existe bien dans le référentiel.
4. La demande est créée avec le statut « Publiée », immédiatement visible par les prestataires compatibles.

**Règles de gestion associées** :
- **RG-CLI-031** : Le titre doit contenir au moins 5 caractères.
- **RG-CLI-032** : La description doit contenir au moins 20 caractères.
- **RG-CLI-033** : Le type de prestation doit être l'une des valeurs suivantes : Modification, Création, Formation.
- **RG-CLI-034** : La catégorie est obligatoire.
- **RG-CLI-035** : Un maximum de 2 photos peut être joint à la demande.
- **RG-CLI-036** : Le budget, s'il est renseigné, doit être strictement supérieur à 0 €.
- **RG-CLI-037** : Le délai souhaité est obligatoire, exprimé en jours, compris entre 1 et 365 inclus.
- **RG-CLI-038** : Le niveau d'urgence par défaut est « Normal » (valeurs possibles : Normal, Urgent, Très urgent).

**Cas alternatifs** : aucun — la demande est toujours créée directement au statut « Publiée » sans étape de modération préalable.

**Cas d'erreur** :
- Titre trop court → « Titre trop court (min 5 caractères) »
- Description trop courte → « Description trop courte (min 20 caractères) »
- Type de prestation invalide → « Type de prestation invalide »
- Catégorie manquante → « Catégorie requise »
- Plus de 2 photos → « Maximum 2 photos »
- Budget ≤ 0 → « Le budget doit être supérieur à 0 € »
- Délai hors bornes ou manquant → « Délai requis (entre 1 et 365 jours) »
- Catégorie ou sous-catégorie inexistante dans le référentiel → demande rejetée (erreur de traitement, à tester spécifiquement — voir §8).

**Données manipulées** :
| Champ | Obligatoire | Contrainte |
|---|---|---|
| titre | Oui | Min. 5 caractères |
| description | Oui | Min. 20 caractères |
| type de prestation | Oui | Modification / Création / Formation |
| catégorie | Oui | Doit exister dans le référentiel |
| sous-catégorie | Non | Doit exister si fournie |
| interventions précises | Non | Liste d'identifiants |
| budget | Non | > 0 € si renseigné |
| ville | Non | — |
| photos | Non | Max. 2 |
| délai (jours) | Oui | Entre 1 et 365 |
| urgence | Non | Normal (défaut) / Urgent / Très urgent |

---

## 3.11 Consultation de mes demandes

**Objectif métier** : permettre au client de retrouver la liste et le détail de ses demandes passées et en cours.

**Acteur concerné** : Client connecté.

**Préconditions** : être connecté.

**Workflow nominal détaillé** :
1. Le client accède à la liste de ses demandes (toutes, à l'exception de celles qu'il a supprimées).
2. Il peut ouvrir le détail d'une demande pour consulter son statut, ses éventuels devis reçus et leurs profils prestataires associés.

**Règles de gestion associées** :
- **RG-CLI-039** : Un client ne peut consulter que ses propres demandes.

**Cas d'erreur** :
- Demande inexistante → « Demande introuvable. »
- Tentative de consultation d'une demande n'appartenant pas au client → accès refusé.

---

## 3.12 Suppression d'une demande

**Objectif métier** : permettre au client de retirer une demande qu'il ne souhaite plus voir traitée.

**Acteur concerné** : Client connecté, propriétaire de la demande.

**Préconditions** : être propriétaire de la demande ; la demande ne doit pas être dans un statut d'exécution actif.

**Workflow nominal détaillé** :
1. Le client sélectionne une demande et demande sa suppression.
2. Le système vérifie que la demande n'est pas dans un statut bloquant.
3. La demande est retirée de la liste active du client (suppression logique, la demande n'est pas physiquement effacée).

**Règles de gestion associées** :
- **RG-CLI-040** : La suppression est bloquée si la demande est dans l'un des statuts suivants : En attente d'inspection, En attente de paiement, En cours.
- **RG-CLI-041** : Une demande dans les statuts Publiée, À valider ou Terminée peut être supprimée par le client (point d'attention QA : une demande « À valider » ou « Terminée » liée à une prestation encore active côté prestataire peut donc être supprimée de la vue client — voir §8).

**Cas d'erreur** :
- Demande introuvable → « Demande introuvable. »
- Demande n'appartenant pas au client → accès refusé.
- Demande dans un statut bloquant → « Impossible — cette demande est déjà en cours. »

---

## 3.13 Consultation des devis reçus pour une demande

**Objectif métier** : permettre au client de comparer les propositions reçues des prestataires avant de faire son choix.

**Acteur concerné** : Client connecté, propriétaire de la demande.

**Workflow nominal détaillé** :
1. Le client ouvre le détail d'une demande.
2. La liste des devis reçus (montant, délai proposé, description, profil du prestataire) s'affiche.

**Règles de gestion associées** :
- **RG-CLI-042** : Seuls les devis dont le statut est « Envoyé » sont proposés à l'acceptation ou au refus ; un devis déjà traité (accepté/refusé) reste visible en historique.
- **RG-CLI-043** : Un devis est en principe valable 7 jours après son envoi par le prestataire (information affichée au client) — voir remarque au §8 sur l'absence de mécanisme d'expiration effectif.

**Cas d'erreur** : demande introuvable ou n'appartenant pas au client → accès refusé.

---

## 3.14 Acceptation d'un devis

**Objectif métier** : permettre au client de sélectionner le prestataire et le devis retenus pour réaliser sa demande.

**Acteur concerné** : Client connecté, propriétaire de la demande.

**Préconditions** : le devis doit être au statut « Envoyé » et sélectionnable.

**Déclencheur** : action « Accepter ce devis ».

**Workflow nominal détaillé** :
1. Le client sélectionne un devis à accepter.
2. Le système vérifie que le devis est bien disponible et sélectionnable.
3. Le devis ciblé passe au statut « Accepté ».
4. **Si la demande est de type Modification** : les autres devis de la même demande deviennent non sélectionnables (mais restent visibles, au statut « Envoyé ») ; la demande passe au statut « En attente d'inspection » ; une prestation est créée à ce même statut.
5. **Si la demande est de type Création ou Formation** : tous les autres devis de la demande sont automatiquement refusés ; la demande passe directement au statut « En attente de paiement » ; une prestation est créée à ce statut.
6. Un message système est ajouté à la conversation liée à la prestation, informant des prochaines étapes.

**Règles de gestion associées** :
- **RG-CLI-044** : Un devis ne peut être accepté que s'il est encore au statut « Envoyé » et « sélectionnable ».
- **RG-CLI-045** : L'acceptation d'un devis est définitive et déclenche la création de la prestation correspondante ; elle ne peut pas être annulée directement (seul un parcours de refus d'état des lieux ou d'annulation ultérieure permet un retour en arrière, voir §3.15).
- **RG-CLI-046** : Pour une demande de type Modification, les prestataires dont le devis n'a pas été retenu ne reçoivent pas de notification email immédiate lors de cette mise en non-sélectionnable (à la différence d'un refus explicite, voir §3.16).
- **RG-CLI-047** : Pour une demande de type Création/Formation, le refus automatique des autres devis n'envoie pas non plus de notification email à ces prestataires (voir §8, point d'attention).

**Cas d'erreur** :
- Devis introuvable → « Devis introuvable. »
- Devis n'appartenant pas à une demande du client → accès refusé.
- Devis déjà traité ou non disponible → « Ce devis n'est plus disponible. »
- Devis non sélectionnable → message dédié équivalent.

---

## 3.15 État des lieux (uniquement pour les demandes de type Modification)

**Objectif métier** : permettre au client de valider, avant toute intervention, que l'objet déposé correspond bien à la description initiale de sa demande, avec un éventuel ajustement du montant proposé par le prestataire.

**Acteur concerné** : Client connecté, propriétaire de la prestation.

**Préconditions** : la prestation doit être au statut « En attente d'inspection » ; le prestataire doit avoir soumis un état des lieux (ou avoir confirmé la conformité directement).

**Déclencheur** : réception de l'état des lieux soumis par le prestataire.

**Workflow nominal détaillé** :
1. Le client consulte l'état des lieux soumis par le prestataire (description, photos, montant éventuellement révisé).
2. Le client choisit de valider ou de refuser cet état des lieux.
3. **En cas de validation** : le montant final de la prestation est fixé (montant révisé s'il existe, sinon montant initial du devis) ; la prestation passe au statut « En attente de paiement » ; la demande également.
4. **En cas de refus** : la prestation passe au statut « Annulée » (définitif) ; la demande redevient « Publiée » et à nouveau disponible pour d'autres prestataires ; le devis initialement accepté passe à « Refusé » ; les autres devis de la demande redeviennent sélectionnables.
5. Un message système informe des suites données, dans les deux cas.

**Règles de gestion associées** :
- **RG-CLI-048** : L'état des lieux ne peut être traité qu'une seule fois (statut « En attente » requis au moment de la décision).
- **RG-CLI-049** : Le refus de l'état des lieux annule définitivement la prestation en cours mais permet à la demande de repartir en recherche de prestataire.
- **RG-CLI-050** : Aucun email n'est envoyé au client ni au prestataire lors du refus d'un état des lieux — seule une notification in-app (message système) est produite.

**Cas alternatifs** :
- Le prestataire peut, à la place de soumettre un état des lieux détaillé, confirmer directement la conformité de l'objet (raccourci qui saute l'étape de validation explicite du client et fait directement progresser la prestation vers « En attente de paiement »).

**Cas d'erreur** :
- Prestation introuvable ou n'appartenant pas au client → accès refusé.
- État des lieux introuvable → « État des lieux introuvable. »
- État des lieux déjà traité → « L'état des lieux a déjà été traité. »

**Données manipulées** : choix booléen (accepté / refusé).

---

## 3.16 Refus explicite d'un devis

**Objectif métier** : permettre au client d'écarter une proposition qu'il ne souhaite pas retenir, avant même d'avoir fait son choix final.

**Acteur concerné** : Client connecté, propriétaire de la demande liée au devis.

**Préconditions** : le devis doit être au statut « Envoyé ».

**Workflow nominal détaillé** :
1. Le client choisit de refuser un devis reçu.
2. Le devis passe au statut « Refusé ».
3. Un email est envoyé au prestataire concerné pour l'informer que son devis n'a pas été retenu.

**Règles de gestion associées** :
- **RG-CLI-051** : Seul un devis au statut « Envoyé » peut être refusé explicitement.

**Cas d'erreur** :
- Devis introuvable → « Devis introuvable. »
- Devis n'appartenant pas au client → accès refusé.
- Devis déjà traité → « Ce devis n'est plus disponible. »

---

## 3.17 Paiement de la prestation

**Objectif métier** : permettre au client de régler en ligne le montant dû, ce qui déclenche le démarrage effectif de la prestation.

**Acteur concerné** : Client connecté, propriétaire de la prestation.

**Préconditions** : la prestation doit être au statut « En attente de paiement ».

**Déclencheur** : action de paiement depuis l'écran de la prestation.

**Workflow nominal détaillé** :
1. Le client initie le paiement ; le montant présenté est le montant final (révisé le cas échéant lors de l'état des lieux) ou, à défaut, le montant initial du devis accepté.
2. Le client saisit ses informations de paiement par carte bancaire via le prestataire de paiement en ligne.
3. Une fois le paiement confirmé, la prestation passe au statut « En cours ».
4. La demande passe également au statut « En cours ».
5. Un message système confirme la réception du paiement.
6. Un email de confirmation est envoyé au client et au prestataire.

**Règles de gestion associées** :
- **RG-CLI-052** : Le paiement ne peut être initié que si la prestation est au statut « En attente de paiement ».
- **RG-CLI-053** : Une commission de 15 % du montant est prélevée par la plateforme ; 85 % du montant revient au prestataire.
- **RG-CLI-054** : Une tentative de confirmation redondante d'un paiement déjà traité (prestation déjà « En cours ») est acceptée silencieusement sans nouvelle opération (protection contre le double traitement).
- **RG-CLI-055** : L'échéance de fin de prestation (date limite de réalisation) est calculée à partir du moment du paiement, en ajoutant le délai en jours initialement indiqué dans la demande.

**Cas d'erreur** :
- Prestation introuvable ou n'appartenant pas au client → accès refusé.
- Prestation non « En attente de paiement » → « Cette prestation n'est pas en attente de paiement. »
- Paiement non confirmé par le prestataire de paiement → « Paiement non confirmé. »
- Paiement non configuré côté plateforme → message d'indisponibilité temporaire du paiement.

**Données manipulées** : moyen de paiement (carte bancaire) saisi via l'interface sécurisée du prestataire de paiement — aucune donnée bancaire du client n'est stockée par Tasky lui-même.

---

## 3.18 Suivi et validation de la prestation terminée

**Objectif métier** : permettre au client de confirmer que la prestation réalisée par le prestataire est satisfaisante, ce qui clôture définitivement la prestation et libère le paiement au prestataire.

**Acteur concerné** : Client connecté, propriétaire de la prestation.

**Préconditions** : la prestation doit être au statut « À valider » (le prestataire a marqué la prestation comme terminée de son côté).

**Déclencheur** : action « Valider la prestation » ou, à défaut d'action du client, écoulement automatique du délai.

**Workflow nominal détaillé** :
1. Le client consulte la prestation marquée terminée par le prestataire.
2. Le client valide la prestation.
3. La prestation passe au statut « Terminée » ; la demande également.
4. Un message système confirme la validation, avec mention du délai de libération du paiement (1 à 2 jours ouvrés).
5. Un email de confirmation est envoyé au client et au prestataire.
6. La possibilité de laisser un avis est désormais ouverte (voir §3.20).

**Règles de gestion associées** :
- **RG-CLI-056** : Si le client ne valide ni ne conteste la prestation dans un délai de 3 jours après que le prestataire l'a marquée terminée, elle est **automatiquement validée** par le système (traitement automatisé, exécuté au minimum toutes les heures).
- **RG-CLI-057** : Une prestation auto-validée déclenche les mêmes emails de confirmation qu'une validation manuelle, avec une mention indiquant qu'il s'agit d'une validation automatique.

**Cas alternatifs** : validation automatique après 3 jours sans action du client (voir RG-CLI-056).

**Cas d'erreur** :
- Prestation introuvable ou n'appartenant pas au client → accès refusé.
- Prestation non « À valider » → « La prestation n'est pas à valider. »

---

## 3.19 Contestation de la prestation

**Objectif métier** : permettre au client, s'il estime que la prestation livrée ne correspond pas à ce qui était attendu, de signaler son désaccord et de faire rouvrir le dossier avant validation finale.

**Acteur concerné** : Client connecté, propriétaire de la prestation.

**Préconditions** : la prestation doit être au statut « À valider ».

**Déclencheur** : action « Contester » avec saisie d'un motif.

**Workflow nominal détaillé** :
1. Le client saisit un motif de contestation.
2. Le système vérifie la longueur minimale du motif.
3. La prestation repasse au statut « En cours » (retour en arrière).
4. La demande repasse également au statut « En cours ».
5. Un message système reprenant le motif est ajouté à la conversation.

**Règles de gestion associées** :
- **RG-CLI-058** : Le motif de contestation doit contenir au moins 10 caractères.
- **RG-CLI-059** : Après une contestation, le prestataire doit de nouveau marquer la prestation comme terminée pour qu'elle repasse au statut « À valider », ce qui relance alors un nouveau délai de 3 jours pour la validation automatique.
- **RG-CLI-060** : Aucun email n'est envoyé automatiquement lors d'une contestation (seule une notification in-app est produite).

**Cas alternatifs** : le client peut, en alternative à la contestation, déposer un signalement (voir §3.21) pour porter le litige à la connaissance de l'équipe Tasky.

**Cas d'erreur** :
- Motif trop court → « Le motif doit faire au moins 10 caractères. »
- Prestation non « À valider » → « La prestation n'est pas à valider. »

**Données manipulées** : motif de contestation (obligatoire, min. 10 caractères).

---

## 3.20 Dépôt d'un avis (note et commentaire)

**Objectif métier** : permettre au client d'évaluer la prestation reçue, contribuant à la réputation publique du prestataire.

**Acteur concerné** : Client connecté, propriétaire de la prestation.

**Préconditions** : la prestation doit être au statut « Terminée » ; aucun avis n'a encore été déposé pour cette prestation.

**Déclencheur** : action « Laisser un avis ».

**Workflow nominal détaillé** :
1. Le client attribue une note (1 à 5) et rédige, facultativement, un commentaire.
2. Le système vérifie qu'aucun avis n'existe déjà pour cette prestation.
3. L'avis est enregistré.
4. La note moyenne et le nombre d'avis du prestataire sont recalculés sur l'ensemble de son historique.

**Règles de gestion associées** :
- **RG-CLI-061** : La note doit être un entier compris entre 1 et 5 inclus.
- **RG-CLI-062** : Un seul avis est autorisé par prestation.
- **RG-CLI-063** : Le commentaire est facultatif.
- **RG-CLI-064** : La note moyenne affichée sur le profil du prestataire est arrondie au dixième.

**Cas d'erreur** :
- Prestation non « Terminée » → « La prestation n'est pas encore terminée. »
- Avis déjà existant pour cette prestation → « Un avis existe déjà pour cette prestation. »
- Note hors bornes (< 1 ou > 5) → « La note doit être entre 1 et 5. »

**Données manipulées** :
| Champ | Obligatoire | Contrainte |
|---|---|---|
| note | Oui | Entier entre 1 et 5 |
| commentaire | Non | Texte libre |

---

## 3.21 Signalement d'un litige

**Objectif métier** : permettre au client de porter à la connaissance de l'équipe Tasky un problème rencontré sur une demande en cours de traitement, en dehors du parcours normal de contestation de la prestation.

**Acteur concerné** : Client connecté, propriétaire de la demande.

**Préconditions** : la demande doit être dans l'un des statuts actifs (En cours, À valider, En attente de paiement, En attente d'inspection) ; aucun signalement actif n'existe déjà pour cette demande.

**Déclencheur** : action « Signaler un problème ».

**Workflow nominal détaillé** :
1. Le client rédige un message décrivant le problème rencontré.
2. Le système vérifie la longueur minimale du message et le statut de la demande.
3. Le système vérifie l'absence de signalement déjà actif sur cette demande.
4. Le signalement est créé au statut « En attente », en attente de traitement par un administrateur.

**Règles de gestion associées** :
- **RG-CLI-065** : Le message du signalement doit contenir au moins 10 caractères.
- **RG-CLI-066** : Un signalement ne peut être créé que si la demande est dans l'un des statuts suivants : En cours, À valider, En attente de paiement, En attente d'inspection (impossible sur une demande Publiée, Terminée ou Supprimée).
- **RG-CLI-067** : Un seul signalement actif (non encore résolu) est autorisé par demande à la fois.

**Cas d'erreur** :
- Message trop court → « Le message doit faire au moins 10 caractères. »
- Statut de demande non éligible → « Impossible de signaler une demande dans ce statut. »
- Signalement déjà en cours pour cette demande → « Un signalement est déjà en cours pour cette demande. »

**Données manipulées** : message de signalement (obligatoire, min. 10 caractères).

---

## 3.22 Messagerie liée à une prestation

**Objectif métier** : permettre au client d'échanger des messages avec le prestataire dans le cadre d'une prestation, en complément des étapes formalisées du workflow.

**Acteur concerné** : Client connecté, propriétaire de la prestation.

**Préconditions** : la prestation doit exister et être liée au client.

**Workflow nominal détaillé** :
1. Le client consulte la conversation associée à une prestation (messages échangés + messages système automatiques).
2. Le client rédige et envoie un message.
3. Le système filtre le contenu à la recherche de coordonnées personnelles (adresse email, numéro de téléphone).
4. Le message est publié dans la conversation ; les messages non lus de l'autre partie sont marqués comme lus dès l'ouverture de la conversation par le client.

**Règles de gestion associées** :
- **RG-CLI-068** : Un message ne peut pas être vide.
- **RG-CLI-069** : Un message est limité à 1000 caractères (voir remarque au §8 : le message d'erreur affiché mentionne à tort une limite de 2000 caractères).
- **RG-CLI-070** : Tout message contenant une adresse email ou un numéro de téléphone détecté est refusé, afin d'empêcher les échanges de coordonnées personnelles en dehors de la messagerie encadrée par Tasky.
- **RG-CLI-071** : Seuls le client propriétaire de la demande et le prestataire assigné à la prestation peuvent accéder à la conversation.
- **RG-CLI-072** : Les messages système (automatiques, ex. « Paiement reçu ») sont marqués comme lus dès leur création et ne comptent jamais comme messages non lus.

**Cas d'erreur** :
- Message vide → « Le message ne peut pas être vide. »
- Message trop long (> 1000 caractères) → message d'erreur (voir §8 sur l'incohérence du texte affiché).
- Coordonnées personnelles détectées → « Les coordonnées personnelles ne sont pas autorisées dans les messages. »
- Prestation introuvable ou accès non autorisé → accès refusé.

**Données manipulées** : contenu du message (texte libre, 1 à 1000 caractères, sans coordonnées personnelles détectées).

---

## 3.23 Gestion du profil personnel

**Objectif métier** : permettre au client de tenir à jour ses informations personnelles de base.

**Acteur concerné** : Client connecté.

**Workflow nominal détaillé** :
1. Le client consulte son profil (informations personnelles).
2. Le client modifie les champs souhaités (prénom, nom, ville, avatar, etc., hors email/téléphone qui suivent leurs propres parcours dédiés — voir §3.7 et §3.8).
3. Les modifications sont enregistrées.

**Données manipulées** : prénom, nom, ville, avatar (les champs email et téléphone ne se modifient que via les parcours dédiés à confirmation par code).

---

# 4. Parcours utilisateurs (Workflows)

## 4.1 Parcours « Création de compte et première demande »
- **Acteur** : Visiteur devenant Client.
- **Préconditions** : aucune.
- **Étapes** : inscription (§3.1) → vérification de l'email (§3.3) → connexion (§3.2) → création d'une demande (§3.10) → réception et consultation de devis (§3.13) → acceptation d'un devis (§3.14).
- **Résultat attendu (nominal)** : une prestation est créée et suit son cycle de vie.
- **Données invalides à tester** : email déjà utilisé, mot de passe trop faible, titre/description trop courts sur la demande, budget négatif, délai hors bornes.
- **Erreurs à tester** : tentative de connexion avant vérification de l'email ; tentative de création de demande sans être connecté.

## 4.2 Parcours « Achat complet (demande de type Création/Formation) »
- **Acteur** : Client.
- **Préconditions** : être connecté.
- **Étapes** : création de la demande (§3.10) → réception de devis → acceptation d'un devis, type Création/Formation → passage direct en attente de paiement (§3.14) → paiement (§3.17) → suivi (En cours) → validation de la prestation terminée (§3.18) → dépôt d'un avis (§3.20).
- **Résultat attendu** : prestation Terminée avec avis déposé, sans étape d'état des lieux.
- **Données invalides/erreurs à tester** : tentative de paiement d'une prestation qui n'est pas en attente de paiement ; tentative de validation d'une prestation qui n'est pas à l'étape « À valider ».

## 4.3 Parcours « Achat avec inspection (demande de type Modification) »
- **Acteur** : Client.
- **Étapes** : création de la demande de type Modification (§3.10) → acceptation d'un devis → passage en « En attente d'inspection » (§3.14) → réception et traitement de l'état des lieux soumis par le prestataire, acceptation ou refus (§3.15) → si accepté : paiement (§3.17) → suivi → validation (§3.18) → avis (§3.20). Si refusé : prestation annulée, demande republiée automatiquement.
- **Résultat attendu (branche acceptation)** : identique au parcours §4.2 avec une étape d'inspection supplémentaire.
- **Résultat attendu (branche refus)** : la prestation est annulée, la demande redevient disponible pour d'autres prestataires sans perte de la demande initiale.
- **Erreurs à tester** : tentative de traitement d'un état des lieux déjà traité ; tentative de paiement avant traitement de l'état des lieux.

## 4.4 Parcours « Litige après livraison »
- **Acteur** : Client.
- **Préconditions** : prestation au statut « À valider ».
- **Étapes** : réception de la prestation marquée terminée → contestation avec motif (§3.19) → retour en « En cours » → nouvelle finalisation par le prestataire → nouvelle décision du client (validation ou nouvelle contestation) ; en parallèle, possibilité de déposer un signalement (§3.21) pour alerter l'équipe Tasky.
- **Résultat attendu** : soit validation finale après un ou plusieurs allers-retours, soit intervention d'un administrateur suite à un signalement.
- **Données invalides à tester** : motif de contestation trop court ; contestation sur une prestation qui n'est pas « À valider ».

## 4.5 Parcours « Récupération de compte » (mot de passe oublié / email perdu)
- **Acteur** : Visiteur (client ayant perdu l'accès).
- **Étapes (mot de passe oublié)** : demande de réinitialisation (§3.4) → réception du lien → saisie du nouveau mot de passe → reconnexion.
- **Étapes (email perdu)** : demande de récupération par téléphone (§3.6) → réception et saisie du code → saisie du nouvel email → réinitialisation du mot de passe → reconnexion.
- **Erreurs à tester** : lien/code expiré, compte inexistant, nombre de tentatives dépassé.

## 4.6 Parcours « Suppression de compte »
- **Acteur** : Client connecté.
- **Préconditions** : aucune prestation active en cours.
- **Étapes** : demande de suppression (§3.9) → réception du code → confirmation → anonymisation effective → déconnexion forcée.
- **Erreurs à tester** : tentative de suppression avec une prestation active en cours ; tentative sur un compte déjà désactivé.

---

# 5. Règles de gestion complètes

| Identifiant | Nom | Description | Conditions | Résultat attendu | Exceptions |
|---|---|---|---|---|---|
| RG-CLI-001 | Complexité mot de passe | Le mot de passe doit respecter un format minimal de sécurité | À l'inscription et à la réinitialisation | Compte créé/mot de passe modifié uniquement si conforme | Le serveur applique une règle minimale (8 caractères) plus permissive que celle affichée à l'écran |
| RG-CLI-005 | Unicité de l'email | Un email ne peut être associé qu'à un seul compte | À l'inscription, au changement d'email | Rejet si email déjà utilisé | — |
| RG-CLI-006 | Unicité du téléphone | Un téléphone ne peut être associé qu'à un seul compte | À l'inscription, au changement de téléphone | Rejet si téléphone déjà utilisé | — |
| RG-CLI-008 | Ordre des contrôles de connexion | Compte actif → mot de passe → email vérifié | À chaque tentative de connexion | Message correspondant au premier contrôle en échec | — |
| RG-CLI-016/021/024/028 | Cooldown des codes OTP | Délai minimal de 2 minutes entre deux envois de code | Récupération email, changement téléphone/email, suppression de compte | Refus avec décompte si trop rapproché | — |
| RG-CLI-017/022/025 | Durée de validité des codes OTP | Le code est valable 10 minutes | Tous les flux à code à 6 chiffres | Code refusé après expiration | — |
| RG-CLI-018 | Tentatives maximales OTP | 5 tentatives de saisie maximum | Tous les flux à code à 6 chiffres | Blocage temporaire au-delà | Le délai de blocage annoncé (30 min) ne correspond pas exactement au comportement observé (voir §8) |
| RG-CLI-023/026 | Déconnexion forcée | Le changement de téléphone ou d'email déconnecte toutes les sessions | Après validation du code | Reconnexion requise sur tous les appareils | Le changement de mot de passe, lui, ne déconnecte pas les sessions actives |
| RG-CLI-027 | Blocage suppression si prestation active | La suppression de compte est bloquée si une prestation est en cours | Statut prestation ∉ {Terminée, Annulée} | Suppression refusée | — |
| RG-CLI-029 | Suppression = anonymisation | La suppression ne retire pas physiquement les données historiques | À la confirmation de suppression | Historique conservé, identité anonymisée | — |
| RG-CLI-031/032/033/034/036/037 | Validité de la demande | Contraintes de saisie sur titre, description, type, catégorie, budget, délai | À la création de la demande | Rejet si non conforme | — |
| RG-CLI-040 | Blocage suppression de demande | Suppression impossible si statut actif d'exécution | Statut ∈ {En attente d'inspection, En attente de paiement, En cours} | Suppression refusée | Statuts Publiée/À valider/Terminée restent supprimables |
| RG-CLI-044 | Devis sélectionnable | Un devis ne peut être accepté que s'il est Envoyé et sélectionnable | À l'acceptation | Rejet sinon | — |
| RG-CLI-048 | État des lieux traité une seule fois | Un état des lieux ne peut être validé/refusé qu'une seule fois | Statut En attente requis | Rejet si déjà traité | — |
| RG-CLI-052 | Paiement conditionné au statut | Le paiement n'est possible que si la prestation est En attente de paiement | À l'initiation du paiement | Rejet sinon | — |
| RG-CLI-053 | Commission plateforme | 15 % du montant revient à Tasky, 85 % au prestataire | À chaque paiement | Répartition appliquée automatiquement | — |
| RG-CLI-056 | Auto-validation à J+3 | Une prestation « À valider » sans action du client est validée automatiquement après 3 jours | Vérifié au minimum toutes les heures | Passage automatique à Terminée | Le délai repart de zéro après chaque nouvelle contestation suivie d'une nouvelle finalisation |
| RG-CLI-058 | Motif de contestation | Le motif doit contenir au moins 10 caractères | À la contestation | Rejet sinon | — |
| RG-CLI-061/062 | Avis unique et noté | Un seul avis par prestation, note entre 1 et 5 | Prestation Terminée requise | Rejet sinon | — |
| RG-CLI-066/067 | Signalement encadré | Statuts éligibles + un seul signalement actif par demande | À la création du signalement | Rejet sinon | — |
| RG-CLI-069/070 | Messagerie encadrée | Longueur max 1000 caractères, coordonnées personnelles interdites | À chaque envoi de message | Message refusé sinon | Le message d'erreur affiché mentionne à tort 2000 caractères |

---

# 6. Matrice des droits utilisateurs

| Fonctionnalité | Visiteur | Utilisateur connecté (Client) | Administrateur |
|---|---|---|---|
| Consulter les pages publiques de la plateforme | Oui | Oui | Oui |
| S'inscrire | Oui | N/A (déjà inscrit) | N/A |
| Se connecter | Oui | N/A (déjà connecté) | Oui (même parcours) |
| Récupérer mot de passe / email perdu | Oui | Non applicable directement (parcours pour compte déconnecté) | Idem |
| Créer une demande | Non | Oui (si profil Client) | Non |
| Consulter ses propres demandes | Non | Oui | Non (l'admin consulte via son propre module, pas via ce parcours) |
| Consulter les demandes d'un autre client | Non | Non | Oui (via module Admin, hors périmètre de ce document) |
| Supprimer une de ses demandes | Non | Oui, sous conditions de statut | Non |
| Consulter les devis reçus | Non | Oui, sur ses propres demandes uniquement | Oui (vue globale via module Admin) |
| Accepter / refuser un devis | Non | Oui, sur ses propres demandes uniquement | Non |
| Traiter un état des lieux | Non | Oui, sur ses propres prestations uniquement | Non |
| Payer une prestation | Non | Oui, sur ses propres prestations uniquement | Non |
| Valider / contester une prestation | Non | Oui, sur ses propres prestations uniquement | Non |
| Déposer un avis | Non | Oui, sur ses propres prestations Terminées uniquement | Non |
| Déposer un signalement | Non | Oui, sur ses propres demandes éligibles | Non |
| Résoudre un signalement | Non | Non | Oui |
| Envoyer un message dans une prestation | Non | Oui, sur ses propres prestations uniquement | Non (les messages système sont générés automatiquement) |
| Modifier son propre profil | Non | Oui | Oui (son propre profil admin) |
| Suspendre / réactiver un compte utilisateur | Non | Non | Oui |

---

# 7. Messages applicatifs

## 7.1 Messages de succès
- « Compte client créé avec succès »
- « Si ce compte existe, un email a été envoyé. » (renvoi vérification email)
- « Email de vérification renvoyé. »
- « Téléphone mis à jour. Veuillez vous reconnecter. »
- « [Email mis à jour — reconnexion requise] » (message équivalent lors du changement d'email)
- « ✅ Paiement reçu. La prestation est maintenant en cours. » (message système)
- « 🎉 [confirmation de validation] — Le paiement sera libéré sous 1 à 2 jours ouvrés. » (message système)
- « ✅ Tasky-Infos — Prestation validée automatiquement. » (message système, cas d'auto-validation)
- « 🔔 Tasky-Infos — Votre signalement a été traité par l'équipe Tasky [...] » (message système)

## 7.2 Messages d'erreur
- « Email invalide »
- « Mot de passe trop court (min 8 caractères) »
- « Prénom trop court » / « Nom trop court » / « Ville requise »
- « Un compte existe déjà avec cet email. » / « Un compte existe déjà avec ce numéro de téléphone. »
- « Aucun compte trouvé avec cet email. »
- « Mot de passe incorrect. »
- « Votre compte a été désactivé. Contactez le support. »
- « Veuillez vérifier votre email avant de vous connecter. »
- « Token invalide » / « Token expiré » / « Token déjà utilisé »
- « Titre trop court (min 5 caractères) » / « Description trop courte (min 20 caractères) » / « Type de prestation invalide » / « Catégorie requise » / « Maximum 2 photos » / « Le budget doit être supérieur à 0 € » / « Délai requis (entre 1 et 365 jours) »
- « Impossible — cette demande est déjà en cours. »
- « Ce devis n'est plus disponible. » / « Vous avez déjà envoyé un devis pour cette demande. » *(côté prestataire, référence croisée)*
- « L'état des lieux a déjà été traité. »
- « Cette prestation n'est pas en attente de paiement. »
- « La prestation n'est pas à valider. » / « La prestation n'est pas encore terminée. »
- « Le motif doit faire au moins 10 caractères. »
- « Un avis existe déjà pour cette prestation. » / « La note doit être entre 1 et 5. »
- « Le message doit faire au moins 10 caractères. » (signalement) / « Impossible de signaler une demande dans ce statut. » / « Un signalement est déjà en cours pour cette demande. »
- « Le message ne peut pas être vide. » / « Le message est trop long (max 2000 caractères) » *(message affiché, alors que la limite réelle appliquée est 1000 — voir §8)*
- « Les coordonnées personnelles ne sont pas autorisées dans les messages. »
- « Accès refusé » (générique, tentative d'accès à une ressource n'appartenant pas au client)

## 7.3 Messages d'information / confirmation
- Compte à rebours affiché lors de l'attente d'un nouveau code OTP (ex. « Veuillez patienter X secondes »).
- Indication du nombre de tentatives restantes lors d'une saisie de code incorrecte.
- Numéro de téléphone masqué affiché lors de la récupération d'email perdu (ex. « 06•• •• •• 78 »).
- Mention du délai de libération du paiement après validation d'une prestation (1 à 2 jours ouvrés).
- Mention de la durée de validité d'un devis (7 jours) affichée au client lors de la consultation.

---

# 8. Points d'attention pour les tests QA

1. **Cohérence mot de passe front/back** : le formulaire d'inscription impose une complexité forte (8-12 caractères, majuscule/minuscule/chiffre/spécial), mais le serveur n'exige que 8 caractères minimum sans autre contrainte, y compris à la réinitialisation. Un test via appel direct à l'API (hors interface) avec un mot de passe faible (ex. « aaaaaaaa ») doit être exécuté pour vérifier le comportement réel.
2. **Fuite d'information potentielle sur « mot de passe oublié »** : contrairement au message neutre affiché à l'écran, le serveur révèle explicitement si un compte existe ou non pour cette adresse email (réponse différente en cas d'email inconnu). À tester et signaler si ce n'est pas le comportement voulu.
3. **Message « 30 minutes » après échec répété d'un code** : le message affiché après épuisement des tentatives sur un code annonce un délai de 30 minutes, alors que le blocage réel semble lié à la seule expiration du code (10 minutes) plus, éventuellement, le délai de renvoi (2 minutes). Ce point doit être testé précisément (chronométrer le délai réel avant qu'une nouvelle tentative soit acceptée) et signalé à l'équipe produit si le message ne correspond pas au comportement observé.
4. **Réinitialisation de mot de passe et sessions actives** : après une réinitialisation de mot de passe réussie, vérifier si les sessions déjà ouvertes sur d'autres appareils restent valides ou non — comportement à confirmer avec l'équipe produit (bonne pratique de sécurité attendue : invalidation).
5. **Limite réelle des messages de la messagerie** : la limite réellement appliquée sur la longueur d'un message est de 1000 caractères, alors que le message d'erreur affiché à l'utilisateur mentionne 2000 caractères. Tester l'envoi d'un message de 1500 caractères pour confirmer le rejet et l'incohérence du message affiché.
6. **Devis sans expiration effective** : bien qu'un devis affiche une validité de 7 jours au client, aucun mécanisme ne semble faire réellement passer un devis ancien à un statut expiré — un devis très ancien (30+ jours) peut potentiellement rester acceptable. À tester spécifiquement.
7. **Suppression d'une demande à un stade avancé** : une demande aux statuts « À valider » ou « Terminée » peut être supprimée par le client de sa propre liste, alors que la prestation liée peut encore être active/visible côté prestataire ou administrateur. Tester ce cas de figure pour vérifier la cohérence de l'affichage entre les différents acteurs.
8. **Absence de notification email lors de certaines étapes clés** : aucun email n'est envoyé au client ni au prestataire lors du refus d'un état des lieux, ni lors d'une contestation, ni lors de la résolution d'un signalement (seules des notifications in-app/messages système sont produites). À valider si ce comportement est intentionnel, notamment pour les cas de litige où une notification email pourrait être attendue par les utilisateurs.
9. **Rejeu d'une confirmation de paiement** : vérifier le comportement si une confirmation de paiement est envoyée deux fois pour une même prestation (doit être neutre, sans double traitement ni double email).
10. **Cas limite de création de demande avec sous-catégorie invalide** : tester la création d'une demande avec un identifiant de sous-catégorie qui n'existe pas dans le référentiel — vérifier que le message d'erreur retourné à l'utilisateur reste clair et ne s'apparente pas à une erreur technique générique.
11. **Zones à risque prioritaires pour les tests** : calcul financier (commission 15/85, montant final vs montant initial après état des lieux), authentification (ordre des contrôles à la connexion, expiration des jetons), droits d'accès (un client ne doit jamais pouvoir consulter/modifier les données d'un autre client), auto-validation à J+3 (traitement automatisé sensible au facteur temps), règles de statuts complexes (transitions de la demande et de la prestation).

---

# 9. Critères d'acceptation (Gherkin)

```gherkin
Fonctionnalité : Inscription Client

Scénario : Inscription réussie
  Étant donné un visiteur non connecté
  Quand il soumet le formulaire d'inscription avec un email non utilisé, un mot de passe valide, un prénom, un nom et une ville valides
  Alors un compte Client est créé
  Et un email de vérification est envoyé
  Et le visiteur est automatiquement connecté

Scénario : Email déjà utilisé
  Étant donné un email déjà associé à un compte existant
  Quand un visiteur tente de s'inscrire avec ce même email
  Alors l'inscription est refusée
  Et le message « Un compte existe déjà avec cet email. » est affiché


Fonctionnalité : Connexion

Scénario : Connexion avec email non vérifié
  Étant donné un compte Client dont l'email n'a pas été vérifié
  Quand le client se connecte avec ses identifiants corrects
  Alors la connexion est refusée
  Et le message « Veuillez vérifier votre email avant de vous connecter. » est affiché

Scénario : Connexion sur un compte suspendu
  Étant donné un compte Client suspendu par un administrateur
  Quand le client se connecte avec ses identifiants corrects
  Alors la connexion est refusée
  Et le message « Votre compte a été désactivé. Contactez le support. » est affiché


Fonctionnalité : Création de demande

Scénario : Création réussie
  Étant donné un client connecté avec un profil valide
  Quand il soumet une demande avec un titre d'au moins 5 caractères, une description d'au moins 20 caractères, une catégorie existante et un délai entre 1 et 365 jours
  Alors la demande est créée au statut « Publiée »

Scénario : Description trop courte
  Étant donné un client connecté
  Quand il soumet une demande avec une description de moins de 20 caractères
  Alors la création est refusée
  Et le message « Description trop courte (min 20 caractères) » est affiché


Fonctionnalité : Acceptation d'un devis

Scénario : Acceptation d'un devis pour une demande de type Création
  Étant donné une demande de type Création avec au moins deux devis au statut « Envoyé »
  Quand le client accepte l'un des devis
  Alors ce devis passe au statut « Accepté »
  Et les autres devis de la demande passent automatiquement au statut « Refusé »
  Et la demande passe au statut « En attente de paiement »
  Et une prestation est créée à ce même statut

Scénario : Acceptation d'un devis pour une demande de type Modification
  Étant donné une demande de type Modification avec au moins deux devis au statut « Envoyé »
  Quand le client accepte l'un des devis
  Alors ce devis passe au statut « Accepté »
  Et les autres devis restent au statut « Envoyé » mais deviennent non sélectionnables
  Et la demande passe au statut « En attente d'inspection »


Fonctionnalité : Traitement de l'état des lieux

Scénario : Refus de l'état des lieux
  Étant donné une prestation au statut « En attente d'inspection » avec un état des lieux soumis par le prestataire, au statut « En attente »
  Quand le client refuse cet état des lieux
  Alors la prestation passe au statut « Annulée »
  Et la demande repasse au statut « Publiée »
  Et les autres devis de la demande redeviennent sélectionnables


Fonctionnalité : Paiement

Scénario : Paiement réussi
  Étant donné une prestation au statut « En attente de paiement »
  Quand le client règle le montant dû avec succès
  Alors la prestation passe au statut « En cours »
  Et la demande passe au statut « En cours »
  Et un email de confirmation est envoyé au client et au prestataire

Scénario : Tentative de paiement sur une prestation déjà en cours
  Étant donné une prestation déjà au statut « En cours »
  Quand une confirmation de paiement est reçue une seconde fois pour cette prestation
  Alors aucune nouvelle opération n'est effectuée
  Et la réponse indique que la prestation est déjà en cours


Fonctionnalité : Validation de la prestation

Scénario : Validation manuelle par le client
  Étant donné une prestation au statut « À valider »
  Quand le client valide la prestation
  Alors la prestation passe au statut « Terminée »
  Et un email de confirmation est envoyé au client et au prestataire

Scénario : Auto-validation après 3 jours
  Étant donné une prestation au statut « À valider » depuis plus de 3 jours sans action du client
  Quand le traitement automatique périodique s'exécute
  Alors la prestation passe automatiquement au statut « Terminée »
  Et un email de confirmation, mentionnant une validation automatique, est envoyé au client et au prestataire

Scénario : Contestation avec motif trop court
  Étant donné une prestation au statut « À valider »
  Quand le client tente de contester avec un motif de moins de 10 caractères
  Alors la contestation est refusée
  Et le message « Le motif doit faire au moins 10 caractères. » est affiché


Fonctionnalité : Dépôt d'un avis

Scénario : Dépôt d'un avis après prestation terminée
  Étant donné une prestation au statut « Terminée » sans avis existant
  Quand le client dépose un avis avec une note de 4 et un commentaire
  Alors l'avis est enregistré
  Et la note moyenne du prestataire est recalculée

Scénario : Tentative de second avis sur la même prestation
  Étant donné une prestation au statut « Terminée » avec un avis déjà déposé
  Quand le client tente de déposer un second avis
  Alors le dépôt est refusé
  Et le message « Un avis existe déjà pour cette prestation. » est affiché


Fonctionnalité : Messagerie

Scénario : Message contenant un numéro de téléphone
  Étant donné une conversation liée à une prestation active
  Quand le client tente d'envoyer un message contenant un numéro de téléphone
  Alors le message est refusé
  Et le message « Les coordonnées personnelles ne sont pas autorisées dans les messages. » est affiché
```

---

# 10. Ne pas oublier

Ce document doit permettre à l'équipe QA de construire :
- **Des tests fonctionnels** couvrant chaque fonctionnalité du §3 selon son workflow nominal.
- **Des tests négatifs** couvrant chaque cas d'erreur listé (champs manquants, formats invalides, statuts incompatibles, droits d'accès violés).
- **Des tests aux limites** sur toutes les valeurs numériques et de longueur de texte (titre à exactement 5 caractères, description à exactement 20 caractères, motif à exactement 10 caractères, message à exactement 1000/1001 caractères, note à 1 et à 5, délai à 1 et à 365 jours, budget à une valeur proche de 0, code OTP à la dernière tentative autorisée et à la tentative suivante).
- **Des tests de régression** sur les parcours complets du §4, à rejouer après toute évolution du code touchant l'authentification, le cycle de vie des demandes/devis/prestations, la messagerie ou le paiement.
- **Des tests exploratoires** ciblant en priorité les points d'attention du §8, notamment les incohérences de messages, l'absence de notifications à certaines étapes, et les statuts limites (suppression d'une demande avancée, rejeu de paiement, devis sans expiration effective).

Toute anomalie découverte lors des tests correspondant aux constats du §8 doit être remontée à l'équipe produit/développement pour arbitrage (bug confirmé vs comportement intentionnel), avant d'être considérée comme un défaut bloquant.
