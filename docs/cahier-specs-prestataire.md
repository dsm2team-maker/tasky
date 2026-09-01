# Cahier de spécifications fonctionnelles — Acteur PRESTATAIRE
## Tasky — Marketplace de services artisanaux (retouche, création, formation textile)

*Document à usage de l'équipe QA pour la conception des cas de test. Contenu strictement fonctionnel, extrait de l'application réelle.*

---

# 1. Présentation générale du projet

## 1.1 Contexte métier
Le Prestataire est l'artisan (couturier, retoucheur, formateur textile...) qui répond aux demandes publiées par les clients sur Tasky. Il complète un profil professionnel (compétences, bio, point de dépôt, coordonnées bancaires), consulte les demandes compatibles avec son profil, envoie des devis, réalise les prestations acceptées (avec, selon le type de demande, une étape d'état des lieux), échange avec le client, et reçoit le paiement (déduction faite de la commission de la plateforme) une fois la prestation validée.

## 1.2 Objectif du document
Décrire de façon exhaustive et testable toutes les fonctionnalités accessibles à l'acteur **Prestataire**, afin de permettre à l'équipe QA de concevoir des tests fonctionnels, négatifs, aux limites, de régression et exploratoires.

## 1.3 Utilisateurs concernés
Toute personne physique inscrite avec le rôle **PRESTATAIRE**. Un compte a un rôle unique et fixe (Client, Prestataire ou Administrateur) ; il n'existe pas de double-rôle ni de bascule entre rôles.

## 1.4 Périmètre fonctionnel couvert par ce document
- Inscription, connexion, gestion du compte (mêmes mécanismes de sécurité que le Client : vérification email, mot de passe oublié, changement d'email/téléphone, suppression de compte)
- Complétion et gestion du profil professionnel : bio, compétences (catégories/sous-catégories/interventions), disponibilité, point de dépôt, coordonnées bancaires
- Consultation des demandes disponibles (matching) et envoi de devis
- Gestion des devis envoyés (suivi, retrait de la vue, statistiques)
- Réalisation de la prestation acceptée : soumission de l'état des lieux (le cas échéant), suivi d'exécution, marquage de fin de prestation
- Messagerie avec le client dans le cadre d'une prestation
- Consultation de sa réputation (note, avis reçus)

## 1.5 Fonctionnalités hors périmètre de ce document
- Tout ce qui relève exclusivement du rôle Client (création de demande, paiement, dépôt d'avis, signalement) — voir le cahier « Client »
- Tout ce qui relève exclusivement du rôle Administrateur — voir le cahier « Admin »
- Les aspects techniques d'implémentation — ce document est volontairement fonctionnel

---

# 2. Acteurs du système

| Acteur | Rôle | Actions possibles (résumé) | Droits et restrictions |
|---|---|---|---|
| **Visiteur** (non connecté) | Découvrir la plateforme | Consulter les pages publiques, s'inscrire comme prestataire, se connecter, initier une récupération de compte | Aucun accès aux données personnelles ou aux fonctionnalités métier |
| **Prestataire** | Répondant à une demande de service | Compléter son profil professionnel, consulter les demandes compatibles, envoyer des devis, réaliser les prestations acceptées, échanger avec le client, gérer son compte | Ne voit et n'agit que sur ses propres devis/prestations. Aucun accès aux données d'un autre prestataire ni aux fonctions d'administration |
| **Client** | Émetteur d'une demande de service | (hors périmètre détaillé de ce document — voir cahier dédié) | N/A ici |
| **Administrateur** | Supervision de la plateforme | (hors périmètre détaillé de ce document — voir cahier dédié) | N/A ici |

---

# 3. Catalogue des fonctionnalités

## 3.1 Inscription (Prestataire)

**Objectif métier** : permettre à un artisan de créer un compte Prestataire afin de pouvoir répondre aux demandes des clients.

**Acteur concerné** : Visiteur → devient Prestataire.

**Préconditions** : n'être connecté à aucun compte.

**Déclencheur** : soumission du formulaire d'inscription prestataire.

**Workflow nominal détaillé** :
1. Le visiteur saisit : email, mot de passe, prénom, nom, ville, téléphone.
2. Le formulaire prévoit un choix de compétences dès l'inscription, mais celui-ci n'est en réalité pas transmis au serveur à ce stade (liste toujours vide) — les compétences se configurent ensuite depuis le profil (voir §3.3).
3. L'acceptation des Conditions Générales d'Utilisation est requise à l'écran, mais sa valeur est en réalité toujours envoyée comme acceptée par l'interface, sans en conserver de trace individualisée par l'utilisateur.
4. Le système applique les mêmes contrôles d'unicité et de format que pour un compte Client (email, téléphone, mot de passe — voir cahier « Client » §3.1 pour le détail des règles communes).
5. Le compte Utilisateur et le profil Prestataire associé sont créés simultanément, avec un profil professionnel initialement incomplet (pas de bio, pas de compétence, pas de point de dépôt, pas d'IBAN).
6. Un jeton de session est généré ; le prestataire est immédiatement connecté.
7. Un email de vérification est envoyé (valable 24h).

**Règles de gestion associées** :
- **RG-PRE-001** : Les règles de validation du compte (email, mot de passe, prénom, nom, ville, téléphone) sont identiques à celles du Client (voir cahier « Client », RG-CLI-001 à RG-CLI-006).
- **RG-PRE-002** : Un compte Prestataire nouvellement créé est toujours dans un état de profil professionnel incomplet ; aucune compétence, bio, point de dépôt ni IBAN n'est renseigné à l'inscription.
- **RG-PRE-003** : La disponibilité par défaut d'un nouveau prestataire est « Actif », bien que son profil soit incomplet (voir §3.4 pour les conséquences sur la visibilité réelle des demandes).

**Cas d'erreur** : identiques au cahier « Client » §3.1 (email/téléphone déjà utilisés, mot de passe trop court, champs obligatoires manquants).

**Données manipulées** : identiques au cahier « Client » §3.1 (email, mot de passe, prénom, nom, ville, téléphone).

---

## 3.2 Connexion, vérification d'email, mot de passe oublié, récupération d'email perdu, changement de téléphone/email, suppression de compte

**Objectif métier** : ces mécanismes de sécurité du compte sont strictement identiques entre Client et Prestataire (même code, mêmes règles, mêmes messages).

Se référer au cahier « Client », sections 3.2, 3.3, 3.4, 3.6, 3.7, 3.8 et 3.9 pour le détail complet (workflows, règles de gestion RG-CLI-008 à RG-CLI-030, messages d'erreur). Aucune différence fonctionnelle n'existe entre les deux rôles sur ces parcours, à une exception près :

**Règles de gestion associées** :
- **RG-PRE-004** : La condition de blocage de la suppression de compte (« pas de prestation active ») s'applique côté Prestataire à ses propres prestations en cours (statut autre que Terminée ou Annulée), de la même façon que pour un Client sur ses demandes (voir RG-CLI-027).

---

## 3.3 Complétion du profil professionnel — Bio, compétences, point de dépôt

**Objectif métier** : permettre au prestataire de renseigner les informations nécessaires pour apparaître dans les résultats de recherche des clients et recevoir des demandes pertinentes.

**Acteur concerné** : Prestataire connecté.

**Préconditions** : être connecté avec un profil Prestataire.

**Déclencheur** : édition de la page profil.

**Workflow nominal détaillé** :
1. Le prestataire renseigne sa biographie professionnelle (présentation de son activité, savoir-faire).
2. Le prestataire sélectionne une ou plusieurs compétences : au minimum une catégorie de service ; il peut préciser, pour chaque catégorie choisie, une ou plusieurs sous-catégories, et pour chaque sous-catégorie, une ou plusieurs interventions précises.
3. Le prestataire renseigne son point de dépôt : adresse, ville, code postal, et éventuellement des instructions complémentaires pour les clients (ex. horaires, code d'accès).
4. Le prestataire renseigne ses coordonnées bancaires (IBAN, BIC, nom de la banque) afin de pouvoir être payé.
5. Le système enregistre les modifications et réévalue la complétude du profil.
6. Si le profil devient complet et que le prestataire était en disponibilité « Absent » du seul fait de l'incomplétude, sa disponibilité repasse automatiquement à « Actif ».

**Règles de gestion associées** :
- **RG-PRE-005** : La biographie doit contenir entre 100 et 500 caractères.
- **RG-PRE-006** : Un maximum de 3 catégories de compétence peut être sélectionné par le prestataire (contrôle appliqué côté serveur).
- **RG-PRE-007** : Un maximum de 5 sous-catégories peut être sélectionné par catégorie, et un maximum de 5 interventions précises par sous-catégorie (ces deux limites ne sont vérifiées que par l'interface utilisateur ; voir point d'attention QA au §8 sur le contournement possible via un appel direct au serveur).
- **RG-PRE-008** : Les instructions du point de dépôt sont limitées à 300 caractères.
- **RG-PRE-009** : La valeur de disponibilité doit être l'une des suivantes : Actif, Occupé, Absent.
- **RG-PRE-010** : Aucune vérification de format n'est appliquée par le serveur sur l'IBAN et le BIC saisis (seule l'interface utilisateur applique une vérification de format ; voir point d'attention QA au §8).
- **RG-PRE-011** : Toute modification de l'IBAN réinitialise l'indicateur de vérification bancaire (« IBAN vérifié ») à « non vérifié ».
- **RG-PRE-012** : Le profil professionnel est considéré complet lorsque les cinq conditions suivantes sont toutes réunies : email vérifié, biographie d'au moins 100 caractères, au moins une compétence renseignée, adresse de point de dépôt renseignée, IBAN renseigné.
- **RG-PRE-013** : Un prestataire dont le profil est incomplet ne peut pas positionner manuellement sa disponibilité sur « Actif » ou « Occupé » (verrouillage), tant que les cinq conditions ci-dessus ne sont pas réunies.

**Cas alternatifs** :
- Le prestataire peut compléter son profil progressivement, en plusieurs sessions ; l'enregistrement de chaque section (bio, compétences, point de dépôt, IBAN) est indépendant.

**Cas d'erreur** :
- Bio hors bornes (< 100 ou > 500 caractères) → « La biographie doit contenir entre 100 et 500 caractères. »
- Plus de 3 catégories sélectionnées → « Maximum 3 catégories de compétence. »
- Disponibilité invalide → « Valeur de disponibilité invalide. »
- Instructions du point de dépôt trop longues → « Maximum 300 caractères. »
- Tentative de changer la disponibilité manuellement alors que le profil est incomplet → erreur technique générique (voir point d'attention QA au §8 — ce cas n'est pas correctement mappé à un message métier clair).

**Données manipulées** :
| Champ | Obligatoire pour un profil complet | Contrainte |
|---|---|---|
| bio | Oui | Entre 100 et 500 caractères |
| compétences (catégories) | Oui (au moins 1) | Max. 3 catégories |
| sous-catégories par compétence | Non | Max. 5 par catégorie (contrôle interface uniquement) |
| interventions par sous-catégorie | Non | Max. 5 par sous-catégorie (contrôle interface uniquement) |
| point de dépôt (adresse, ville, code postal) | Oui | — |
| instructions point de dépôt | Non | Max. 300 caractères |
| IBAN | Oui | Aucun contrôle de format serveur |
| BIC | Non | Aucun contrôle de format serveur |
| nom de la banque | Non | — |
| disponibilité | — | Actif / Occupé / Absent |

---

## 3.4 Disponibilité du prestataire

**Objectif métier** : permettre au prestataire d'indiquer sa capacité actuelle à accepter de nouvelles demandes.

**Acteur concerné** : Prestataire connecté, profil complet.

**Préconditions** : profil professionnel complet (voir RG-PRE-012).

**Workflow nominal détaillé** :
1. Le prestataire choisit son statut : Actif (peut recevoir de nouvelles demandes), Occupé (visible mais signale une charge importante), Absent (indisponible).
2. Le statut est mis à jour immédiatement et reflété dans les résultats de recherche des clients.

**Règles de gestion associées** :
- **RG-PRE-014** : Voir RG-PRE-013 : changement bloqué si profil incomplet.
- **RG-PRE-015** : La disponibilité n'empêche pas la consultation ou la réception de devis déjà en cours de traitement ; elle n'affecte que la visibilité du prestataire pour de **nouvelles** mises en relation.

**Cas d'erreur** : profil incomplet → erreur (voir §3.3).

---

## 3.5 Consultation des demandes disponibles (matching)

**Objectif métier** : permettre au prestataire de découvrir les demandes clients compatibles avec son profil, classées par pertinence.

**Acteur concerné** : Prestataire connecté, profil complet.

**Préconditions** : profil professionnel complet.

**Workflow nominal détaillé** :
1. Le prestataire consulte la liste des demandes au statut « Publiée ».
2. Le système calcule, pour chaque demande, un score de compatibilité et un libellé (Parfait, Bon, Partiel) selon l'algorithme de matching.
3. Le prestataire ouvre le détail d'une demande pour en consulter la description complète et décider d'y répondre.

**Règles de gestion associées** :
- **RG-PRE-016** : Un prestataire au profil incomplet (voir RG-PRE-012) ne peut voir aucune demande disponible — condition bloquante (« filtre dur »).
- **RG-PRE-017** : Une demande n'est proposée que si le prestataire possède au moins une compétence correspondant à la catégorie de la demande (second filtre dur).
- **RG-PRE-018** : Le score de compatibilité est calculé par pondération : correspondance de catégorie (40 points), correspondance de sous-catégorie (25 points), ratio d'expérience sur des interventions similaires (jusqu'à 20 points), correspondance de ville (10 points), note moyenne du prestataire (jusqu'à 5 points).
- **RG-PRE-019** : Le libellé affiché est « Parfait » à partir de 90 points, « Bon » à partir de 65 points, « Partiel » en-dessous.
- **RG-PRE-020** : Une demande déjà pourvue d'un devis émis par ce même prestataire reste visible dans la liste mais est signalée comme telle (pour éviter un double devis, voir §3.6).

**Cas d'erreur** : profil incomplet → aucune demande affichée, avec message invitant à compléter le profil.

---

## 3.6 Envoi d'un devis

**Objectif métier** : permettre au prestataire de proposer ses services et un tarif pour une demande donnée.

**Acteur concerné** : Prestataire connecté, profil complet.

**Préconditions** : la demande doit être au statut « Publiée » ; aucun devis déjà envoyé par ce prestataire pour cette demande.

**Déclencheur** : soumission du formulaire de devis depuis le détail d'une demande.

**Workflow nominal détaillé** :
1. Le prestataire renseigne : montant proposé, délai de réalisation (en jours), description de sa proposition.
2. Le système vérifie l'absence de devis préexistant du même prestataire pour cette demande.
3. Le devis est créé au statut « Envoyé », avec une date d'expiration fixée à 7 jours après l'envoi.
4. Le client concerné est notifié de la réception d'un nouveau devis.

**Règles de gestion associées** :
- **RG-PRE-021** : Le montant proposé doit être strictement supérieur à 0.
- **RG-PRE-022** : Le délai proposé doit être un nombre entier de jours strictement supérieur à 0.
- **RG-PRE-023** : La description du devis doit contenir au moins 20 caractères.
- **RG-PRE-024** : Un seul devis est autorisé par couple (prestataire, demande), quel que soit le statut de ce devis (y compris un devis déjà refusé — impossible de soumettre un second devis après un refus).
- **RG-PRE-025** : La date d'expiration du devis est fixée à J+7 à la création, mais aucun mécanisme n'applique effectivement de changement de statut à l'expiration (voir point d'attention QA au §8).

**Cas d'erreur** :
- Demande non « Publiée » → « Cette demande n'accepte plus de nouveaux devis. »
- Devis déjà existant pour ce couple prestataire/demande → « Vous avez déjà envoyé un devis pour cette demande. »
- Montant ≤ 0 → « Le montant doit être supérieur à 0. »
- Délai ≤ 0 ou non entier → « Délai invalide. »
- Description trop courte → « Description trop courte (min 20 caractères). »

**Données manipulées** :
| Champ | Obligatoire | Contrainte |
|---|---|---|
| montant | Oui | > 0 |
| délai (jours) | Oui | Entier > 0 |
| description | Oui | Min. 20 caractères |

---

## 3.7 Suivi de mes devis envoyés

**Objectif métier** : permettre au prestataire de suivre l'état de ses propositions en cours et passées.

**Acteur concerné** : Prestataire connecté.

**Workflow nominal détaillé** :
1. Le prestataire consulte la liste de ses devis, avec leur statut (Envoyé, Accepté, Refusé) et, pour les devis liés à une demande de type Modification non retenus, l'indicateur de non-sélectionnabilité.
2. Le prestataire peut consulter ses statistiques : nombre de devis envoyés, taux d'acceptation, etc.

**Règles de gestion associées** :
- **RG-PRE-026** : Un devis refusé peut être retiré de la vue « devis actifs » du prestataire (masquage personnel), sans suppression réelle ni impact sur l'historique côté client/admin.

**Cas d'erreur** : tentative de consultation des devis d'un autre prestataire → accès refusé (chaque prestataire ne voit que ses propres devis).

---

## 3.8 Masquage d'un devis refusé (dismiss)

**Objectif métier** : permettre au prestataire d'alléger sa liste de devis actifs en masquant ceux qui ont été refusés, sans perdre l'historique.

**Acteur concerné** : Prestataire connecté, propriétaire du devis.

**Préconditions** : le devis doit être au statut « Refusé ».

**Workflow nominal détaillé** :
1. Le prestataire choisit de masquer un devis refusé de sa liste principale.
2. Le devis est marqué comme masqué pour ce prestataire uniquement ; il reste consultable dans un historique dédié si besoin.

**Règles de gestion associées** :
- **RG-PRE-027** : Seul un devis au statut « Refusé » peut être masqué de cette façon.

**Cas d'erreur** : devis non « Refusé » → refus de l'opération ; devis n'appartenant pas au prestataire → accès refusé.

---

## 3.9 Soumission de l'état des lieux (demandes de type Modification uniquement)

**Objectif métier** : permettre au prestataire de documenter l'état de l'objet reçu du client avant de commencer les travaux, et le cas échéant de réviser son tarif initial.

**Acteur concerné** : Prestataire connecté, assigné à la prestation.

**Préconditions** : la prestation doit être au statut « En attente d'inspection » (c'est-à-dire : devis accepté sur une demande de type Modification).

**Déclencheur** : action « Soumettre l'état des lieux » ou « Confirmer la conformité ».

**Workflow nominal détaillé** :
1. Le prestataire examine l'objet reçu (déposé physiquement selon les modalités indiquées au point de dépôt).
2. **Cas standard** : il rédige une description de l'état constaté, joint des photos, et peut proposer un montant révisé si l'état de l'objet justifie un ajustement du prix par rapport au devis initial.
3. **Cas raccourci** : s'il estime l'objet strictement conforme à la description initiale du client, il peut directement confirmer la conformité sans détailler d'état des lieux — ce qui fait immédiatement progresser la prestation, sans attendre de validation explicite du client.
4. Dans le cas standard, l'état des lieux est soumis au statut « En attente », en attente de décision du client (voir cahier « Client » §3.15).
5. Un message système informe le client qu'un état des lieux est disponible pour validation.

**Règles de gestion associées** :
- **RG-PRE-028** : Un seul état des lieux peut être soumis par prestation.
- **RG-PRE-029** : Le montant révisé, s'il est proposé, remplace le montant initial du devis comme montant final de la prestation, mais uniquement après validation par le client.
- **RG-PRE-030** : Le raccourci « confirmer la conformité » fait passer la prestation directement au statut « En attente de paiement », sans validation explicite du client sur un état des lieux détaillé (voir point d'attention QA au §8).

**Cas d'erreur** :
- Prestation non « En attente d'inspection » → « Cette prestation n'est pas en attente d'inspection. »
- État des lieux déjà soumis pour cette prestation → « Un état des lieux existe déjà pour cette prestation. »
- Prestation n'appartenant pas au prestataire → accès refusé.

**Données manipulées** :
| Champ | Obligatoire | Contrainte |
|---|---|---|
| description | Oui (cas standard) | Texte libre |
| photos | Non | — |
| montant révisé | Non | Doit être positif s'il est renseigné |

---

## 3.10 Exécution et marquage de fin de prestation

**Objectif métier** : permettre au prestataire de signaler que la prestation est terminée de son côté, afin de déclencher la validation par le client.

**Acteur concerné** : Prestataire connecté, assigné à la prestation.

**Préconditions** : la prestation doit être au statut « En cours » (paiement déjà effectué par le client).

**Déclencheur** : action « Marquer comme terminée ».

**Workflow nominal détaillé** :
1. Le prestataire indique que la prestation est achevée.
2. La prestation passe au statut « À valider ».
3. Une échéance d'auto-validation est fixée à 3 jours après ce marquage.
4. Le client est notifié qu'une action de validation est attendue de sa part.

**Règles de gestion associées** :
- **RG-PRE-031** : Seule une prestation « En cours » peut être marquée comme terminée.
- **RG-PRE-032** : Après une contestation du client (retour au statut « En cours », voir cahier « Client » §3.19), le prestataire doit de nouveau marquer la prestation comme terminée pour relancer le processus de validation ; un nouveau délai de 3 jours est alors recalculé.
- **RG-PRE-033** : Si ni le client ni un événement de contestation n'intervient dans les 3 jours suivant le marquage, la prestation est automatiquement validée par le système (voir cahier « Client », RG-CLI-056), déclenchant la libération du paiement au prestataire.

**Cas d'erreur** :
- Prestation non « En cours » → « Cette prestation n'est pas en cours. »
- Prestation n'appartenant pas au prestataire → accès refusé.

---

## 3.11 Messagerie liée à une prestation

**Objectif métier** : permettre au prestataire d'échanger avec le client dans le cadre d'une prestation.

**Acteur concerné** : Prestataire connecté, assigné à la prestation.

Les règles sont strictement identiques à celles décrites pour le Client (voir cahier « Client » §3.22, RG-CLI-068 à RG-CLI-072) : longueur maximale de 1000 caractères (message d'erreur affiché mentionnant à tort 2000 caractères), interdiction du partage de coordonnées personnelles détectées automatiquement, accès réservé aux deux parties de la prestation, messages système marqués comme lus automatiquement.

---

## 3.12 Consultation de ma réputation

**Objectif métier** : permettre au prestataire de suivre sa note moyenne et les avis reçus des clients, éléments qui influencent son classement dans le matching.

**Acteur concerné** : Prestataire connecté.

**Workflow nominal détaillé** :
1. Le prestataire consulte sa note moyenne (arrondie au dixième) et le nombre total d'avis reçus.
2. Le prestataire peut consulter également des indicateurs de performance affichés sur son tableau de bord (taux de réussite, délai moyen, temps de réponse) et un objectif mensuel de revenu.

**Règles de gestion associées** :
- **RG-PRE-034** : La note moyenne et le nombre d'avis sont recalculés automatiquement à chaque nouvel avis déposé par un client (voir cahier « Client » RG-CLI-064).
- **RG-PRE-035** : Les indicateurs « taux de réussite », « délai moyen » et « temps de réponse » affichés sur le profil ne sont jamais recalculés par le système : ils restent en permanence à leur valeur par défaut (0), quelle que soit l'activité réelle du prestataire (voir point d'attention QA au §8 — fonctionnalité non opérationnelle).
- **RG-PRE-036** : L'objectif mensuel de revenu affiché au tableau de bord est une valeur fixe identique pour tous les prestataires, non personnalisable.
- **RG-PRE-037** : La commission de la plateforme affichée dans les calculs de revenu du tableau de bord est fixée à 15 %, cohérente avec la commission réellement appliquée lors du paiement (voir cahier « Client » RG-CLI-053).

**Cas d'erreur** : sans objet (fonctionnalité de consultation uniquement).

---

## 3.13 Portfolio (fonctionnalité non disponible)

Le modèle de données prévoit la possibilité, pour un prestataire, de constituer un portfolio de réalisations (images avec légende). **Cette fonctionnalité n'est actuellement accessible par aucun écran ni aucune action de l'application** — elle ne doit pas être testée en tant que fonctionnalité active et ne doit pas apparaître dans un plan de test fonctionnel tant qu'elle n'a pas été livrée à l'interface.

---

# 4. Parcours utilisateurs (Workflows)

## 4.1 Parcours « Inscription et complétion du profil professionnel »
- **Acteur** : Visiteur devenant Prestataire.
- **Étapes** : inscription (§3.1) → vérification de l'email → connexion → complétion du profil : bio, compétences, point de dépôt, IBAN (§3.3) → passage automatique en visibilité pour les clients une fois le profil complet.
- **Résultat attendu** : le prestataire apparaît dans les résultats de matching des demandes compatibles.
- **Données invalides à tester** : bio hors bornes (99 et 501 caractères), plus de 3 catégories, IBAN au format invalide (non bloqué côté serveur — à tester spécifiquement), instructions de point de dépôt à 301 caractères.
- **Erreurs à tester** : tentative de passage en disponibilité « Actif » avant complétude du profil.

## 4.2 Parcours « Réponse à une demande jusqu'au paiement (Création/Formation) »
- **Acteur** : Prestataire, profil complet.
- **Étapes** : consultation des demandes disponibles avec score de matching (§3.5) → envoi d'un devis (§3.6) → devis accepté par le client → passage direct en « En attente de paiement » → paiement effectué par le client → prestation « En cours » → exécution → marquage de fin de prestation (§3.10) → validation par le client (ou auto-validation à J+3) → paiement libéré.
- **Résultat attendu** : prestation Terminée, paiement (85 % du montant) crédité au prestataire.
- **Erreurs à tester** : tentative de marquer terminée une prestation qui n'est pas « En cours » ; tentative d'envoi d'un second devis pour la même demande.

## 4.3 Parcours « Réponse à une demande avec état des lieux (Modification) »
- **Acteur** : Prestataire, profil complet.
- **Étapes** : envoi d'un devis sur une demande de type Modification → devis accepté → prestation « En attente d'inspection » → réception de l'objet au point de dépôt → soumission de l'état des lieux, avec ou sans révision du montant (§3.9) → décision du client (acceptation → paiement ; refus → prestation annulée) → si accepté : suite identique au parcours §4.2 à partir du paiement.
- **Résultat attendu (branche acceptation)** : identique au parcours §4.2.
- **Résultat attendu (branche refus)** : la prestation est annulée côté prestataire ; la demande redevient disponible pour d'autres prestataires (le devis initial du prestataire passe à Refusé).
- **Données invalides à tester** : montant révisé négatif ou nul ; tentative de soumission d'un second état des lieux pour la même prestation.

## 4.4 Parcours « Gestion de la charge de travail »
- **Acteur** : Prestataire, profil complet.
- **Étapes** : passage de la disponibilité en « Occupé » ou « Absent » (§3.4) lorsque le carnet de commandes est plein → les nouvelles demandes ne mettent plus ce prestataire en avant → retour à « Actif » lorsque la charge redevient gérable.
- **Résultat attendu** : la visibilité du prestataire dans le matching reflète sa disponibilité déclarée en temps réel.
- **Erreurs à tester** : changement de disponibilité alors que le profil redevient incomplet entre-temps (ex. IBAN retiré) — à vérifier si un verrouillage est réappliqué.

## 4.5 Parcours « Récupération de compte / suppression de compte »
Identique au cahier « Client » §4.5 et §4.6 — mêmes étapes, mêmes règles de gestion, seule différence étant que la condition de blocage de suppression porte sur les prestations actives du prestataire plutôt que sur les demandes actives du client.

---

# 5. Règles de gestion complètes

| Identifiant | Nom | Description | Conditions | Résultat attendu | Exceptions |
|---|---|---|---|---|---|
| RG-PRE-002 | Profil incomplet à la création | Un nouveau compte Prestataire n'a ni bio, ni compétence, ni point de dépôt, ni IBAN | À la création du compte | Profil marqué incomplet, invisible dans le matching | — |
| RG-PRE-005 | Longueur de la bio | La biographie doit contenir entre 100 et 500 caractères | À toute modification du profil | Rejet si hors bornes | — |
| RG-PRE-006 | Limite de catégories | Maximum 3 catégories de compétence | À toute modification des compétences | Rejet au-delà de 3, contrôle serveur | — |
| RG-PRE-007 | Limite de sous-catégories/interventions | Maximum 5 sous-catégories par catégorie, 5 interventions par sous-catégorie | À toute modification des compétences | Blocage prévu à l'interface uniquement | Pas de contrôle serveur — contournable par appel direct à l'API (voir §8) |
| RG-PRE-010 | Absence de contrôle de format bancaire serveur | Aucune vérification de format IBAN/BIC côté serveur | À la saisie des coordonnées bancaires | Toute chaîne de caractères est acceptée par le serveur | L'interface utilisateur applique, elle, une vérification de format |
| RG-PRE-011 | Réinitialisation de la vérification IBAN | Toute modification de l'IBAN remet « IBAN vérifié » à faux | À chaque modification de l'IBAN | Indicateur remis à zéro | — |
| RG-PRE-012 | Complétude du profil | 5 conditions cumulatives (email vérifié, bio ≥100, ≥1 compétence, point de dépôt, IBAN) | En continu | Visibilité dans le matching conditionnée à ces 5 critères | — |
| RG-PRE-013 | Verrouillage de disponibilité | Impossible de passer en Actif/Occupé si profil incomplet | À chaque tentative de changement de disponibilité | Rejet si profil incomplet | Message d'erreur non explicite (erreur générique, voir §8) |
| RG-PRE-016/017 | Filtres durs du matching | Profil complet + au moins une compétence correspondant à la catégorie de la demande | À l'affichage des demandes disponibles | Demande masquée si un des deux filtres échoue | — |
| RG-PRE-018/019 | Scoring et libellé du matching | Pondération catégorie/sous-catégorie/expérience/ville/note ; libellés Parfait ≥90, Bon ≥65, Partiel sinon | À l'affichage des demandes disponibles | Classement et libellé affichés au prestataire | — |
| RG-PRE-021/022/023 | Validité du devis | Montant > 0, délai entier > 0, description ≥20 caractères | À l'envoi d'un devis | Rejet si non conforme | — |
| RG-PRE-024 | Unicité du devis | Un seul devis par couple (prestataire, demande), quel que soit son statut | À l'envoi d'un devis | Rejet si un devis existe déjà, y compris refusé | — |
| RG-PRE-025 | Expiration théorique du devis | Date d'expiration fixée à J+7 | À la création du devis | Champ renseigné mais sans effet automatique | Aucun changement de statut réel à l'échéance (voir §8) |
| RG-PRE-028 | État des lieux unique | Un seul état des lieux par prestation | À la soumission | Rejet si déjà existant | — |
| RG-PRE-030 | Raccourci de conformité | Confirmation directe sans validation explicite du client | À la soumission de l'état des lieux | Passage direct en attente de paiement | Court-circuite l'étape de décision du client (voir §8) |
| RG-PRE-031 | Marquage de fin de prestation conditionné | Seule une prestation En cours peut être marquée terminée | À l'action « Marquer comme terminée » | Rejet sinon | — |
| RG-PRE-033 | Auto-validation à J+3 | Sans action du client après marquage terminé, validation automatique à J+3 | Vérifié au minimum toutes les heures | Passage automatique en Terminée, paiement libéré | Le délai repart de zéro après toute contestation suivie d'un nouveau marquage |
| RG-PRE-035 | Indicateurs de performance figés | Taux de réussite, délai moyen, temps de réponse jamais recalculés | En continu | Toujours à 0, quelle que soit l'activité | Fonctionnalité non opérationnelle, à ne pas tester comme active |

---

# 6. Matrice des droits utilisateurs

| Fonctionnalité | Visiteur | Utilisateur connecté (Prestataire) | Administrateur |
|---|---|---|---|
| Consulter les pages publiques | Oui | Oui | Oui |
| S'inscrire comme prestataire | Oui | N/A | N/A |
| Compléter/modifier son profil professionnel | Non | Oui, son propre profil uniquement | Non (pas d'édition du profil d'un prestataire par un admin) |
| Consulter les demandes disponibles (matching) | Non | Oui, si profil complet | Non applicable (vue admin distincte, hors périmètre) |
| Envoyer un devis | Non | Oui, une fois par demande | Non |
| Consulter ses propres devis | Non | Oui | Oui (vue globale via module Admin) |
| Masquer un devis refusé | Non | Oui, ses propres devis uniquement | Non |
| Soumettre un état des lieux | Non | Oui, sur ses propres prestations « En attente d'inspection » | Non |
| Marquer une prestation comme terminée | Non | Oui, sur ses propres prestations « En cours » | Non |
| Envoyer un message dans une prestation | Non | Oui, sur ses propres prestations uniquement | Non |
| Consulter sa réputation (note, avis) | Non | Oui, la sienne uniquement | Oui (vue globale) |
| Modifier la disponibilité | Non | Oui, si profil complet | Non |
| Suspendre/réactiver un compte prestataire | Non | Non | Oui |

---

# 7. Messages applicatifs

## 7.1 Messages de succès
- « Compte prestataire créé avec succès »
- « Profil mis à jour. »
- « Devis envoyé avec succès. »
- « Devis masqué. »
- « État des lieux soumis. » / « Conformité confirmée. »
- « Prestation marquée comme terminée. »

## 7.2 Messages d'erreur
- Messages communs au compte (identiques au cahier « Client », §7.2) : erreurs d'inscription/connexion/OTP.
- « La biographie doit contenir entre 100 et 500 caractères. »
- « Maximum 3 catégories de compétence. »
- « Maximum 300 caractères. » (instructions point de dépôt)
- « Valeur de disponibilité invalide. »
- « Cette demande n'accepte plus de nouveaux devis. »
- « Vous avez déjà envoyé un devis pour cette demande. »
- « Le montant doit être supérieur à 0. » / « Délai invalide. » / « Description trop courte (min 20 caractères). »
- « Cette prestation n'est pas en attente d'inspection. » / « Un état des lieux existe déjà pour cette prestation. »
- « Cette prestation n'est pas en cours. »
- « Accès refusé » (générique, tentative d'accès à une ressource n'appartenant pas au prestataire)
- Erreur générique serveur (masquant le cas « profil incomplet ») lors d'une tentative de changement de disponibilité non autorisée (voir §8).

## 7.3 Messages d'information / confirmation
- Indication de la complétude du profil (pourcentage ou liste de conditions manquantes) affichée au prestataire tant que son profil n'est pas complet.
- Libellé du score de matching affiché sur chaque demande disponible (Parfait / Bon / Partiel).
- Mention de la date d'expiration théorique d'un devis (J+7) affichée dans le suivi des devis.
- Indicateur « IBAN non vérifié » affiché sur le profil tant que la vérification bancaire n'a pas été effectuée.

---

# 8. Points d'attention pour les tests QA

1. **Absence de contrôle serveur sur le format IBAN/BIC** : seule l'interface utilisateur vérifie le format des coordonnées bancaires. Un test via appel direct à l'API avec un IBAN de format invalide (ex. chaîne de caractères aléatoire) doit être exécuté pour vérifier si le serveur l'accepte tout de même — ce qui aurait un impact direct sur la fiabilité des paiements Stripe (l'IBAN étant transmis en métadonnée de paiement).
2. **Contournement des limites de sous-catégories/interventions** : les limites de 5 sous-catégories par catégorie et de 5 interventions par sous-catégorie ne sont appliquées que côté interface. Un test via appel direct à l'API doit vérifier si un prestataire peut dépasser ces limites, ce qui pourrait fausser l'algorithme de matching ou la présentation du profil.
3. **Message d'erreur générique sur le verrouillage de disponibilité** : une tentative de passage en disponibilité « Actif »/« Occupé » avec un profil incomplet renvoie une erreur technique générique plutôt qu'un message métier explicite (l'interface masque ce cas en désactivant le contrôle, mais un appel direct à l'API doit être testé pour vérifier le comportement réel et le code d'erreur renvoyé).
4. **Raccourci « confirmer la conformité »** : ce raccourci fait sauter l'étape de validation explicite du client sur l'état des lieux. Vérifier avec l'équipe produit si ce comportement est intentionnel (un client pourrait légitimement s'attendre à valider systématiquement l'état de son objet avant paiement, quelle que soit la voie empruntée par le prestataire).
5. **Devis sans expiration effective** : la date d'expiration à J+7 est enregistrée mais aucun mécanisme ne fait passer un devis ancien à un statut expiré. Tester la persistance d'un devis « Envoyé » plusieurs semaines après sa création et vérifier s'il reste acceptable par le client.
6. **Indicateurs de performance non opérationnels** : « taux de réussite », « délai moyen » et « temps de réponse » restent figés à 0 quelle que soit l'activité réelle du prestataire. Ne pas considérer ces champs comme fonctionnels dans les tests — à signaler si l'équipe produit souhaite les rendre opérationnels ou les retirer de l'affichage.
7. **Portfolio non livré** : le modèle de données existe mais aucune fonctionnalité n'y donne accès. Ne pas tester cette zone comme une fonctionnalité active.
8. **Un seul devis possible, y compris après refus** : un prestataire dont le devis a été refusé ne peut pas en soumettre un second pour la même demande, même si la demande reste ouverte à d'autres prestataires. Vérifier que ce comportement (définitif dès le premier devis) correspond bien à l'intention métier.
9. **Limite réelle des messages de la messagerie** : voir cahier « Client » §8, point 5 (limite réelle de 1000 caractères, message affiché mentionnant à tort 2000).
10. **Zones à risque prioritaires pour les tests** : complétude du profil (les 5 conditions cumulatives, y compris leur ré-évaluation dynamique si un champ redevient vide après avoir été rempli), matching (filtres durs et scoring, notamment les cas limites autour des seuils 90/65 points), transitions de statut de prestation en lien avec l'état des lieux, calcul financier (commission 15/85 %, montant révisé remplaçant le montant initial), droits d'accès (un prestataire ne doit jamais pouvoir consulter/modifier les devis ou prestations d'un autre prestataire).

---

# 9. Critères d'acceptation (Gherkin)

```gherkin
Fonctionnalité : Complétion du profil professionnel

Scénario : Profil devient complet
  Étant donné un prestataire avec l'email vérifié, sans bio, compétence, point de dépôt ni IBAN
  Quand il renseigne une bio de 150 caractères, une compétence, un point de dépôt et un IBAN
  Alors son profil est marqué comme complet
  Et il apparaît désormais dans les résultats de matching des demandes compatibles

Scénario : Bio trop courte
  Étant donné un prestataire modifiant son profil
  Quand il soumet une biographie de 50 caractères
  Alors la modification est refusée
  Et le message « La biographie doit contenir entre 100 et 500 caractères. » est affiché

Scénario : Changement de disponibilité bloqué si profil incomplet
  Étant donné un prestataire dont le profil est incomplet (IBAN manquant)
  Quand il tente de passer sa disponibilité à « Actif »
  Alors le changement est refusé


Fonctionnalité : Matching des demandes disponibles

Scénario : Demande masquée si profil incomplet
  Étant donné un prestataire au profil incomplet
  Quand il consulte la liste des demandes disponibles
  Alors aucune demande ne lui est proposée

Scénario : Demande masquée si aucune compétence ne correspond
  Étant donné un prestataire au profil complet dont les compétences ne couvrent pas la catégorie « Retouche »
  Quand une demande de catégorie « Retouche » est publiée
  Alors cette demande ne lui est pas proposée dans sa liste de demandes disponibles

Scénario : Score Parfait
  Étant donné un prestataire dont la catégorie, la sous-catégorie et la ville correspondent exactement à une demande
  Quand le score de compatibilité est calculé
  Alors le libellé affiché est « Parfait »


Fonctionnalité : Envoi de devis

Scénario : Envoi réussi
  Étant donné une demande au statut « Publiée » sans devis existant de ce prestataire
  Quand le prestataire envoie un devis avec un montant de 50, un délai de 5 jours et une description de 30 caractères
  Alors le devis est créé au statut « Envoyé »

Scénario : Second devis refusé
  Étant donné un prestataire ayant déjà envoyé un devis, refusé, pour une demande donnée
  Quand il tente d'envoyer un second devis pour cette même demande
  Alors l'envoi est refusé
  Et le message « Vous avez déjà envoyé un devis pour cette demande. » est affiché


Fonctionnalité : État des lieux

Scénario : Soumission avec révision du montant
  Étant donné une prestation au statut « En attente d'inspection »
  Quand le prestataire soumet un état des lieux avec un montant révisé de 60 (devis initial à 50)
  Alors l'état des lieux est créé au statut « En attente », en attente de décision du client

Scénario : Confirmation directe de conformité
  Étant donné une prestation au statut « En attente d'inspection »
  Quand le prestataire confirme directement la conformité de l'objet
  Alors la prestation passe directement au statut « En attente de paiement »


Fonctionnalité : Fin de prestation

Scénario : Marquage réussi
  Étant donné une prestation au statut « En cours »
  Quand le prestataire marque la prestation comme terminée
  Alors la prestation passe au statut « À valider »
  Et une échéance d'auto-validation à J+3 est fixée

Scénario : Marquage refusé si statut incorrect
  Étant donné une prestation au statut « En attente de paiement »
  Quand le prestataire tente de la marquer comme terminée
  Alors l'action est refusée
  Et le message « Cette prestation n'est pas en cours. » est affiché
```

---

# 10. Ne pas oublier

Ce document doit permettre à l'équipe QA de construire :
- **Des tests fonctionnels** couvrant chaque fonctionnalité du §3 selon son workflow nominal, notamment la complétion progressive du profil et l'algorithme de matching.
- **Des tests négatifs** couvrant chaque cas d'erreur listé (bornes de bio, limites de compétences, statuts de prestation incompatibles, droits d'accès violés).
- **Des tests aux limites** sur les valeurs numériques et de longueur (bio à 100/500/99/501 caractères, description de devis à 20/19 caractères, montant à une valeur proche de 0, délai à 1 jour, 3 catégories exactement puis une 4e, scores de matching aux seuils exacts de 90 et 65 points).
- **Des tests de régression** sur les parcours complets du §4, à rejouer après toute évolution touchant le profil professionnel, le matching, les devis ou le cycle de vie de la prestation.
- **Des tests exploratoires** ciblant en priorité les points d'attention du §8 : contournement des limites de compétences par appel direct à l'API, absence de contrôle de format bancaire, comportement réel du verrouillage de disponibilité, persistance des devis au-delà de leur expiration théorique.

Toute anomalie découverte lors des tests correspondant aux constats du §8 doit être remontée à l'équipe produit/développement pour arbitrage (bug confirmé vs comportement intentionnel), avant d'être considérée comme un défaut bloquant.
