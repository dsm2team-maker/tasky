# Cahier de spécifications fonctionnelles — Acteur ADMINISTRATEUR
## Tasky — Marketplace de services artisanaux (retouche, création, formation textile)

*Document à usage de l'équipe QA pour la conception des cas de test. Contenu strictement fonctionnel, extrait de l'application réelle.*

---

# 1. Présentation générale du projet

## 1.1 Contexte métier
L'Administrateur supervise l'ensemble de la plateforme Tasky : il suit l'activité globale (utilisateurs, prestations, paiements), intervient en cas de litige signalé par un client, et dispose d'un pouvoir de suspension/réactivation des comptes utilisateurs. Il ne participe pas directement au cycle métier (il ne crée pas de demande, n'envoie pas de devis), son rôle est un rôle de supervision et de modération.

## 1.2 Objectif du document
Décrire de façon exhaustive et testable toutes les fonctionnalités accessibles à l'acteur **Administrateur**, afin de permettre à l'équipe QA de concevoir des tests fonctionnels, négatifs, aux limites, de régression et exploratoires.

## 1.3 Utilisateurs concernés
Tout compte disposant du rôle **ADMIN**. Il n'existe pas de parcours d'inscription public pour ce rôle : un compte Administrateur est créé exclusivement par une procédure technique interne réservée à l'équipe Tasky (hors périmètre applicatif standard). Ce document ne couvre donc pas de fonctionnalité d'inscription.

## 1.4 Périmètre fonctionnel couvert par ce document
- Connexion et gestion du compte administrateur (mêmes mécanismes génériques que Client/Prestataire pour la connexion, hors inscription)
- Tableau de bord (indicateurs clés de l'activité de la plateforme)
- Gestion des utilisateurs : consultation, recherche, suspension, réactivation
- Consultation des prestations (liste et détail complet, toutes parties confondues)
- Gestion des signalements : consultation et résolution
- Consultation des paiements
- Déclenchement manuel du traitement d'auto-validation des prestations

## 1.5 Fonctionnalités hors périmètre de ce document
- Tout ce qui relève exclusivement du rôle Client — voir le cahier « Client »
- Tout ce qui relève exclusivement du rôle Prestataire — voir le cahier « Prestataire »
- La création d'un compte Administrateur (procédure technique interne, non exposée par l'application)
- Les aspects techniques d'implémentation — ce document est volontairement fonctionnel
- **Fonctionnalités explicitement absentes de l'application et donc hors périmètre** : il n'existe aucune gestion du catalogue de catégories/sous-catégories/interventions depuis l'interface d'administration (le catalogue est fixe, chargé une fois au démarrage de la plateforme) ; il n'existe aucune fonctionnalité de changement de rôle d'un utilisateur par un administrateur ; il n'existe aucune fonctionnalité de suppression de compte à l'initiative d'un administrateur (seule l'auto-suppression par l'utilisateur lui-même existe, voir cahiers « Client »/« Prestataire » §3.9).

---

# 2. Acteurs du système

| Acteur | Rôle | Actions possibles (résumé) | Droits et restrictions |
|---|---|---|---|
| **Visiteur** (non connecté) | Découvrir la plateforme | Consulter les pages publiques, se connecter | Aucun accès aux fonctionnalités d'administration |
| **Client** | Émetteur d'une demande de service | (hors périmètre détaillé de ce document — voir cahier dédié) | N/A ici |
| **Prestataire** | Répondant à une demande de service | (hors périmètre détaillé de ce document — voir cahier dédié) | N/A ici |
| **Administrateur** | Supervision et modération de la plateforme | Consulter le tableau de bord, gérer les utilisateurs (suspendre/réactiver), consulter toutes les prestations et leur détail complet, résoudre les signalements, consulter tous les paiements, déclencher manuellement l'auto-validation | Accès à l'ensemble des données de la plateforme, tous utilisateurs confondus. Ne peut pas modifier le contenu métier des demandes/devis/prestations (pas d'édition directe), ne peut pas changer le rôle d'un utilisateur, ne peut pas supprimer un compte |

---

# 3. Catalogue des fonctionnalités

## 3.1 Connexion (Administrateur)

**Objectif métier** : permettre à un administrateur d'accéder à l'espace de supervision.

**Acteur concerné** : Administrateur.

**Préconditions** : posséder un compte de rôle ADMIN, créé au préalable par une procédure technique interne (aucune inscription publique pour ce rôle).

**Workflow nominal détaillé** : identique au parcours de connexion générique (voir cahier « Client » §3.2) : email + mot de passe → vérifications (compte actif → mot de passe → email vérifié) → génération des jetons → redirection vers le tableau de bord d'administration.

**Règles de gestion associées** :
- **RG-ADM-001** : Le mécanisme de connexion est strictement identique pour les trois rôles (Client, Prestataire, Admin) ; seule la redirection post-connexion diffère selon le rôle du compte.
- **RG-ADM-002** : Il n'existe aucune route d'inscription publique permettant de créer un compte de rôle ADMIN ; un tel compte ne peut être créé que par une procédure technique réservée à l'équipe Tasky, en dehors de l'application elle-même.

**Cas d'erreur** : identiques au cahier « Client » §3.2 (email inconnu, mot de passe incorrect, compte désactivé, email non vérifié).

---

## 3.2 Tableau de bord — Indicateurs clés (KPIs)

**Objectif métier** : donner à l'administrateur une vision synthétique et immédiate de l'activité de la plateforme.

**Acteur concerné** : Administrateur connecté.

**Préconditions** : être connecté avec le rôle ADMIN.

**Déclencheur** : accès à la page tableau de bord.

**Workflow nominal détaillé** :
1. L'administrateur accède au tableau de bord.
2. Le système calcule et affiche, en temps réel :
   - le nombre total d'utilisateurs actifs (comptes non désactivés) ;
   - le nombre total de clients ;
   - le nombre total de prestataires ;
   - le nombre total de prestations (tous statuts confondus) ;
   - le nombre de prestations actives (en attente d'inspection, en attente de paiement, en cours, ou à valider) ;
   - le nombre de prestations terminées ;
   - le nombre de signalements ouverts (non encore résolus) ;
   - le chiffre d'affaires total généré (somme des montants des prestations ayant fait l'objet d'un paiement effectif) ;
   - la commission totale perçue par la plateforme sur ce chiffre d'affaires.

**Règles de gestion associées** :
- **RG-ADM-003** : Le nombre total d'utilisateurs ne comptabilise que les comptes actifs (les comptes suspendus ou anonymisés/auto-supprimés ne sont pas comptés dans ce total).
- **RG-ADM-004** : Les prestations actives regroupent les statuts suivants : En attente d'inspection, En attente de paiement, En cours, À valider.
- **RG-ADM-005** : Le chiffre d'affaires total est calculé en sommant, pour chaque prestation ayant un paiement Stripe associé, le montant final si celui-ci existe (montant révisé lors d'un état des lieux), sinon le montant initial du devis accepté.
- **RG-ADM-006** : La commission totale est systématiquement calculée comme 15 % du chiffre d'affaires total, de façon cohérente avec le taux réellement appliqué à chaque paiement individuel (voir cahier « Client » RG-CLI-053).
- **RG-ADM-007** : Les indicateurs sont recalculés à chaque chargement de la page (pas de valeur mise en cache affichée à l'administrateur).

**Cas d'erreur** : accès à la page sans le rôle ADMIN → accès refusé (403, « Accès réservé aux administrateurs »).

**Données manipulées** : aucune saisie, page de consultation uniquement.

---

## 3.3 Gestion des utilisateurs — Liste et recherche

**Objectif métier** : permettre à l'administrateur de retrouver un utilisateur (client ou prestataire) et de consulter ses informations essentielles.

**Acteur concerné** : Administrateur connecté.

**Workflow nominal détaillé** :
1. L'administrateur accède à la liste des utilisateurs, paginée (20 utilisateurs par page), triée du plus récent au plus ancien.
2. L'administrateur peut effectuer une recherche libre sur l'email, le prénom ou le nom (recherche insensible à la casse).
3. Pour chaque utilisateur, la liste affiche : identité, rôle, statut (actif/suspendu), statut de vérification d'email, date de création, et, selon le rôle : nombre de demandes (client) ou nombre de prestations et note (prestataire).

**Règles de gestion associées** :
- **RG-ADM-008** : La pagination est fixée à 20 utilisateurs par page.
- **RG-ADM-009** : La recherche s'applique simultanément sur l'email, le prénom et le nom, avec une logique « OU » (un utilisateur correspondant sur au moins un des trois champs est retourné).
- **RG-ADM-010** : Un compte anonymisé (auto-suppression par son titulaire, voir cahiers « Client »/« Prestataire » §3.9) reste visible dans cette liste, mais avec des informations d'identité anonymisées (nom générique, email technique) — aucune action de gestion (suspension/réactivation) n'a de sens fonctionnel sur ce type de compte, celui-ci étant déjà désactivé.

**Cas d'erreur** : accès sans le rôle ADMIN → accès refusé.

**Données manipulées** : terme de recherche libre (facultatif), numéro de page.

---

## 3.4 Suspension d'un compte utilisateur

**Objectif métier** : permettre à l'administrateur de bloquer l'accès d'un utilisateur à la plateforme, par exemple en cas de comportement problématique signalé.

**Acteur concerné** : Administrateur connecté.

**Préconditions** : l'utilisateur ciblé doit exister.

**Déclencheur** : action « Suspendre » sur la fiche d'un utilisateur.

**Workflow nominal détaillé** :
1. L'administrateur sélectionne un utilisateur actif dans la liste.
2. Il déclenche l'action de suspension.
3. Le compte de l'utilisateur est marqué comme inactif.
4. L'utilisateur ne peut plus se connecter à la plateforme tant que son compte reste suspendu (voir cahier « Client » §3.2, cas d'erreur « compte désactivé »).

**Règles de gestion associées** :
- **RG-ADM-011** : La suspension est une simple bascule du statut « actif » à « inactif » ; elle n'entraîne aucune notification automatique (ni email, ni message in-app) à l'utilisateur concerné.
- **RG-ADM-012** : Aucune restriction technique n'empêche un administrateur de suspendre un autre compte administrateur via un appel direct — seule l'interface utilisateur masque ce bouton lorsque la cible est elle-même un compte ADMIN (voir point d'attention QA au §8).
- **RG-ADM-013** : La suspension d'un compte n'affecte pas les demandes, devis ou prestations déjà existants de cet utilisateur (ils restent visibles et ne changent pas de statut automatiquement).

**Cas d'erreur** : utilisateur inexistant → « Utilisateur introuvable. » ; accès sans le rôle ADMIN → accès refusé.

---

## 3.5 Réactivation d'un compte utilisateur

**Objectif métier** : permettre à l'administrateur de restaurer l'accès d'un utilisateur préalablement suspendu.

**Acteur concerné** : Administrateur connecté.

**Préconditions** : l'utilisateur ciblé doit exister et être actuellement suspendu.

**Workflow nominal détaillé** :
1. L'administrateur sélectionne un utilisateur suspendu.
2. Il déclenche l'action de réactivation.
3. Le compte repasse au statut « actif » ; l'utilisateur peut de nouveau se connecter.

**Règles de gestion associées** :
- **RG-ADM-014** : La réactivation est une simple bascule inverse de la suspension ; aucune notification automatique n'est envoyée à l'utilisateur.
- **RG-ADM-015** : La réactivation d'un compte anonymisé (auto-supprimé par son titulaire) est techniquement possible via ce mécanisme mais n'a pas de sens fonctionnel : l'identité du compte reste anonymisée, seul son accès redevient techniquement possible (voir point d'attention QA au §8).

**Cas d'erreur** : utilisateur inexistant → « Utilisateur introuvable. » ; accès sans le rôle ADMIN → accès refusé.

---

## 3.6 Consultation des prestations — Liste

**Objectif métier** : permettre à l'administrateur de superviser l'ensemble des prestations en cours et passées sur la plateforme, tous clients et prestataires confondus.

**Acteur concerné** : Administrateur connecté.

**Workflow nominal détaillé** :
1. L'administrateur accède à la liste des prestations, paginée (20 par page), triée de la plus récente à la plus ancienne.
2. Il peut filtrer la liste par statut de prestation.
3. Chaque ligne affiche : titre et référence de la demande associée, identité du client, identité du prestataire, statut de la prestation.

**Règles de gestion associées** :
- **RG-ADM-016** : La pagination est fixée à 20 prestations par page.
- **RG-ADM-017** : Le filtre par statut est facultatif ; sans filtre, toutes les prestations tous statuts confondus sont affichées.

**Cas d'erreur** : accès sans le rôle ADMIN → accès refusé.

**Données manipulées** : numéro de page, filtre de statut (facultatif).

---

## 3.7 Consultation d'une prestation — Détail complet

**Objectif métier** : permettre à l'administrateur d'examiner en détail une prestation, notamment en cas de litige ou de besoin de vérification (financier, contenu des échanges, historique des devis).

**Acteur concerné** : Administrateur connecté.

**Préconditions** : la prestation ciblée doit exister.

**Workflow nominal détaillé** :
1. L'administrateur ouvre le détail d'une prestation depuis la liste.
2. Le système affiche l'ensemble des informations liées : détail de la demande d'origine (catégorie, client), historique de tous les devis reçus sur cette demande (avec noms des prestataires ayant proposé), informations complètes du prestataire assigné (y compris ses coordonnées bancaires, déchiffrées pour affichage), état des lieux le cas échéant, historique complet des messages échangés (dans l'ordre chronologique), avis déposé le cas échéant.

**Règles de gestion associées** :
- **RG-ADM-018** : Les coordonnées bancaires du prestataire (IBAN, BIC, nom de la banque), stockées chiffrées en base de données, sont déchiffrées avant d'être affichées à l'administrateur dans cet écran.
- **RG-ADM-019** : Les messages sont affichés dans leur ordre chronologique de création (du plus ancien au plus récent), y compris les messages système automatiques.
- **RG-ADM-020** : Si la prestation demandée n'existe pas, l'écran affiche un état « introuvable » sans lever d'erreur technique.

**Cas d'erreur** : prestation inexistante → affichage d'un état « introuvable » ; accès sans le rôle ADMIN → accès refusé.

---

## 3.8 Consultation et résolution des signalements

**Objectif métier** : permettre à l'administrateur de traiter les litiges remontés par les clients et d'en informer les parties concernées.

**Acteur concerné** : Administrateur connecté.

**Préconditions (pour la résolution)** : le signalement doit exister.

**Workflow nominal détaillé (consultation)** :
1. L'administrateur accède à la liste des signalements, paginée (20 par page), triée du plus récent au plus ancien, avec le titre et la référence de la demande concernée et l'identité du client à l'origine du signalement.

**Workflow nominal détaillé (résolution)** :
1. L'administrateur ouvre un signalement au statut « En attente ».
2. Il peut, facultativement, rédiger une note explicative de sa décision.
3. Il déclenche la résolution du signalement.
4. Le statut du signalement passe à « Résolu » ; si une note a été rédigée, elle est ajoutée à la suite du message d'origine du signalement (conservant ainsi l'historique complet dans un seul champ).
5. Si le signalement est rattaché à une demande elle-même liée à une prestation, un message système est ajouté à la conversation de cette prestation pour informer le client que son signalement a été traité (le texte du message diffère selon qu'une note a été rédigée ou non).

**Règles de gestion associées** :
- **RG-ADM-021** : La pagination de la liste des signalements est fixée à 20 par page.
- **RG-ADM-022** : La note de résolution est facultative ; en son absence, seul un message générique de résolution est notifié au client.
- **RG-ADM-023** : La note de résolution n'est pas stockée dans un champ dédié : elle est concaténée au message original du signalement, précédée d'un marqueur « [Admin] ».
- **RG-ADM-024** : La notification de résolution n'est envoyée que si la demande à l'origine du signalement est effectivement liée à une prestation ; si aucune prestation n'existe pour cette demande, aucune notification n'est produite (le signalement est tout de même marqué résolu).
- **RG-ADM-025** : Aucun email n'est envoyé lors de la résolution d'un signalement — uniquement une notification in-app (message système) lorsque les conditions de RG-ADM-024 sont réunies.
- **RG-ADM-026** : Un signalement déjà résolu ne peut pas être résolu une seconde fois (l'action n'est proposée que sur les signalements « En attente », voir point d'attention QA au §8 sur la vérification serveur de ce point).

**Cas d'erreur** :
- Signalement inexistant → erreur technique générique (« Erreur serveur »), le code d'erreur précis distinguant ce cas n'étant pas traduit en message utilisateur explicite côté administration (voir point d'attention QA au §8).
- Accès sans le rôle ADMIN → accès refusé.

**Données manipulées** :
| Champ | Obligatoire | Contrainte |
|---|---|---|
| note de résolution | Non | Texte libre |

---

## 3.9 Consultation des paiements

**Objectif métier** : permettre à l'administrateur de suivre l'ensemble des transactions financières effectuées sur la plateforme.

**Acteur concerné** : Administrateur connecté.

**Workflow nominal détaillé** :
1. L'administrateur accède à la liste des paiements, paginée (20 par page), triée du plus récent au plus ancien, limitée aux prestations ayant effectivement fait l'objet d'un paiement (identifiant de transaction Stripe présent).
2. Pour chaque paiement, sont affichés : titre et référence de la demande, identité du client, IBAN déchiffré et identité du prestataire.

**Règles de gestion associées** :
- **RG-ADM-027** : Seules les prestations disposant d'un identifiant de transaction Stripe (paiement au moins initié) apparaissent dans cette liste.
- **RG-ADM-028** : L'IBAN du prestataire est déchiffré avant affichage, de la même façon que dans le détail d'une prestation (voir RG-ADM-018).
- **RG-ADM-029** : La pagination est fixée à 20 paiements par page.

**Cas d'erreur** : accès sans le rôle ADMIN → accès refusé.

---

## 3.10 Déclenchement manuel de l'auto-validation

**Objectif métier** : permettre à l'administrateur de forcer, à la demande, l'exécution immédiate du traitement qui valide automatiquement les prestations arrivées à échéance, sans attendre le prochain passage du traitement automatisé périodique.

**Acteur concerné** : Administrateur connecté.

**Préconditions** : aucune (l'action peut être déclenchée à tout moment).

**Déclencheur** : action « Lancer l'auto-validation » depuis l'interface d'administration.

**Workflow nominal détaillé** :
1. L'administrateur déclenche manuellement le traitement.
2. Le système recherche toutes les prestations au statut « À valider » dont l'échéance d'auto-validation est dépassée.
3. Chacune de ces prestations est validée (passage à « Terminée », idem pour la demande liée), selon la même logique que le traitement automatique périodique (voir cahier « Client » RG-CLI-056).
4. Le nombre de prestations traitées est retourné à l'administrateur.

**Règles de gestion associées** :
- **RG-ADM-030** : Ce déclenchement manuel applique exactement la même logique métier que le traitement automatique horaire ; il ne s'agit pas d'une fonctionnalité distincte mais d'un moyen de forcer son exécution immédiate.
- **RG-ADM-031** : Si aucune prestation n'est éligible au moment du déclenchement, l'action retourne un résultat de « 0 prestation(s) traitée(s) » sans erreur.

**Cas d'erreur** : accès sans le rôle ADMIN → accès refusé.

---

# 4. Parcours utilisateurs (Workflows)

## 4.1 Parcours « Traitement d'un litige signalé »
- **Acteur** : Administrateur.
- **Préconditions** : un client a déposé un signalement sur une de ses demandes (voir cahier « Client » §3.21).
- **Étapes** : consultation de la liste des signalements (§3.8) → ouverture du signalement, consultation du détail de la prestation concernée (§3.7) pour comprendre le contexte (échanges de messages, devis, montants) → décision → résolution du signalement avec ou sans note explicative (§3.8) → notification automatique du client si une prestation est liée.
- **Résultat attendu** : le signalement passe à « Résolu », le client est informé (si une prestation est liée), le compteur de litiges ouverts du tableau de bord diminue.
- **Données invalides/erreurs à tester** : tentative de résoudre un signalement déjà résolu ; tentative de résolution d'un signalement inexistant.

## 4.2 Parcours « Modération d'un compte utilisateur »
- **Acteur** : Administrateur.
- **Étapes** : recherche d'un utilisateur par email ou nom (§3.3) → suspension du compte (§3.4) → (plus tard, le cas échéant) réactivation du compte (§3.5).
- **Résultat attendu** : l'utilisateur suspendu ne peut plus se connecter jusqu'à réactivation ; ses données historiques (demandes, prestations, avis) restent inchangées.
- **Erreurs à tester** : tentative de suspension d'un utilisateur inexistant ; vérifier le comportement (via appel direct, hors interface) d'une tentative de suspension d'un autre compte administrateur.

## 4.3 Parcours « Suivi financier »
- **Acteur** : Administrateur.
- **Étapes** : consultation du tableau de bord (§3.2) pour une vue globale du chiffre d'affaires et de la commission → consultation détaillée de la liste des paiements (§3.9) → ouverture du détail d'une prestation spécifique pour vérifier la cohérence entre montant du devis, montant final et montant réellement payé (§3.7).
- **Résultat attendu** : cohérence vérifiable entre les indicateurs agrégés du tableau de bord et le détail transaction par transaction.

## 4.4 Parcours « Rattrapage de l'auto-validation »
- **Acteur** : Administrateur.
- **Préconditions** : des prestations sont bloquées au statut « À valider » au-delà de leur échéance (par exemple suite à un incident ayant empêché le traitement automatique périodique de s'exécuter).
- **Étapes** : déclenchement manuel de l'auto-validation (§3.10) → vérification, via la liste des prestations (§3.6), que les prestations concernées sont bien passées à « Terminée ».
- **Résultat attendu** : toutes les prestations éligibles sont validées immédiatement, sans attendre le prochain cycle horaire automatique.

---

# 5. Règles de gestion complètes

| Identifiant | Nom | Description | Conditions | Résultat attendu | Exceptions |
|---|---|---|---|---|---|
| RG-ADM-002 | Absence d'inscription publique Admin | Aucune route d'inscription publique pour le rôle ADMIN | En permanence | Seule une procédure technique interne permet la création d'un compte Admin | — |
| RG-ADM-003 | Comptage des utilisateurs actifs | Seuls les comptes actifs sont comptés dans le KPI utilisateurs | Au chargement du tableau de bord | Comptes suspendus/anonymisés exclus du total | — |
| RG-ADM-005/006 | Calcul du chiffre d'affaires et de la commission | CA = somme des montants finaux (ou initiaux) des prestations payées ; commission = 15 % du CA | Au chargement du tableau de bord | Valeurs recalculées à chaque consultation | — |
| RG-ADM-008/016/021/029 | Pagination à 20 éléments | Toutes les listes d'administration (utilisateurs, prestations, signalements, paiements) sont paginées à 20 éléments par page | À chaque consultation de liste | Page suivante accessible via numéro de page | — |
| RG-ADM-011/014 | Suspension/réactivation sans notification | Ni la suspension ni la réactivation d'un compte n'envoient de notification à l'utilisateur | À chaque action | Bascule silencieuse du statut actif/inactif | — |
| RG-ADM-012 | Absence de garde-fou serveur sur l'auto-suspension entre admins | Aucun contrôle serveur n'empêche un admin de suspendre un autre compte admin | À la suspension | Action techniquement possible via appel direct | L'interface masque ce cas, mais ne constitue pas un contrôle serveur |
| RG-ADM-018/028 | Déchiffrement des données bancaires pour l'administration | L'IBAN/BIC/nom de banque sont déchiffrés avant affichage à l'administrateur | Détail de prestation, liste des paiements | Données lisibles pour l'administrateur | — |
| RG-ADM-022/023 | Note de résolution facultative et concaténée | La note de résolution d'un signalement est ajoutée au message d'origine, précédée de « [Admin] » | À la résolution d'un signalement | Historique conservé dans un seul champ | Pas de champ dédié séparé pour la note admin |
| RG-ADM-024/025 | Notification conditionnelle de résolution | Notification uniquement si une prestation est liée à la demande signalée ; jamais par email | À la résolution d'un signalement | Notification in-app conditionnelle | Aucun email envoyé dans tous les cas |
| RG-ADM-027 | Filtrage des paiements | Seules les prestations avec un identifiant Stripe apparaissent dans la liste des paiements | À la consultation de la liste des paiements | Prestations non payées exclues | — |
| RG-ADM-030/031 | Déclenchement manuel de l'auto-validation | Applique la même logique que le traitement automatique périodique, à la demande | À l'action « Lancer l'auto-validation » | Prestations éligibles validées immédiatement, 0 si aucune éligible | — |

---

# 6. Matrice des droits utilisateurs

| Fonctionnalité | Visiteur | Utilisateur connecté (Client/Prestataire) | Administrateur |
|---|---|---|---|
| Consulter les pages publiques | Oui | Oui | Oui |
| Se connecter | Oui | Oui (parcours identique) | Oui (parcours identique) |
| S'inscrire comme Administrateur | Non | Non | Non (aucune inscription publique — création par procédure technique interne uniquement) |
| Consulter le tableau de bord global | Non | Non | Oui |
| Consulter la liste de tous les utilisateurs | Non | Non | Oui |
| Rechercher un utilisateur | Non | Non | Oui |
| Suspendre / réactiver un compte utilisateur | Non | Non | Oui |
| Consulter la liste de toutes les prestations | Non | Non (seulement les siennes, via son propre espace) | Oui |
| Consulter le détail complet d'une prestation (y compris IBAN déchiffré) | Non | Non (accès partiel à ses propres prestations uniquement, IBAN jamais visible côté client/prestataire lui-même dans cette vue) | Oui |
| Consulter la liste des signalements | Non | Non | Oui |
| Résoudre un signalement | Non | Non | Oui |
| Consulter la liste des paiements | Non | Non | Oui |
| Déclencher manuellement l'auto-validation | Non | Non | Oui |
| Gérer le catalogue de catégories/sous-catégories/interventions | Non | Non | **Non — aucune fonctionnalité de ce type n'existe dans l'application** |
| Modifier le rôle d'un utilisateur | Non | Non | **Non — aucune fonctionnalité de ce type n'existe dans l'application** |
| Supprimer le compte d'un utilisateur | Non | Non (auto-suppression de son propre compte uniquement) | **Non — aucune fonctionnalité de ce type n'existe dans l'application** |

---

# 7. Messages applicatifs

## 7.1 Messages de succès
- Retour de l'action de suspension/réactivation : mise à jour silencieuse de l'affichage (badge de statut changé), sans message de confirmation textuel explicite distinct.
- « [Nombre] prestation(s) auto-validée(s). » (résultat du déclenchement manuel de l'auto-validation)
- Résolution d'un signalement : mise à jour silencieuse du statut à « Résolu » dans la liste.

## 7.2 Messages d'erreur
- « Accès réservé aux administrateurs. » (tentative d'accès à une fonctionnalité d'administration sans le rôle ADMIN)
- « Utilisateur introuvable. »
- « Erreur serveur » (cas générique, notamment pour un signalement inexistant lors d'une tentative de résolution — le code d'erreur précis n'étant pas traduit en message spécifique côté interface d'administration)

## 7.3 Messages d'information / confirmation
- « 🔔 Tasky-Infos — Votre signalement a été traité par l'équipe Tasky. Réponse de l'admin : [note] » (message système envoyé au client si une note a été rédigée)
- « 🔔 Tasky-Infos — Votre signalement a été traité et marqué comme résolu par l'équipe Tasky. » (message système envoyé au client en l'absence de note)
- Sous-titre du KPI utilisateurs indiquant la répartition clients/prestataires.
- Sous-titre du KPI chiffre d'affaires indiquant le montant de la commission (15 % du CA).

---

# 8. Points d'attention pour les tests QA

1. **Autorisation par contrôle applicatif et non par middleware de routage** : l'accès aux fonctionnalités d'administration repose sur une vérification du rôle effectuée individuellement dans chaque traitement, plutôt que sur un contrôle générique appliqué uniformément à toutes les routes d'administration. Il est donc essentiel de tester **chacune** des fonctionnalités du §3 individuellement avec un compte non-administrateur (Client et Prestataire), et pas seulement une ou deux d'entre elles par échantillonnage, afin de vérifier qu'aucune n'a été oubliée.
2. **Absence de garde-fou serveur sur la suspension d'un autre administrateur** : seule l'interface utilisateur masque le bouton de suspension lorsque la cible est un compte ADMIN ; aucune vérification équivalente ne semble exister côté serveur. Tester ce cas via un appel direct (hors interface) pour confirmer si un administrateur peut effectivement suspendre un autre compte administrateur, et si ce comportement est intentionnel.
3. **Réactivation d'un compte anonymisé** : un compte ayant fait l'objet d'une auto-suppression (anonymisation) par son titulaire peut techniquement être « réactivé » par un administrateur, ce qui redonnerait un accès de connexion à un compte dont l'identité reste anonymisée. Vérifier si ce cas de figure est intentionnel ou doit être bloqué.
4. **Messages d'erreur génériques masquant des cas métier précis** : plusieurs erreurs métier précises (par exemple, tenter de résoudre un signalement qui n'existe pas) sont actuellement renvoyées sous forme d'erreur technique générique côté interface d'administration, plutôt que sous forme de message explicite. Documenter ces cas lors des tests et vérifier avec l'équipe produit si un message plus précis est attendu.
5. **Absence de toute gestion du catalogue de services** : aucune fonctionnalité de création, modification ou suppression de catégories/sous-catégories/interventions n'existe dans l'espace d'administration. Ce n'est pas un défaut à signaler mais une limite fonctionnelle actuelle de l'application à bien faire connaître à l'équipe QA, pour éviter de rechercher une fonctionnalité qui n'existe pas.
6. **Absence de changement de rôle et de suppression de compte par un administrateur** : à ne pas rechercher comme fonctionnalités manquantes lors des tests — elles sont absentes par conception actuelle de l'application.
7. **Notification de résolution de signalement conditionnelle** : si la demande signalée n'est pas (ou plus) liée à une prestation, la résolution du signalement n'envoie strictement aucune notification au client (ni email, ni message in-app) — seul le statut change en base. Tester spécifiquement ce cas (signalement sur une demande qui n'a jamais eu de prestation associée) pour vérifier que le client n'est pas laissé sans aucune information sur l'issue de son signalement.
8. **Zones à risque prioritaires pour les tests** : droits d'accès (chaque fonctionnalité d'administration testée individuellement avec des comptes non-admin), exactitude des calculs financiers agrégés du tableau de bord (comparaison avec le détail transaction par transaction), cohérence de l'auto-validation manuelle avec le traitement automatique périodique (pas de double traitement si les deux s'exécutent presque simultanément), exposition de données sensibles (IBAN déchiffré) strictement limitée aux écrans d'administration.

---

# 9. Critères d'acceptation (Gherkin)

```gherkin
Fonctionnalité : Accès réservé à l'administration

Scénario : Accès refusé pour un compte Client
  Étant donné un utilisateur connecté avec le rôle CLIENT
  Quand il tente d'accéder à une fonctionnalité réservée à l'administration
  Alors l'accès est refusé
  Et le message « Accès réservé aux administrateurs. » est renvoyé

Scénario : Accès autorisé pour un compte Administrateur
  Étant donné un utilisateur connecté avec le rôle ADMIN
  Quand il accède au tableau de bord d'administration
  Alors les indicateurs clés de la plateforme s'affichent


Fonctionnalité : Tableau de bord

Scénario : Calcul de la commission totale
  Étant donné un chiffre d'affaires total de 1000 € sur la plateforme
  Quand l'administrateur consulte le tableau de bord
  Alors la commission totale affichée est de 150 €


Fonctionnalité : Gestion des utilisateurs

Scénario : Suspension d'un compte
  Étant donné un utilisateur actif
  Quand l'administrateur déclenche la suspension de ce compte
  Alors le compte passe au statut inactif
  Et l'utilisateur ne peut plus se connecter

Scénario : Réactivation d'un compte suspendu
  Étant donné un utilisateur suspendu
  Quand l'administrateur déclenche la réactivation de ce compte
  Alors le compte repasse au statut actif
  Et l'utilisateur peut de nouveau se connecter


Fonctionnalité : Résolution d'un signalement

Scénario : Résolution avec note, prestation liée
  Étant donné un signalement au statut « En attente », rattaché à une demande elle-même liée à une prestation
  Quand l'administrateur résout ce signalement avec une note explicative
  Alors le statut du signalement passe à « Résolu »
  Et un message système mentionnant la note est ajouté à la conversation de la prestation

Scénario : Résolution sans prestation liée
  Étant donné un signalement au statut « En attente », rattaché à une demande sans prestation associée
  Quand l'administrateur résout ce signalement
  Alors le statut du signalement passe à « Résolu »
  Et aucune notification n'est envoyée au client


Fonctionnalité : Auto-validation manuelle

Scénario : Prestations éligibles présentes
  Étant donné au moins une prestation au statut « À valider » dont l'échéance d'auto-validation est dépassée
  Quand l'administrateur déclenche manuellement l'auto-validation
  Alors cette prestation passe au statut « Terminée »
  Et le nombre de prestations traitées est retourné à l'administrateur

Scénario : Aucune prestation éligible
  Étant donné qu'aucune prestation n'est au statut « À valider » avec échéance dépassée
  Quand l'administrateur déclenche manuellement l'auto-validation
  Alors le résultat indique 0 prestation traitée
  Et aucune erreur n'est levée
```

---

# 10. Ne pas oublier

Ce document doit permettre à l'équipe QA de construire :
- **Des tests fonctionnels** couvrant chaque fonctionnalité du §3 selon son workflow nominal : tableau de bord, gestion des utilisateurs, consultation des prestations, résolution des signalements, consultation des paiements, auto-validation manuelle.
- **Des tests négatifs** couvrant systématiquement l'accès à **chacune** des fonctionnalités d'administration avec un compte Client et un compte Prestataire (voir point d'attention §8-1 : le contrôle d'accès n'étant pas centralisé, chaque fonctionnalité doit être testée individuellement).
- **Des tests aux limites** sur la pagination (exactement 20 éléments puis un 21e, page 1 vs dernière page vs page au-delà de la dernière), sur le calcul financier (montants à zéro, montants avec décimales, arrondi de la commission).
- **Des tests de régression** sur les parcours complets du §4, à rejouer après toute évolution touchant la gestion des utilisateurs, les signalements, les paiements ou l'auto-validation.
- **Des tests exploratoires** ciblant en priorité les points d'attention du §8, notamment l'absence de garde-fou serveur sur la suspension d'un autre compte administrateur, la réactivation d'un compte anonymisé, et les messages d'erreur génériques masquant des cas métier précis.

Toute anomalie découverte lors des tests correspondant aux constats du §8 doit être remontée à l'équipe produit/développement pour arbitrage (bug confirmé vs comportement intentionnel), avant d'être considérée comme un défaut bloquant.
