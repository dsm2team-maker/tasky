# Référentiel de tests fonctionnels — TASKY
## Profil PRESTATAIRE

---

## 1. Résumé et périmètre

Ce document couvre l'intégralité des fonctionnalités accessibles au profil **PRESTATAIRE**, sourcées depuis le code réel. Les mêmes conventions que `clientTest.docx` s'appliquent (RG-XXX/TC-XXX, mentions **À CONFIRMER** si non déductible du code). Les tests transverses (multi-profils, paiement, sécurité, cohérence des données) sont regroupés dans `adminTest.docx`.

---

## 2. Cartographie fonctionnelle PRESTATAIRE

```
PRESTATAIRE
├── Authentification & Compte
│     ├── Inscription (avec champs professionnels spécifiques)
│     ├── Connexion / Déconnexion
│     ├── Mot de passe oublié / Reset
│     ├── Vérification email
│     ├── Changement téléphone / email (OTP)
│     └── Suppression de compte (OTP)
├── Disponibilité
│     └── Basculer Disponible / Indisponible
├── Demandes (marketplace)
│     ├── Parcourir les demandes publiées (filtrage par catégorie/zone — À CONFIRMER logique exacte)
│     └── Consulter le détail d'une demande
├── Devis
│     ├── Envoyer un devis
│     └── Consulter mes devis envoyés
├── État des lieux (si typePrestation = MODIFICATION)
│     └── Soumettre un état des lieux (description + photos)
├── Prestation
│     ├── Consulter mes prestations en cours
│     └── Marquer une prestation comme terminée
├── Paiement
│     └── Consulter mes versements (payouts) — infos bancaires nécessaires
├── Profil professionnel
│     ├── Renseigner IBAN/BIC/bankName (chiffrés au repos, AES-256-GCM)
│     ├── Modifier mes informations professionnelles
│     └── Portfolio — NON IMPLÉMENTÉ (absence confirmée dans le code, à ne pas tester comme un bug)
├── Réputation
│     └── Consulter ma note moyenne — NON OPÉRATIONNEL (aucun calcul dynamique confirmé dans le code ; valeur potentiellement statique/absente — À CONFIRMER)
├── Signalement
│     └── Signaler un problème sur une demande
└── Messagerie
      ├── Consulter une conversation
      └── Envoyer un message
```

**Absences confirmées** (ne pas traiter comme anomalies mais comme fonctionnalités non implémentées à faire confirmer par le Product Owner) :
- Portfolio prestataire (aucune route/table dédiée trouvée)
- Calcul dynamique de la note de réputation (aucun agrégat trouvé — les avis existent côté `Prestation.avis` mais aucune moyenne recalculée/exposée n'a été localisée avec certitude)

---

## 3. Droits et restrictions PRESTATAIRE

| Fonctionnalité | Prestataire | Contrainte d'accès | Source |
|---|---|---|---|
| Consulter les demandes publiées | Oui | authentifié, role prestataire | demande.controller.ts |
| Envoyer un devis | Oui, uniquement sur une demande au statut PUBLIEE | devis.service.ts:~50-80 |
| Consulter mes devis | Oui, uniquement les siens | devis.service.ts |
| Soumettre un état des lieux | Oui, uniquement sur sa propre prestation, après acceptation du devis | prestation.service.ts:100-140 |
| Marquer terminé | Oui, uniquement sur sa propre prestation EN_COURS | prestation.service.ts:~300-340 |
| Consulter versements | Oui, uniquement les siens | payment/payout service |
| Modifier IBAN/BIC | Oui, sur son propre profil uniquement | user.controller.ts (chiffrement AES-256-GCM) |
| Signaler un problème | Oui, sur ses demandes actives (symétrique au client) | signalement.service.ts:17-27 |
| Envoyer un message | Oui, uniquement s'il est partie prenante | message.service.ts:3-18 |
| Accéder aux fonctionnalités CLIENT (créer une demande, etc.) | **Non** — à tester explicitement | absence de route côté prestataire |
| Accéder aux fonctionnalités ADMIN | **Non** — à tester explicitement | admin.controller.ts:6-12 |

---

## 4. Workflows impliquant le PRESTATAIRE

```
PRESTATAIRE consulte les demandes PUBLIEE
PRESTATAIRE envoie un devis            → Devis = ENVOYE
(CLIENT accepte)                       → Devis = ACCEPTE
   Si MODIFICATION → PRESTATAIRE doit soumettre un état des lieux → EDL = EN_ATTENTE
   (CLIENT valide EDL)                 → EtatDesLieux = VALIDE
   (CLIENT refuse EDL)                 → EtatDesLieux = REFUSE → Prestation ANNULEE (devis aVerifier=true)
(CLIENT paie)                          → Prestation = EN_COURS
PRESTATAIRE réalise la prestation
PRESTATAIRE marque "terminé"           → Prestation = A_VALIDER
(CLIENT valide)                        → Prestation = TERMINEE → versement déclenché (À CONFIRMER déclenchement automatique vs manuel admin)
(CLIENT conteste)                      → Prestation repasse EN_COURS (litige)
(auto-validation J+3 sans action client) → TERMINEE
```
Source : prestation.service.ts, autoValidate.job.ts:14-75, payment.controller.ts.

---

## 5. Règles métier PRESTATAIRE

| ID | Fonctionnalité | Règle métier | Source |
|---|---|---|---|
| RG-PRE-001 | Compte | Mot de passe : mêmes règles backend faibles que le client (min 8, sans regex) | auth.controller.ts:13 |
| RG-PRE-002 | Compte | Téléphone prestataire : présence + longueur minimale contrôlées côté backend (à la différence du client où c'est facultatif) — À CONFIRMER contrainte exacte | auth.controller.ts (branche register/prestataire) |
| RG-PRE-003 | Compte | IBAN/BIC/bankName chiffrés au repos via AES-256-GCM avant stockage en base | commit f9852a9 ; user.service.ts (chiffrement) |
| RG-PRE-004 | Disponibilité | Enum Disponibilite à 2 valeurs (DISPONIBLE/INDISPONIBLE) — bascule libre, sans contrainte métier bloquante détectée | schema.prisma |
| RG-PRE-005 | Devis | Le prestataire ne peut envoyer un devis que sur une demande au statut PUBLIEE | devis.service.ts |
| RG-PRE-006 | Devis | montant obligatoire, doit être > 0 | devis.service.ts (validation création) |
| RG-PRE-007 | Devis | delaiRealisation obligatoire | devis.service.ts |
| RG-PRE-008 | Devis | Un prestataire ne peut envoyer qu'un devis par demande (À CONFIRMER : unicité non formellement vérifiée dans le code exploré) | À CONFIRMER |
| RG-PRE-009 | État des lieux | Le prestataire ne peut soumettre un EDL que si le devis est ACCEPTE et typePrestation=MODIFICATION | prestation.service.ts |
| RG-PRE-010 | État des lieux | description obligatoire, photos facultatives (À CONFIRMER contrainte exacte de nombre) | prestation.service.ts |
| RG-PRE-011 | Prestation | Le prestataire ne peut marquer "terminé" que sa propre prestation au statut EN_COURS | prestation.service.ts |
| RG-PRE-012 | Prestation | Passage à A_VALIDER déclenche potentiellement une notification/email au client (À CONFIRMER template exact utilisé à cette étape) | À CONFIRMER |
| RG-PRE-013 | Paiement | Le PaymentIntent Stripe contient l'IBAN déchiffré du prestataire en métadonnée — **anomalie de sécurité confirmée**, voir adminTest.docx §Sécurité | payment.controller.ts (metadata Stripe) |
| RG-PRE-014 | Signalement | Mêmes règles que le client (message min 10 caractères, un seul signalement actif par demande) | signalement.service.ts:8-27 |
| RG-PRE-015 | Messagerie | Mêmes règles que le client (max 1000 car., anti-coordonnées) | message.service.ts:102-115 |

---

## 6. Validations des champs (formulaires PRESTATAIRE)

| Formulaire | Champ | Obligatoire | Contrainte Backend | Contrainte Frontend | Cohérence |
|---|---|---|---|---|---|
| Inscription prestataire | email | Oui | format email | format email | ✅ |
| Inscription prestataire | password | Oui | min 8, sans regex ni max | min 8-12 + regex complexe | ⚠️ incohérent (identique au client) |
| Inscription prestataire | phone | Oui | présence + longueur minimale (À CONFIRMER regex exacte) | regex `^0[67]\d{8}$` | À CONFIRMER |
| Inscription prestataire | siret / raisonSociale (si applicable) | À CONFIRMER | À CONFIRMER | À CONFIRMER | À CONFIRMER |
| Devis | montant | Oui | > 0 | À CONFIRMER | — |
| Devis | delaiRealisation | Oui | présence | À CONFIRMER | — |
| État des lieux | description | Oui | présence (À CONFIRMER longueur min) | À CONFIRMER | — |
| Profil bancaire | iban | Oui (pour recevoir un versement) | format IBAN — À CONFIRMER validation format vs simple présence | À CONFIRMER | — |
| Profil bancaire | bic | Oui | À CONFIRMER | À CONFIRMER | — |

---

## 7. Cas de test — Authentification & Compte spécifique PRESTATAIRE

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-PRE-001 | Prestataire | Auth | Inscription | Aucun compte existant | email inédit, password valide, phone="0698765432", catégorie professionnelle | 1. Aller sur /auth/register/prestataire 2. Remplir tous les champs 3. Soumettre | Compte créé, email de vérification envoyé | POSITIF | CRITIQUE | RG-PRE-001,002 |
| TC-PRE-002 | Prestataire | Auth | Inscription | — | phone manquant | 1. Soumettre sans téléphone | Erreur validation (obligatoire côté prestataire, contrairement au client) | NEGATIF | HAUTE | RG-PRE-002 |
| TC-PRE-003 | Prestataire | Auth | Inscription | Appel API direct | password="abcdefgh" (contourne le frontend) | 1. Appeler l'API directement | Backend accepte (même incohérence que le client) | SECURITE | HAUTE | RG-PRE-001 |
| TC-PRE-004 | Prestataire | Auth | Connexion | Compte prestataire existant | identifiants valides | 1. Se connecter | Connexion réussie, redirection dashboard prestataire (distinct du dashboard client) | POSITIF | CRITIQUE | — |
| TC-PRE-005 | Prestataire | Auth | Connexion croisée | Compte CLIENT existant | identifiants client valides utilisés sur /auth/login prestataire (si route distincte) ou vérification du rôle en session | 1. Se connecter avec un compte client | Le compte client ne doit pas accéder aux fonctionnalités prestataire | SECURITE | CRITIQUE | — |
| TC-PRE-006 | Prestataire | Profil bancaire | Renseigner IBAN | Prestataire connecté | IBAN valide format FR76... | 1. Saisir l'IBAN/BIC dans le profil 2. Sauvegarder | IBAN stocké chiffré (AES-256-GCM) en base — vérifier en base que la valeur brute n'est pas lisible | POSITIF | CRITIQUE | RG-PRE-003 |
| TC-PRE-007 | Prestataire | Profil bancaire | Renseigner IBAN | — | IBAN mal formé "12345" | 1. Soumettre | Vérifier si une validation de format existe (À CONFIRMER) — sinon anomalie à documenter | LIMITE | HAUTE | À CONFIRMER |
| TC-PRE-008 | Prestataire | Profil bancaire | Consulter | IBAN déjà enregistré | — | 1. Ouvrir la page profil | L'IBAN affiché est masqué (ex. FR76 **** **** 1234) et non en clair | SECURITE | HAUTE | RG-PRE-003 |

---

## 8. Cas de test — Disponibilité

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-PRE-009 | Prestataire | Disponibilité | Basculer | Statut actuel = DISPONIBLE | — | 1. Cliquer sur le toggle de disponibilité | Statut passe à INDISPONIBLE, persistance en base | POSITIF | HAUTE | RG-PRE-004 |
| TC-PRE-010 | Prestataire | Disponibilité | Basculer | Statut = INDISPONIBLE, devis en cours d'envoi | — | 1. Passer INDISPONIBLE puis tenter d'envoyer un devis | Vérifier si l'envoi de devis est bloqué en mode indisponible (À CONFIRMER, aucune contrainte croisée détectée) | WORKFLOW | MOYENNE | À CONFIRMER |
| TC-PRE-011 | Prestataire | Disponibilité | Visibilité | Statut = INDISPONIBLE | — | 1. Se connecter en tant que client 2. Rechercher des prestataires | Vérifier si le prestataire indisponible apparaît toujours dans les résultats de recherche (À CONFIRMER logique de filtrage) | LIMITE | MOYENNE | À CONFIRMER |

---

## 9. Cas de test — Devis (côté prestataire)

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-PRE-012 | Prestataire | Devis | Envoyer | Demande au statut PUBLIEE | montant=250, delaiRealisation=5 jours | 1. Ouvrir la demande 2. Remplir le formulaire de devis 3. Soumettre | Devis créé, statut ENVOYE, email quote-received envoyé au client | POSITIF | CRITIQUE | RG-PRE-005,006,007 |
| TC-PRE-013 | Prestataire | Devis | Envoyer | Demande au statut EN_COURS (déjà acceptée) | — | 1. Tenter d'envoyer un devis | Erreur, statut non éligible | WORKFLOW | HAUTE | RG-PRE-005 |
| TC-PRE-014 | Prestataire | Devis | Envoyer | — | montant=0 | 1. Soumettre avec montant=0 | Erreur validation | LIMITE | HAUTE | RG-PRE-006 |
| TC-PRE-015 | Prestataire | Devis | Envoyer | — | montant=-100 | 1. Soumettre un montant négatif via API directe | Erreur validation ou vérifier si accepté (anomalie potentielle) | NEGATIF | HAUTE | RG-PRE-006 |
| TC-PRE-016 | Prestataire | Devis | Envoyer | — | delaiRealisation manquant | 1. Soumettre sans délai | Erreur validation | NEGATIF | HAUTE | RG-PRE-007 |
| TC-PRE-017 | Prestataire | Devis | Envoyer | Devis déjà envoyé par ce prestataire sur cette demande | — | 1. Tenter d'envoyer un second devis sur la même demande | Vérifier si le doublon est bloqué (RG-PRE-008 À CONFIRMER) | LIMITE | MOYENNE | RG-PRE-008 |
| TC-PRE-018 | Prestataire | Devis | Consulter | Devis envoyés par un autre prestataire | — | 1. Tenter de consulter le devis d'un confrère via API directe (autre prestataireId) | 403 Forbidden | SECURITE | CRITIQUE | devis.service.ts |
| TC-PRE-019 | Prestataire | Devis | Consulter | Devis propres | — | 1. Ouvrir "Mes devis" | Liste correcte, statuts à jour (ENVOYE/ACCEPTE/REFUSE) | POSITIF | MOYENNE | — |

---

## 10. Cas de test — État des lieux (côté prestataire)

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-PRE-020 | Prestataire | État des lieux | Soumettre | Devis ACCEPTE, typePrestation=MODIFICATION | description="Fuite constatée sous évier, tuyau à remplacer", 2 photos | 1. Soumettre l'EDL | EDL créé, statut EN_ATTENTE, client notifié | POSITIF | CRITIQUE | RG-PRE-009,010 |
| TC-PRE-021 | Prestataire | État des lieux | Soumettre | typePrestation=CREATION | — | 1. Tenter de soumettre un EDL sur une prestation de type CREATION | Erreur, EDL non applicable à ce type | WORKFLOW | HAUTE | RG-PRE-009 |
| TC-PRE-022 | Prestataire | État des lieux | Soumettre | Devis non encore ACCEPTE | — | 1. Tenter de soumettre un EDL prématurément | Erreur, statut non éligible | WORKFLOW | HAUTE | RG-PRE-009 |
| TC-PRE-023 | Prestataire | État des lieux | Soumettre | — | description vide | 1. Soumettre sans description | Erreur validation (À CONFIRMER message exact) | NEGATIF | HAUTE | RG-PRE-010 |
| TC-PRE-024 | Prestataire | État des lieux | Soumettre | Prestation d'un autre prestataire | — | 1. Tenter via API directe | 403 Forbidden | SECURITE | CRITIQUE | prestation.service.ts |
| TC-PRE-025 | Prestataire | État des lieux | Re-soumettre | EDL REFUSE par le client | — | 1. Vérifier si le prestataire peut soumettre un nouvel EDL après refus, ou si la prestation est définitivement ANNULEE | Selon RG-CLI-013, la prestation est ANNULEE — aucune re-soumission possible ; le prestataire devrait renvoyer un nouveau devis sur la demande republiée | WORKFLOW | HAUTE | RG-CLI-013 (clientTest.docx) |

---

## 11. Cas de test — Prestation (côté prestataire)

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-PRE-026 | Prestataire | Prestation | Marquer terminé | Prestation EN_COURS | — | 1. Cliquer "Marquer comme terminé" | Statut passe à A_VALIDER, client notifié | POSITIF | CRITIQUE | RG-PRE-011 |
| TC-PRE-027 | Prestataire | Prestation | Marquer terminé | Prestation déjà A_VALIDER | — | 1. Tenter de remarquer terminé | Erreur (transition refusée) | WORKFLOW | HAUTE | RG-PRE-011 |
| TC-PRE-028 | Prestataire | Prestation | Marquer terminé | Prestation EN_ATTENTE_PAIEMENT (non encore payée) | — | 1. Tenter de marquer terminé avant paiement | Erreur, statut non éligible | WORKFLOW | HAUTE | RG-PRE-011 |
| TC-PRE-029 | Prestataire | Prestation | Marquer terminé | Prestation d'un autre prestataire | — | 1. Tenter via API directe | 403 Forbidden | SECURITE | CRITIQUE | prestation.service.ts |
| TC-PRE-030 | Prestataire | Prestation | Consulter | Prestations en cours | — | 1. Ouvrir "Mes prestations" | Liste correcte, filtrable par statut | POSITIF | MOYENNE | — |
| TC-PRE-031 | Prestataire | Prestation | Litige | Client conteste la prestation | — | 1. Vérifier la notification/affichage côté prestataire d'une contestation | Prestataire informé, prestation repasse EN_COURS visible dans son suivi | WORKFLOW | HAUTE | RG-CLI-018 (clientTest.docx) |

---

## 12. Cas de test — Réputation / Portfolio (fonctionnalités non confirmées)

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-PRE-032 | Prestataire | Réputation | Consulter note moyenne | Plusieurs avis reçus avec notes différentes | — | 1. Ouvrir le profil prestataire (vue publique ou privée) | Vérifier si une moyenne est affichée et si elle correspond réellement à la moyenne des avis en base — **fonctionnalité potentiellement non opérationnelle**, à confirmer avant de conclure à un bug | LIMITE | MOYENNE | À CONFIRMER |
| TC-PRE-033 | Prestataire | Portfolio | Ajouter une réalisation | — | — | 1. Chercher une fonctionnalité d'ajout de portfolio dans l'UI/API | Confirmée absente du code — ne pas remonter comme bug, uniquement comme point de couverture non applicable | N/A | N/A | Absence confirmée |

---

## 13. Cas de test — Signalement (côté prestataire)

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-PRE-034 | Prestataire | Signalement | Créer | Demande EN_COURS | message="Le client ne répond pas pour donner accès au logement" | 1. Signaler | Signalement créé | POSITIF | HAUTE | RG-PRE-014 |
| TC-PRE-035 | Prestataire | Signalement | Créer | — | message="court" | 1. Soumettre via API directe | Erreur "MESSAGE_TROP_COURT" | LIMITE | MOYENNE | RG-PRE-014 |
| TC-PRE-036 | Prestataire | Signalement | Créer | Signalement déjà actif | — | 1. Tenter un second signalement | Erreur, refus | NEGATIF | MOYENNE | RG-PRE-014 |

---

## 14. Cas de test — Messagerie (côté prestataire)

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-PRE-037 | Prestataire | Messagerie | Envoyer | Prestation active | message valide | 1. Envoyer un message | Message enregistré, visible du client | POSITIF | HAUTE | RG-PRE-015 |
| TC-PRE-038 | Prestataire | Messagerie | Envoyer | — | message contenant un numéro de téléphone | 1. Envoyer | Rejeté par la détection regex | LIMITE | MOYENNE | RG-PRE-015 |
| TC-PRE-039 | Prestataire | Messagerie | Envoyer | Conversation n'impliquant pas ce prestataire | — | 1. Tenter via API directe | 403 Forbidden | SECURITE | CRITIQUE | message.service.ts:3-18 |

---

## 15. Anomalies / points à vérifier — PRESTATAIRE

| ID | Fonctionnalité | Observation | Risque | Source | Question QA |
|---|---|---|---|---|---|
| AN-PRE-001 | Paiement | L'IBAN déchiffré du prestataire est transmis dans les métadonnées du PaymentIntent Stripe | Exposition de données bancaires sensibles côté Stripe (tiers), potentiellement visible dans les logs Stripe/dashboard | payment.controller.ts (metadata) | Est-il nécessaire d'envoyer l'IBAN en clair dans les métadonnées Stripe, ou peut-on n'y stocker qu'un identifiant interne ? |
| AN-PRE-002 | Réputation | Aucun mécanisme de calcul/agrégation de note moyenne trouvé avec certitude | Le prestataire et le client peuvent voir une information de réputation trompeuse ou absente | recherche exhaustive | La fonctionnalité de note moyenne est-elle prévue, en cours, ou abandonnée ? |
| AN-PRE-003 | Portfolio | Fonctionnalité absente du code alors qu'elle pourrait être attendue dans une marketplace de prestataires | Écart possible avec les spécifications produit | recherche exhaustive | Le portfolio est-il dans la roadmap ou définitivement hors périmètre ? |
| AN-PRE-004 | Devis | Aucune contrainte d'unicité de devis par prestataire/demande formellement confirmée | Un prestataire pourrait potentiellement envoyer plusieurs devis concurrents sur la même demande | devis.service.ts | Un prestataire doit-il être limité à un seul devis actif par demande ? |
| AN-PRE-005 | Disponibilité | Aucune contrainte croisée détectée entre statut INDISPONIBLE et capacité à envoyer un devis | Un prestataire "indisponible" pourrait quand même recevoir/traiter des missions, ce qui peut ne pas correspondre à l'intention produit | recherche exhaustive | Le statut Disponibilité doit-il bloquer l'envoi de devis ou la visibilité dans les recherches client ? |
| AN-PRE-006 | Versement | Le déclenchement du versement au prestataire après TERMINEE n'a pas été localisé avec certitude comme automatique | Risque d'incompréhension sur le délai réel de paiement au prestataire | À CONFIRMER | Le versement est-il déclenché automatiquement après validation client, ou nécessite-t-il une action admin manuelle ? |

---

## 16. Priorisation P0-P3 — PRESTATAIRE

**P0 — Critique** : TC-PRE-001, 004, 005, 006, 012, 018, 020, 024, 026, 029, 039

**P1 — Haute** : TC-PRE-002, 003, 007, 008, 009, 013 à 017, 021 à 023, 025, 027, 028, 031, 034, 037

**P2 — Moyenne** : TC-PRE-010, 011, 019, 030, 032, 035, 036, 038

**P3 — Basse** : TC-PRE-033 (N/A — absence confirmée, ne compte pas dans la couverture)
