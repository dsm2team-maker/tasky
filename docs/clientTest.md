# Référentiel de tests fonctionnels — TASKY
## Profil CLIENT

---

## 1. Résumé et périmètre

Ce document couvre l'intégralité des fonctionnalités accessibles au profil **CLIENT** de l'application Tasky, telles qu'implémentées dans le code réel (backend Express/Prisma, frontend Next.js). Toutes les règles métier et validations citées sont sourcées (fichier:ligne). Lorsqu'une information n'est pas déductible du code, elle est marquée **À CONFIRMER**. Les tests transverses (multi-profils, paiement, sécurité, cohérence des données) sont regroupés dans `adminTest.docx`.

---

## 2. Cartographie fonctionnelle CLIENT

```
CLIENT
├── Authentification & Compte
│     ├── Inscription
│     ├── Connexion / Déconnexion
│     ├── Mot de passe oublié → Reset password
│     ├── Vérification email
│     ├── Récupération email perdu (OTP téléphone)
│     ├── Changement téléphone (OTP)
│     ├── Changement email (OTP)
│     └── Suppression de compte (OTP)
├── Demandes
│     ├── Créer une demande
│     ├── Consulter mes demandes / détail
│     └── Supprimer une demande (si statut non bloquant)
├── Devis
│     ├── Consulter les devis reçus
│     ├── Accepter un devis
│     └── Refuser un devis
├── État des lieux (si typePrestation = MODIFICATION)
│     ├── Consulter
│     ├── Valider
│     └── Refuser
├── Paiement
│     ├── Créer une intention de paiement (Stripe)
│     └── Confirmer le paiement
├── Suivi de prestation
│     ├── Consulter le statut
│     ├── Valider la fin de prestation
│     └── Contester la prestation
├── Avis
│     └── Déposer un avis (note 1-5 + commentaire)
├── Signalement
│     └── Signaler un problème sur une demande
├── Messagerie
│     ├── Consulter une conversation
│     └── Envoyer un message
└── Profil
      └── Consulter / modifier mes informations
```

**Fonctionnalité absente confirmée** : aucune route/UI de modification d'une demande existante n'a été trouvée dans le code — à ne pas tester comme un bug manquant.

---

## 3. Droits et restrictions CLIENT

| Fonctionnalité | Client | Contrainte d'accès | Source |
|---|---|---|---|
| Créer une demande | Oui | authentifié, role=CLIENT implicite (profil Client requis) | demande.controller.ts:13 |
| Consulter une demande | Oui, uniquement la sienne | `demande.clientId !== client.id` → 403 | demande.service.ts:114 |
| Supprimer une demande | Oui, uniquement la sienne, statut non bloquant | demande.service.ts:128-140 | 
| Accepter/refuser un devis | Oui, uniquement sur ses demandes | devis.service.ts:238,350 |
| Valider/refuser un état des lieux | Oui, uniquement sur ses prestations | prestation.service.ts:160-172,195-198 |
| Créer un paiement | Oui, uniquement sur ses prestations | payment.controller.ts:34-36 |
| Valider/contester une prestation | Oui, uniquement les siennes | prestation.service.ts:395-396,444-445 |
| Déposer un avis | Oui, uniquement si prestation TERMINEE, une fois | prestation.service.ts:517-520 |
| Signaler un problème | Oui, uniquement sur ses demandes actives | signalement.service.ts:17-27 |
| Envoyer un message | Oui, uniquement s'il est partie prenante (client ou prestataire) | message.service.ts:3-18 |
| Accéder aux fonctionnalités PRESTATAIRE (envoyer un devis, etc.) | **Non** — à tester explicitement | absence de route côté client |
| Accéder aux fonctionnalités ADMIN | **Non** — à tester explicitement | admin.controller.ts:6-12 (`isAdmin()`) |

---

## 4. Workflows impliquant le CLIENT

```
CLIENT crée demande        → Demande = PUBLIEE
(PRESTATAIRE envoie devis) → Devis = ENVOYE
CLIENT accepte devis       → Devis = ACCEPTE
   Si typePrestation = MODIFICATION → Demande/Prestation = EN_ATTENTE_INSPECTION
   Si typePrestation = CREATION     → Demande/Prestation = EN_ATTENTE_PAIEMENT (saut direct)
(PRESTATAIRE soumet état des lieux) → EtatDesLieux = EN_ATTENTE
CLIENT valide EDL   → EtatDesLieux = VALIDE, Demande/Prestation = EN_ATTENTE_PAIEMENT
CLIENT refuse EDL   → EtatDesLieux = REFUSE, Devis = REFUSE(aVerifier=true), Demande = PUBLIEE, Prestation = ANNULEE
CLIENT paie (Stripe) → Demande/Prestation = EN_COURS
(PRESTATAIRE marque terminé) → Prestation = A_VALIDER
CLIENT valide la fin       → Demande/Prestation = TERMINEE (email envoyé, avis possible)
CLIENT conteste la fin     → Prestation = EN_COURS (litige)
(pas d'action à J+3)       → auto-validation cron → TERMINEE
```
Source : prestation.service.ts (lignes citées en §5 ci-dessous), payment.controller.ts:138-212, autoValidate.job.ts:14-75.

---

## 5. Règles métier CLIENT

| ID | Fonctionnalité | Règle métier | Source |
|---|---|---|---|
| RG-CLI-001 | Demande | Titre obligatoire, min 5 caractères (trim) | demande.controller.ts:13 |
| RG-CLI-002 | Demande | Description obligatoire, min 20 caractères (trim) | demande.controller.ts:15 |
| RG-CLI-003 | Demande | typePrestation obligatoire, enum MODIFICATION/CREATION/FORMATION | demande.controller.ts:17 |
| RG-CLI-004 | Demande | categoryId obligatoire (présence uniquement) | demande.controller.ts:19 |
| RG-CLI-005 | Demande | Photos facultatives, max 2 | demande.controller.ts:21 |
| RG-CLI-006 | Demande | Budget facultatif, doit être > 0 si fourni | demande.controller.ts:24-26 |
| RG-CLI-007 | Demande | delaiJours obligatoire, entier entre 1 et 365 | demande.controller.ts:28-30 |
| RG-CLI-008 | Demande | urgence facultative, défaut "NORMAL" si absente | demande.controller.ts:43 |
| RG-CLI-009 | Demande | Suppression interdite si statut dans une liste bloquante (EN_ATTENTE_INSPECTION, EN_ATTENTE_PAIEMENT, EN_COURS À CONFIRMER liste exacte) | demande.service.ts:129-140 |
| RG-CLI-010 | Devis | Le client ne peut accepter/refuser qu'un devis au statut ENVOYE | devis.service.ts:238,350 |
| RG-CLI-011 | Devis | L'acceptation d'un devis (typePrestation=CREATION) refuse automatiquement les autres devis concurrents | devis.service.ts:275-278 |
| RG-CLI-012 | État des lieux | Le client ne peut valider/refuser un EDL qu'au statut EN_ATTENTE | prestation.service.ts:160-161 |
| RG-CLI-013 | État des lieux | Refus de l'EDL par le client → prestation ANNULEE, demande repasse PUBLIEE, devis repasse REFUSE avec `aVerifier=true` | prestation.service.ts:195-215 |
| RG-CLI-014 | Paiement | Le client ne peut créer un paiement que si la prestation est EN_ATTENTE_PAIEMENT et lui appartient | payment.controller.ts:34-40 |
| RG-CLI-015 | Paiement | Montant envoyé à Stripe = montantFinal ?? montant, en centimes, devise EUR fixe | payment.controller.ts:42-59 |
| RG-CLI-016 | Paiement | Un PaymentIntent existant non succeeded/canceled est réutilisé (pas de doublon) | payment.controller.ts:50-55 |
| RG-CLI-017 | Prestation | Le client ne peut valider/contester qu'une prestation au statut A_VALIDER | prestation.service.ts:395-396,444-445 |
| RG-CLI-018 | Prestation | Contestation : motif requis, **aucune longueur minimale vérifiée côté backend** (contrôle uniquement affiché côté front, maxLength=500) | prestation.service.ts:454-464 ; front src/app/client/requests/[id]/page.tsx:623 |
| RG-CLI-019 | Prestation | Auto-validation automatique à J+3 si le client ne valide/conteste pas | autoValidate.job.ts:14-15 |
| RG-CLI-020 | Avis | Note obligatoire, entière, bornée 1-5 ; un seul avis par prestation ; uniquement si TERMINEE | prestation.service.ts:517-520 |
| RG-CLI-021 | Signalement | Message obligatoire, min 10 caractères (backend), **aucun contrôle de longueur détecté côté frontend** | signalement.service.ts:8-9 ; front page.tsx:965 |
| RG-CLI-022 | Signalement | Un seul signalement actif par demande à la fois | signalement.service.ts:24-27 |
| RG-CLI-023 | Signalement | Demande doit être dans un statut actif (EN_COURS, A_VALIDER, EN_ATTENTE_PAIEMENT, EN_ATTENTE_INSPECTION) | signalement.service.ts:19-21 |
| RG-CLI-024 | Messagerie | Message obligatoire, non vide (trim), max 1000 caractères, détection regex email/téléphone bloquante | message.service.ts:102-115 |
| RG-CLI-025 | Compte | Mot de passe : backend register min 8 caractères sans regex ni max ; frontend impose 8-12 caractères + majuscule/minuscule/chiffre/spécial | auth.controller.ts:13 ; src/lib/schemas.ts:10-17 |
| RG-CLI-026 | Compte | Téléphone : facultatif et sans contrôle de format côté backend inscription ; obligatoire + regex `^0[67]\d{8}$` côté frontend | auth.controller.ts:17 ; src/lib/schemas.ts:20-27,37 |
| RG-CLI-027 | Compte | Reset password : backend n'impose **aucune** contrainte de longueur/complexité sur le nouveau mot de passe | auth.service.ts:111-133 |
| RG-CLI-028 | Compte | OTP (téléphone/email/suppression) : 6 chiffres, expire à 10 minutes, cooldown 2 minutes entre deux demandes, max 5 tentatives | token.utils.ts:22-28 ; user.service.ts:8-9,129-146 |
| RG-CLI-029 | Compte | Changement d'email : backend vérifie seulement `newEmail.includes("@")`, pas un vrai format email | user.controller.ts:308 |
| RG-CLI-030 | Compte | Reset password / logout ne révoquent pas les autres sessions actives | auth.service.ts:111-133 ; auth.controller.ts:179-188 |

---

## 6. Validations des champs (formulaires CLIENT)

| Formulaire | Champ | Obligatoire | Contrainte Backend | Contrainte Frontend | Cohérence |
|---|---|---|---|---|---|
| Inscription | email | Oui | format email | format email + toLowerCase | ✅ |
| Inscription | password | Oui | min 8, sans max ni regex | min 8, max 12, regex complexe | ⚠️ incohérent |
| Inscription | firstName | Oui | min 2 | min 2 | ✅ |
| Inscription | lastName | Oui | min 2 | min 2 | ✅ |
| Inscription | city | Oui | min 2 | min 2 | ✅ |
| Inscription | phone | Non | aucun contrôle format | Oui, regex `^0[67]\d{8}$` | ⚠️ incohérent |
| Connexion | email | Oui | format email | format email | ✅ |
| Connexion | password | Oui | non vide | non vide | ✅ |
| Mot de passe oublié | email | Oui | présence seulement, pas de `.email()` | format email | ⚠️ incohérent |
| Reset password | token | Oui | présence | — | — |
| Reset password | password | Oui | **aucune règle** | min 8 seulement | ⚠️ incohérent |
| Changement téléphone | newPhone | Oui | regex `^0[67]\d{8}$` | idem | ✅ |
| Changement téléphone | otp | Oui | 6 chiffres exact | 6 chiffres, maxLength=6 | ✅ |
| Changement email | newEmail | Oui | `includes("@")` seulement | `.email()` | ⚠️ incohérent |
| Suppression compte | otp | Oui | 6 chiffres | 6 chiffres | ✅ |
| Créer une demande | titre | Oui | min 5 (trim) | schéma zod dédié **non trouvé** | À CONFIRMER |
| Créer une demande | description | Oui | min 20 (trim) | À CONFIRMER | À CONFIRMER |
| Créer une demande | delaiJours | Oui | entier 1-365 | À CONFIRMER | À CONFIRMER |
| Créer une demande | budget | Non | > 0 si fourni | À CONFIRMER | À CONFIRMER |
| Créer une demande | photos | Non | max 2 | À CONFIRMER | À CONFIRMER |
| Contestation prestation | motif | Oui (implicite) | **aucune longueur min/max** | maxLength=500 | ⚠️ contrainte frontend seule |
| Signalement | message | Oui | min 10 (trim) | **aucun contrôle détecté** | ⚠️ contrainte backend seule |
| Messagerie | contenu | Oui | max 1000, non vide, regex anti email/tel | maxLength=1000 | ✅ |
| Avis | rating | Oui | number, 1-5 | À CONFIRMER | — |
| Avis | comment | Non | aucune contrainte de longueur | À CONFIRMER | — |

---

## 7. Cas de test — Authentification & Compte

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-CLI-001 | Client | Auth | Inscription | Aucun compte avec cet email | email valide inédit, password="Test1234!", firstName="Jean", lastName="Dupont", city="Paris", phone="0612345678" | 1. Aller sur /auth/register/client 2. Renseigner tous les champs valides 3. Cocher CGU 4. Soumettre | Compte créé, redirection, email de vérification envoyé (job "verify-email") | POSITIF | CRITIQUE | RG-CLI-025 |
| TC-CLI-002 | Client | Auth | Inscription | — | email déjà utilisé par un compte existant | 1. Renseigner un email déjà enregistré 2. Soumettre | Erreur "email déjà utilisé", aucun compte créé | NEGATIF | HAUTE | — |
| TC-CLI-003 | Client | Auth | Inscription | — | password = "abcdefgh" (8 car., pas de majuscule/chiffre/spécial) | 1. Soumettre le formulaire avec ce mot de passe | Frontend bloque (regex complexe non respectée) | LIMITE | HAUTE | RG-CLI-025 |
| TC-CLI-004 | Client | Auth | Inscription | Contournement du frontend (appel API direct, ex. Postman) | password="abcdefgh" (respecte min 8 backend, pas la regex frontend) | 1. Appeler POST /api/auth/register/client directement avec ce mot de passe | Backend accepte (aucune regex de complexité) — confirme l'incohérence RG-CLI-025 | SECURITE | HAUTE | RG-CLI-025 |
| TC-CLI-005 | Client | Auth | Inscription | Appel API direct | phone="123" (invalide) | 1. Appeler l'API d'inscription avec ce téléphone | Backend accepte car aucun contrôle de format (RG-CLI-026) — à valider comme anomalie | SECURITE | MOYENNE | RG-CLI-026 |
| TC-CLI-006 | Client | Auth | Connexion | Compte existant et vérifié | email/password valides | 1. Aller sur /auth/login 2. Saisir identifiants valides 3. Soumettre | Connexion réussie, access token + refresh token émis, redirection dashboard | POSITIF | CRITIQUE | — |
| TC-CLI-007 | Client | Auth | Connexion | Compte existant | mot de passe erroné | 1. Saisir email valide + mauvais mot de passe 2. Soumettre | Erreur "identifiants invalides", pas de token émis | NEGATIF | CRITIQUE | — |
| TC-CLI-008 | Client | Auth | Connexion | — | email inexistant | 1. Saisir un email non enregistré | Erreur générique (pas de fuite d'information sur l'existence du compte) — À CONFIRMER le wording exact | NEGATIF | HAUTE | — |
| TC-CLI-009 | Client | Auth | Déconnexion | Utilisateur connecté sur 2 appareils/onglets | — | 1. Se connecter sur onglet A et onglet B 2. Se déconnecter depuis l'onglet A | Le refresh token de l'onglet A est supprimé ; l'onglet B reste connecté (RG-CLI-030) | WORKFLOW | MOYENNE | RG-CLI-030 |
| TC-CLI-010 | Client | Auth | Mot de passe oublié | Compte existant | email valide | 1. Aller sur /auth/forgot-password 2. Saisir l'email 3. Soumettre | Email "reset-password" envoyé (job en queue), token stocké en base (verification_tokens, type=PASSWORD_RESET, expire 1h) | POSITIF | CRITIQUE | RG-CLI-027 |
| TC-CLI-011 | Client | Auth | Reset password | Token valide récupéré en base (cf. procédure manuelle) | nouveau password="a" (1 caractère) | 1. Ouvrir /auth/reset-password?token=xxx 2. Saisir "a" comme nouveau mot de passe côté API directe (contournement front) | Backend accepte un mot de passe d'1 caractère (RG-CLI-027) — anomalie à documenter | LIMITE | HAUTE | RG-CLI-027 |
| TC-CLI-012 | Client | Auth | Reset password | Token expiré (>1h) | — | 1. Utiliser un token de plus d'1h | Erreur "token expiré ou invalide" | LIMITE | HAUTE | — |
| TC-CLI-013 | Client | Auth | Reset password | Token déjà utilisé | — | 1. Réutiliser un token déjà consommé | Erreur, refus de réinitialisation | NEGATIF | HAUTE | — |
| TC-CLI-014 | Client | Auth | Changement téléphone | Client connecté, profil complet | newPhone="0698765432" | 1. Demander un OTP 2. Récupérer l'OTP (base ou SMS) 3. Le saisir dans les 10 min | Téléphone mis à jour, alerte envoyée sur l'ancien moyen de contact si applicable | POSITIF | HAUTE | RG-CLI-028 |
| TC-CLI-015 | Client | Auth | Changement téléphone | OTP généré | attendre 11 minutes | 1. Saisir l'OTP après expiration | Erreur "OTP expiré" | LIMITE | HAUTE | RG-CLI-028 |
| TC-CLI-016 | Client | Auth | Changement téléphone | OTP généré | saisir un OTP incorrect 5 fois de suite | 1. Saisir un mauvais code 5 fois | Après la 5ème tentative, blocage "OTP_MAX_ATTEMPTS" | LIMITE | HAUTE | RG-CLI-028 |
| TC-CLI-017 | Client | Auth | Changement téléphone | OTP déjà demandé il y a <2 min | redemander un OTP | 1. Cliquer "renvoyer le code" avant 2 minutes | Erreur cooldown avec délai restant affiché | LIMITE | MOYENNE | RG-CLI-028 |
| TC-CLI-018 | Client | Auth | Changement email | Client connecté | newEmail="test@" (format limite invalide) | 1. Appeler l'API directement avec cet email | Backend accepte (contrôle `includes("@")` uniquement) — anomalie RG-CLI-029 | SECURITE | MOYENNE | RG-CLI-029 |
| TC-CLI-019 | Client | Auth | Suppression compte | Client connecté | OTP valide | 1. Demander suppression 2. Saisir OTP valide | Compte anonymisé/supprimé, déconnexion forcée | POSITIF | HAUTE | RG-CLI-028 |
| TC-CLI-020 | Client | Auth | Vérification email | Lien de vérification (token 24h) | — | 1. Ouvrir le lien de vérification reçu | Email marqué vérifié | POSITIF | HAUTE | token.utils.ts:9-13 |
| TC-CLI-021 | Client | Auth | Récupération email perdu | Téléphone connu du compte | OTP reçu par SMS (À CONFIRMER canal réel en environnement de test) | 1. Demander récupération via téléphone 2. Saisir OTP | Email du compte révélé/récupéré | POSITIF | MOYENNE | — |
| TC-CLI-022 | Client | Sécurité | Accès sans authentification | Non connecté | — | 1. Appeler un endpoint protégé (ex. GET /api/demandes) sans header Authorization | 401 Unauthorized | SECURITE | CRITIQUE | auth.middleware.ts:10-36 |
| TC-CLI-023 | Client | Sécurité | Token expiré | Access token expiré (7j) | — | 1. Appeler un endpoint protégé avec un token expiré | 401, frontend déclenche le refresh automatique ou déconnexion | SECURITE | HAUTE | jwt.ts:15-26 |

---

## 8. Cas de test — Demandes

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-CLI-024 | Client | Demande | Créer | Client connecté et profil valide | titre="Réparation fuite", description 20+ car., categoryId valide, delaiJours=15 | 1. Aller sur "Créer une demande" 2. Remplir tous les champs obligatoires 3. Soumettre | Demande créée, statut PUBLIEE | POSITIF | CRITIQUE | RG-CLI-001 à 004,007 |
| TC-CLI-025 | Client | Demande | Créer | — | titre="Aide" (4 caractères) | 1. Soumettre avec ce titre | Erreur validation "titre trop court" | LIMITE | HAUTE | RG-CLI-001 |
| TC-CLI-026 | Client | Demande | Créer | — | titre="Aide!" (exactement 5 caractères) | 1. Soumettre | Acceptée (limite basse exacte) | LIMITE | MOYENNE | RG-CLI-001 |
| TC-CLI-027 | Client | Demande | Créer | — | description = 19 caractères | 1. Soumettre | Erreur validation | LIMITE | HAUTE | RG-CLI-002 |
| TC-CLI-028 | Client | Demande | Créer | — | description = exactement 20 caractères | 1. Soumettre | Acceptée | LIMITE | MOYENNE | RG-CLI-002 |
| TC-CLI-029 | Client | Demande | Créer | — | delaiJours=0 | 1. Soumettre | Erreur validation (hors plage 1-365) | LIMITE | HAUTE | RG-CLI-007 |
| TC-CLI-030 | Client | Demande | Créer | — | delaiJours=366 | 1. Soumettre | Erreur validation | LIMITE | HAUTE | RG-CLI-007 |
| TC-CLI-031 | Client | Demande | Créer | — | delaiJours=1 puis delaiJours=365 | 1. Soumettre les deux valeurs limites | Les deux acceptées | LIMITE | MOYENNE | RG-CLI-007 |
| TC-CLI-032 | Client | Demande | Créer | — | budget=-50 | 1. Soumettre avec un budget négatif | Erreur validation | NEGATIF | HAUTE | RG-CLI-006 |
| TC-CLI-033 | Client | Demande | Créer | — | budget=0 | 1. Soumettre | À déterminer : 0 est-il valide (> 0 strict) ? Vérifier erreur attendue | LIMITE | MOYENNE | RG-CLI-006 |
| TC-CLI-034 | Client | Demande | Créer | — | 3 photos jointes | 1. Joindre 3 photos et soumettre | Erreur ou rejet des photos excédentaires (max 2) | LIMITE | MOYENNE | RG-CLI-005 |
| TC-CLI-035 | Client | Demande | Créer | — | categoryId manquant | 1. Soumettre sans catégorie | Erreur validation "catégorie requise" | NEGATIF | HAUTE | RG-CLI-004 |
| TC-CLI-036 | Client | Demande | Créer | — | tous champs valides sauf typePrestation absent | 1. Soumettre sans typePrestation | Erreur validation | NEGATIF | HAUTE | RG-CLI-003 |
| TC-CLI-037 | Client | Demande | Créer | — | titre = 500 caractères (très long) | 1. Soumettre un titre très long | Vérifier comportement (aucune limite haute trouvée côté backend/DB — comportement à confirmer) | LIMITE | BASSE | À CONFIRMER |
| TC-CLI-038 | Client | Demande | Créer | — | titre avec caractères spéciaux et accents "Réparation « fuite » — étanchéité" | 1. Soumettre | Accepté, affichage correct (pas d'échappement cassé) | LIMITE | MOYENNE | — |
| TC-CLI-039 | Client | Demande | Consulter | Demande créée par un autre client | ID de la demande d'autrui | 1. Appeler GET /api/demandes/:id avec l'ID d'une demande d'un autre client | 403 Forbidden | SECURITE | CRITIQUE | demande.service.ts:114 |
| TC-CLI-040 | Client | Demande | Supprimer | Demande au statut PUBLIEE (non bloquant) | — | 1. Supprimer la demande | Statut passe à SUPPRIMEE | POSITIF | HAUTE | RG-CLI-009 |
| TC-CLI-041 | Client | Demande | Supprimer | Demande au statut EN_COURS (bloquant) | — | 1. Tenter de supprimer | Erreur, suppression refusée | NEGATIF | HAUTE | RG-CLI-009 |
| TC-CLI-042 | Client | Demande | Supprimer | Demande appartenant à un autre client | — | 1. Tenter de supprimer une demande d'autrui via API | 403 Forbidden | SECURITE | CRITIQUE | demande.service.ts:128 |

---

## 9. Cas de test — Devis

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-CLI-043 | Client | Devis | Consulter | Demande avec devis reçus | — | 1. Ouvrir le détail de la demande | Liste des devis affichée avec montant, délai, prestataire | POSITIF | HAUTE | — |
| TC-CLI-044 | Client | Devis | Accepter | Devis au statut ENVOYE | — | 1. Cliquer "Accepter" sur un devis | Devis=ACCEPTE, demande/prestation passe EN_ATTENTE_INSPECTION ou EN_ATTENTE_PAIEMENT selon typePrestation | POSITIF | CRITIQUE | RG-CLI-010 |
| TC-CLI-045 | Client | Devis | Accepter | Devis déjà REFUSE | — | 1. Tenter d'accepter un devis déjà refusé | Erreur, transition refusée | WORKFLOW | HAUTE | RG-CLI-010 |
| TC-CLI-046 | Client | Devis | Accepter | Demande avec 2 devis ENVOYE, typePrestation=CREATION | — | 1. Accepter le devis A | Devis A = ACCEPTE, devis B = REFUSE automatiquement | WORKFLOW | HAUTE | RG-CLI-011 |
| TC-CLI-047 | Client | Devis | Refuser | Devis au statut ENVOYE | — | 1. Cliquer "Refuser" | Devis=REFUSE, email "devis-refuse" envoyé au prestataire | POSITIF | HAUTE | — |
| TC-CLI-048 | Client | Devis | Accepter | Devis d'une demande appartenant à un autre client | — | 1. Tenter d'accepter via API directe avec l'ID d'un devis lié à un autre client | 403 Forbidden | SECURITE | CRITIQUE | devis.service.ts:238 |
| TC-CLI-049 | Client | Devis | Accepter | Devis déjà ACCEPTE | — | 1. Tenter d'accepter à nouveau le même devis | Erreur (transition ACCEPTE→ACCEPTE refusée) | WORKFLOW | MOYENNE | RG-CLI-010 |

---

## 10. Cas de test — État des lieux

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-CLI-050 | Client | État des lieux | Consulter | EDL soumis par le prestataire | — | 1. Ouvrir la prestation | EDL affiché avec description/photos | POSITIF | HAUTE | — |
| TC-CLI-051 | Client | État des lieux | Valider | EDL au statut EN_ATTENTE | — | 1. Cliquer "Valider" | EDL=VALIDE, demande/prestation → EN_ATTENTE_PAIEMENT | POSITIF | CRITIQUE | RG-CLI-012 |
| TC-CLI-052 | Client | État des lieux | Refuser | EDL au statut EN_ATTENTE | motif de refus | 1. Cliquer "Refuser" avec motif | EDL=REFUSE, prestation=ANNULEE, demande=PUBLIEE, devis=REFUSE(aVerifier=true) | POSITIF | CRITIQUE | RG-CLI-013 |
| TC-CLI-053 | Client | État des lieux | Valider | EDL déjà VALIDE | — | 1. Tenter de revalider | Erreur (transition refusée, statut déjà VALIDE) | WORKFLOW | HAUTE | RG-CLI-012 |
| TC-CLI-054 | Client | État des lieux | Valider | EDL d'une prestation d'un autre client | — | 1. Tenter via API directe | 403 Forbidden | SECURITE | CRITIQUE | prestation.service.ts:158 |

---

## 11. Cas de test — Paiement (côté client)

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-CLI-055 | Client | Paiement | Créer intention | Prestation EN_ATTENTE_PAIEMENT, carte de test Stripe valide (4242...) | — | 1. Lancer le paiement 2. Saisir une carte de test valide | PaymentIntent créé, montant correct affiché | POSITIF | CRITIQUE | RG-CLI-014,015 |
| TC-CLI-056 | Client | Paiement | Créer intention | Prestation déjà EN_COURS | — | 1. Tenter de créer un paiement sur une prestation déjà payée | 400 "statut incorrect" | NEGATIF | HAUTE | RG-CLI-014 |
| TC-CLI-057 | Client | Paiement | Créer intention | Prestation d'un autre client | — | 1. Tenter via API directe | 403 Forbidden | SECURITE | CRITIQUE | payment.controller.ts:34-36 |
| TC-CLI-058 | Client | Paiement | Créer intention | Rechargement de page pendant un paiement en cours | — | 1. Lancer un paiement 2. Recharger la page avant confirmation 3. Relancer le paiement | Le même PaymentIntent est réutilisé (pas de doublon Stripe) | REGRESSION | HAUTE | RG-CLI-016 |
| TC-CLI-059 | Client | Paiement | Confirmer | Carte refusée par Stripe (carte de test 4000000000000002) | — | 1. Payer avec une carte refusée | Erreur affichée, prestation reste EN_ATTENTE_PAIEMENT, aucune notification envoyée (absence confirmée) | NEGATIF | HAUTE | — |
| TC-CLI-060 | Client | Paiement | Confirmer | Paiement réussi | — | 1. Payer avec succès | Prestation/Demande = EN_COURS, message système "Paiement reçu", email order-confirmed envoyé au client et au prestataire | POSITIF | CRITIQUE | payment.controller.ts:138-163 |

---

## 12. Cas de test — Suivi de prestation / Contestation

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-CLI-061 | Client | Prestation | Valider fin | Prestation A_VALIDER | — | 1. Cliquer "Valider la prestation" | Prestation/Demande=TERMINEE, email order-completed envoyé | POSITIF | CRITIQUE | RG-CLI-017 |
| TC-CLI-062 | Client | Prestation | Contester | Prestation A_VALIDER | motif="Travail non conforme aux attentes" | 1. Cliquer "Contester" avec motif | Prestation repasse EN_COURS, message litige créé, pas d'email | POSITIF | HAUTE | RG-CLI-018 |
| TC-CLI-063 | Client | Prestation | Contester | Prestation A_VALIDER | motif="" (vide) | 1. Soumettre une contestation sans motif via API directe | Backend accepte (aucun contrôle min détecté) — anomalie à documenter | SECURITE | MOYENNE | RG-CLI-018 |
| TC-CLI-064 | Client | Prestation | Valider fin | Prestation déjà TERMINEE | — | 1. Tenter de revalider | Erreur (transition refusée) | WORKFLOW | HAUTE | RG-CLI-017 |
| TC-CLI-065 | Client | Prestation | Auto-validation | Prestation A_VALIDER, J+3 dépassé, client inactif | — | 1. Attendre le passage du cron horaire (ou déclenchement manuel admin en env. de test) | Prestation/Demande=TERMINEE automatiquement, email isAutoValidated=true | WORKFLOW | HAUTE | RG-CLI-019 |
| TC-CLI-066 | Client | Prestation | Valider fin | Prestation d'un autre client | — | 1. Tenter via API directe | 403 Forbidden | SECURITE | CRITIQUE | prestation.service.ts:395 |

---

## 13. Cas de test — Avis

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-CLI-067 | Client | Avis | Déposer | Prestation TERMINEE, aucun avis existant | rating=5, comment="Excellent travail" | 1. Déposer un avis | Avis créé | POSITIF | HAUTE | RG-CLI-020 |
| TC-CLI-068 | Client | Avis | Déposer | Prestation TERMINEE | rating=0 | 1. Soumettre rating=0 | Erreur validation (hors 1-5) | LIMITE | HAUTE | RG-CLI-020 |
| TC-CLI-069 | Client | Avis | Déposer | Prestation TERMINEE | rating=6 | 1. Soumettre rating=6 | Erreur validation (hors 1-5) | LIMITE | HAUTE | RG-CLI-020 |
| TC-CLI-070 | Client | Avis | Déposer | Avis déjà déposé | — | 1. Tenter de déposer un second avis sur la même prestation | Erreur, refus | NEGATIF | HAUTE | RG-CLI-020 |
| TC-CLI-071 | Client | Avis | Déposer | Prestation non TERMINEE (ex. EN_COURS) | — | 1. Tenter de déposer un avis | Erreur, refus | WORKFLOW | HAUTE | RG-CLI-020 |
| TC-CLI-072 | Client | Avis | Déposer | comment vide | rating=4, comment="" | 1. Soumettre sans commentaire | Accepté (comment facultatif) | LIMITE | BASSE | RG-CLI-020 |

---

## 14. Cas de test — Signalement

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-CLI-073 | Client | Signalement | Créer | Demande EN_COURS | message="Le prestataire ne répond plus depuis 3 jours" | 1. Signaler avec ce message | Signalement créé, statut EN_ATTENTE | POSITIF | HAUTE | RG-CLI-021,023 |
| TC-CLI-074 | Client | Signalement | Créer | — | message="court" (9 caractères) | 1. Soumettre via API directe | Erreur "MESSAGE_TROP_COURT" | LIMITE | MOYENNE | RG-CLI-021 |
| TC-CLI-075 | Client | Signalement | Créer | — | message = exactement 10 caractères | 1. Soumettre | Accepté (limite basse) | LIMITE | BASSE | RG-CLI-021 |
| TC-CLI-076 | Client | Signalement | Créer | Signalement déjà actif sur la même demande | — | 1. Tenter un second signalement | Erreur, refus (un seul actif à la fois) | NEGATIF | MOYENNE | RG-CLI-022 |
| TC-CLI-077 | Client | Signalement | Créer | Demande au statut PUBLIEE (non actif) | — | 1. Tenter de signaler | Erreur, statut non éligible | WORKFLOW | MOYENNE | RG-CLI-023 |
| TC-CLI-078 | Client | Signalement | Créer | — | message vide soumis côté UI (aucun contrôle frontend détecté) | 1. Soumettre un message vide depuis le formulaire | Vérifier si l'erreur backend "MESSAGE_TROP_COURT" est bien affichée à l'utilisateur (pas de blocage silencieux) | NEGATIF | MOYENNE | RG-CLI-021 |

---

## 15. Cas de test — Messagerie

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-CLI-079 | Client | Messagerie | Envoyer | Prestation active, client partie prenante | message="Bonjour, quand pouvez-vous intervenir ?" | 1. Envoyer le message | Message enregistré, visible du prestataire | POSITIF | HAUTE | RG-CLI-024 |
| TC-CLI-080 | Client | Messagerie | Envoyer | — | message = 1001 caractères | 1. Envoyer un message de 1001 caractères | Erreur/rejet (max 1000) | LIMITE | MOYENNE | RG-CLI-024 |
| TC-CLI-081 | Client | Messagerie | Envoyer | — | message = exactement 1000 caractères | 1. Envoyer | Accepté | LIMITE | BASSE | RG-CLI-024 |
| TC-CLI-082 | Client | Messagerie | Envoyer | — | message="Appelez-moi au 0612345678" | 1. Envoyer un message contenant un numéro de téléphone | Rejeté par la détection regex anti-coordonnées | LIMITE | MOYENNE | RG-CLI-024 |
| TC-CLI-083 | Client | Messagerie | Envoyer | — | message="Contactez-moi à jean@mail.com" | 1. Envoyer un message contenant un email | Rejeté par la détection regex | LIMITE | MOYENNE | RG-CLI-024 |
| TC-CLI-084 | Client | Messagerie | Envoyer | — | message="   " (espaces uniquement) | 1. Envoyer | Rejeté (trim → vide) | LIMITE | BASSE | RG-CLI-024 |
| TC-CLI-085 | Client | Messagerie | Envoyer | Prestation n'impliquant pas ce client | — | 1. Tenter d'envoyer un message sur une conversation d'autrui via API | 403 Forbidden | SECURITE | CRITIQUE | message.service.ts:3-18 |
| TC-CLI-086 | Client | Messagerie | Consulter | idem | — | 1. Tenter de consulter une conversation d'autrui via API | 403 Forbidden | SECURITE | CRITIQUE | message.service.ts:3-18 |

---

## 16. Cas de test — Profil

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-CLI-087 | Client | Profil | Consulter | Client connecté | — | 1. Ouvrir la page profil | Informations affichées correctement | POSITIF | MOYENNE | — |
| TC-CLI-088 | Client | Profil | Modifier | Client connecté | firstName="Marie" | 1. Modifier le prénom 2. Sauvegarder | Mise à jour effective, cohérente en base | POSITIF | MOYENNE | — |
| TC-CLI-089 | Client | Profil | Modifier | — | firstName="" (vide) | 1. Soumettre un prénom vide | Erreur validation | NEGATIF | MOYENNE | — |

---

## 17. Anomalies / points à vérifier — CLIENT

| ID | Fonctionnalité | Observation | Risque | Source | Question QA |
|---|---|---|---|---|---|
| AN-CLI-001 | Mot de passe | Incohérence forte frontend/backend sur la complexité et la longueur (register ET reset) | Un mot de passe faible ou d'1 caractère peut être défini via appel API direct, contournant la politique affichée à l'utilisateur | auth.controller.ts:13 ; auth.service.ts:111-133 | Le backend doit-il appliquer la même politique de mot de passe que le frontend ? |
| AN-CLI-002 | Téléphone | Le backend n'impose aucun format de téléphone à l'inscription (client optionnel, prestataire min longueur seulement) | Données de téléphone invalides possibles en base, cassant les fonctionnalités OTP par SMS | auth.controller.ts:17,26 | Le format téléphone doit-il être validé côté backend ? |
| AN-CLI-003 | Changement email | Contrôle de format email backend très faible (`includes("@")`) | Emails invalides acceptés, cassant l'envoi ultérieur de mails | user.controller.ts:308 | Faut-il un vrai regex/validation email côté backend ? |
| AN-CLI-004 | Contestation prestation | Motif de contestation sans contrôle de longueur backend | Un motif vide ou très court peut être soumis en contournant le frontend | prestation.service.ts:454-464 | Le motif doit-il avoir une longueur minimale imposée côté backend ? |
| AN-CLI-005 | Signalement | Aucun contrôle de longueur minimale côté frontend (contrairement au backend) | L'utilisateur découvre l'erreur seulement après soumission, mauvaise UX | page.tsx:965 | Faut-il ajouter la validation frontend en amont ? |
| AN-CLI-006 | Reset password | Aucune invalidation des sessions actives après reset de mot de passe | Un token volé avant le reset reste valide jusqu'à expiration naturelle | auth.service.ts:111-133 | Le reset password doit-il invalider tous les refresh tokens existants ? |
| AN-CLI-007 | Demande | Aucune fonctionnalité de modification d'une demande existante trouvée | Le client doit supprimer/recréer pour corriger une erreur — à confirmer si voulu | recherche exhaustive, aucune route PUT/PATCH demande trouvée | Est-ce un choix produit assumé ou une fonctionnalité manquante ? |
| AN-CLI-008 | Demande | Aucun schéma de validation frontend dédié identifié pour le formulaire de création de demande | Risque d'incohérences de validation non détectées dans cette analyse | non localisé avec certitude | À vérifier manuellement sur le composant de formulaire |
| AN-CLI-009 | StatusDemande.ANNULEE | Valeur d'enum jamais atteinte dans le code | Statut mort, potentiellement prévu pour un usage futur non implémenté | recherche exhaustive schema.prisma | Cette valeur est-elle prévue pour une fonctionnalité à venir ? |

---

## 18. Priorisation P0-P3 — CLIENT

**P0 — Critique** : TC-CLI-001, 006, 007, 022, 024, 044, 051, 052, 055, 057, 060, 061, 066

**P1 — Haute** : TC-CLI-002 à 005, 009 à 020, 025 à 032, 035, 036, 039, 040 à 042, 045 à 049, 053, 054, 056, 058, 059, 062, 064 à 070, 073, 076, 079, 085, 086

**P2 — Moyenne** : TC-CLI-008, 021, 033, 034, 038, 043, 050, 063, 071, 074, 077, 078, 080 à 083, 087, 088, 089

**P3 — Basse** : TC-CLI-037, 072, 075, 081, 084
