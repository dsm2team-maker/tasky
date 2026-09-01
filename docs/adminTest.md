# Référentiel de tests fonctionnels — TASKY
## Profil ADMIN + Tests transverses (multi-profils, paiement, sécurité, cohérence)

---

## 1. Résumé et périmètre

Ce document couvre le profil **ADMIN**, et regroupe l'ensemble des sections transverses demandées : cas de test multi-profils, tests de workflow (transitions interdites), tests d'autorisation/sécurité fonctionnelle, tests de cohérence des données (dont Stripe), le registre consolidé des anomalies (CLIENT + PRESTATAIRE + ADMIN), la priorisation P0-P3 globale, la couverture fonctionnelle et les questions au Product Owner. Ce choix de structuration (documents CLIENT/PRESTATAIRE dédiés à leur périmètre propre, document ADMIN comme document "système/contrôle") a été retenu par défaut ; à ajuster si une autre répartition est souhaitée.

---

## 2. Cartographie fonctionnelle ADMIN

```
ADMIN
├── Authentification
│     └── Connexion admin (même mécanisme JWT que les autres profils, contrôle via isAdmin())
├── Gestion des utilisateurs
│     ├── Lister / rechercher clients et prestataires
│     ├── Consulter le détail d'un utilisateur
│     ├── Suspendre / réactiver un compte — À CONFIRMER existence exacte de l'action
│     └── Consulter les logs email (EmailLog)
├── Gestion des demandes
│     └── Vue d'ensemble de toutes les demandes, tous statuts
├── Gestion des prestations / litiges
│     ├── Consulter les prestations contestées
│     └── Trancher un litige — À CONFIRMER action admin exacte disponible
├── Auto-validation
│     └── Déclenchement manuel du job d'auto-validation (en plus du cron horaire)
├── Signalements
│     ├── Lister les signalements (statut EN_ATTENTE, etc.)
│     └── Traiter un signalement (changer son statut)
├── Catégories
│     └── Gérer les catégories de prestations (categorie.json / table Category)
└── Paiements
      └── Vue d'ensemble des paiements/versements — À CONFIRMER niveau de détail exposé
```

**Confirmé dans le code** : exactement **10 endpoints admin** utilisent le contrôle d'accès manuel `isAdmin()` (pas de middleware `requireRole` générique — celui-ci existe dans le code mais est **mort/jamais branché**, confirmé par recherche exhaustive des call sites). Chaque endpoint admin doit donc être testé individuellement pour l'autorisation (cf. §8 tests d'autorisation).

---

## 3. Droits et restrictions ADMIN

| Fonctionnalité | Admin | Contrainte d'accès | Source |
|---|---|---|---|
| Accès à toute route protégée par `isAdmin()` | Oui | vérification manuelle du champ role en base à chaque contrôleur (10 endpoints recensés) | admin.controller.ts:6-12 et 9 autres emplacements |
| Middleware `requireRole` générique | **Non utilisé** | confirmé mort dans le code (déclaré, jamais importé/appliqué à une route) | recherche exhaustive des call sites |
| Accès aux fonctionnalités CLIENT/PRESTATAIRE | À CONFIRMER | pas de restriction explicite trouvée empêchant un compte admin d'agir comme client — à vérifier si un compte peut cumuler les rôles | schema.prisma (rôle unique par utilisateur, À CONFIRMER) |

---

## 4. Workflows impliquant l'ADMIN

```
Signalement créé (client/prestataire) → EN_ATTENTE
ADMIN consulte et traite               → statut mis à jour (À CONFIRMER enum exact des statuts de traitement)

Prestation A_VALIDER, J+3 dépassé
   → cron horaire auto-valide           → TERMINEE
   → OU admin déclenche manuellement    → TERMINEE (autoValidate.job.ts, déclenchement admin confirmé possible)

Litige (prestation contestée, repassée EN_COURS)
   → ADMIN arbitre                      → À CONFIRMER action et statut de sortie exacts
```
Source : autoValidate.job.ts:14-75, signalement.service.ts.

---

## 5. Règles métier ADMIN

| ID | Fonctionnalité | Règle métier | Source |
|---|---|---|---|
| RG-ADM-001 | Autorisation | Chaque endpoint admin vérifie individuellement `user.role === "ADMIN"` (pattern `isAdmin()`), sans middleware générique centralisé | admin.controller.ts + 9 autres fichiers, confirmé par recherche exhaustive |
| RG-ADM-002 | Autorisation | Le middleware `requireRole` existe dans le code mais n'est appliqué à aucune route — code mort | auth.middleware.ts (déclaration), recherche exhaustive des call sites (aucun) |
| RG-ADM-003 | Auto-validation | Le job cron tourne toutes les heures et auto-valide toute prestation A_VALIDER depuis plus de 3 jours (J+3) | autoValidate.job.ts:14-15 |
| RG-ADM-004 | Auto-validation | L'admin peut déclencher manuellement le même traitement en dehors du cron | autoValidate.job.ts (fonction exportée, appelée par une route admin) |
| RG-ADM-005 | Signalement | Statut initial EN_ATTENTE à la création, traitement par l'admin — enum complet des statuts de sortie **À CONFIRMER** | signalement.service.ts, schema.prisma |
| RG-ADM-006 | Enum morts | `StatusDemande.ANNULEE` et `StatusDevis.EXPIRE` existent dans le schéma Prisma mais ne sont produits par aucune transition du code exploré | schema.prisma + recherche exhaustive des assignations |

---

## 6. Cas de test — ADMIN

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-ADM-001 | Admin | Auth | Connexion | Compte role=ADMIN existant | identifiants valides | 1. Se connecter | Connexion réussie, accès aux fonctionnalités admin | POSITIF | CRITIQUE | RG-ADM-001 |
| TC-ADM-002 | Admin | Utilisateurs | Lister | Admin connecté | — | 1. Ouvrir la liste des utilisateurs | Liste complète clients + prestataires affichée | POSITIF | HAUTE | — |
| TC-ADM-003 | Admin | Utilisateurs | Consulter détail | — | ID d'un utilisateur existant | 1. Ouvrir le détail | Informations complètes affichées, IBAN/BIC masqués ou non exposés en clair | POSITIF | HAUTE | RG-PRE-003 (prestataireTest.docx) |
| TC-ADM-004 | Admin | Signalements | Lister | Signalements EN_ATTENTE existants | — | 1. Ouvrir la liste des signalements | Tous les signalements actifs affichés avec demande/utilisateur associés | POSITIF | HAUTE | RG-ADM-005 |
| TC-ADM-005 | Admin | Signalements | Traiter | Signalement EN_ATTENTE | — | 1. Changer le statut du signalement | Statut mis à jour, historique conservé | POSITIF | HAUTE | RG-ADM-005 |
| TC-ADM-006 | Admin | Auto-validation | Déclenchement manuel | Prestation A_VALIDER depuis J+3 | — | 1. Déclencher manuellement le job depuis l'interface admin | Prestation passe TERMINEE, email envoyé avec isAutoValidated=true | POSITIF | HAUTE | RG-ADM-004 |
| TC-ADM-007 | Admin | Auto-validation | Déclenchement manuel prématuré | Prestation A_VALIDER depuis J+1 seulement | — | 1. Déclencher manuellement le job | Vérifier si la prestation est tout de même auto-validée (bypass du délai J+3 en déclenchement manuel) ou si le délai est respecté même en mode manuel | LIMITE | HAUTE | RG-ADM-003,004 |
| TC-ADM-008 | Admin | Catégories | Gérer | — | Ajout/modification d'une catégorie | 1. Modifier une catégorie existante | Mise à jour reflétée dans le formulaire de création de demande côté client | POSITIF | MOYENNE | — |
| TC-ADM-009 | Admin | Paiements | Vue d'ensemble | Plusieurs prestations payées existantes | — | 1. Ouvrir la vue paiements | Liste cohérente avec les PaymentIntent Stripe réels (montants, statuts) | POSITIF | HAUTE | cf. §9 cohérence des données |

---

## 7. Cas de test multi-profils (workflows croisés)

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-CROSS-001 | Client + Prestataire | Cycle complet MODIFICATION | Bout-en-bout | Client et prestataire créés | demande MODIFICATION | 1. Client crée une demande 2. Prestataire envoie un devis 3. Client accepte 4. Prestataire soumet EDL 5. Client valide EDL 6. Client paie 7. Prestataire marque terminé 8. Client valide la fin 9. Client dépose un avis | Toutes les transitions de statut s'enchaînent sans erreur ; Demande/Prestation = TERMINEE ; email à chaque étape clé | WORKFLOW | CRITIQUE | RG-CLI-010,012,014,017,020 |
| TC-CROSS-002 | Client + Prestataire | Cycle complet CREATION | Bout-en-bout (sans EDL) | — | demande CREATION | 1. Client crée une demande 2. Prestataire envoie un devis 3. Client accepte (saut direct EN_ATTENTE_PAIEMENT, pas d'EDL) 4. Client paie 5. Prestataire marque terminé 6. Client valide | Le workflow saute bien l'étape EDL pour typePrestation=CREATION | WORKFLOW | CRITIQUE | prestation.service.ts (branchement typePrestation) |
| TC-CROSS-003 | Client + Prestataire | Refus EDL en cascade | — | Devis ACCEPTE, EDL soumis | — | 1. Prestataire soumet EDL 2. Client refuse l'EDL avec motif | EDL=REFUSE, Prestation=ANNULEE, Demande=PUBLIEE (redevient visible pour d'autres prestataires), Devis=REFUSE(aVerifier=true) | WORKFLOW | CRITIQUE | RG-CLI-013 |
| TC-CROSS-004 | Client + Prestataire | Concurrence de devis | — | Demande CREATION avec 2 devis ENVOYE de prestataires différents | — | 1. Client accepte le devis A | Devis A=ACCEPTE, devis B=REFUSE automatiquement, email devis-refuse envoyé au prestataire B | WORKFLOW | HAUTE | RG-CLI-011 |
| TC-CROSS-005 | Client + Prestataire | Litige | — | Prestation A_VALIDER | — | 1. Client conteste avec motif 2. Vérifier la visibilité côté prestataire 3. Vérifier la visibilité côté admin (signalement ou vue litige) | Le litige est traçable par les 3 profils de façon cohérente | WORKFLOW | HAUTE | RG-CLI-018 |
| TC-CROSS-006 | Client + Prestataire | Messagerie croisée | — | Prestation active entre client A et prestataire B | — | 1. Client A envoie un message 2. Prestataire B répond 3. Un client C tente d'accéder à cette conversation | Client C reçoit 403 ; échange normal entre A et B fonctionnel | SECURITE | CRITIQUE | message.service.ts:3-18 |
| TC-CROSS-007 | Client + Prestataire + Admin | Signalement traité | — | Client signale une demande | — | 1. Client crée un signalement 2. Admin le consulte et le traite 3. Vérifier la notification au client/prestataire concerné (À CONFIRMER canal) | Traçabilité complète de bout en bout | WORKFLOW | HAUTE | RG-ADM-005 |
| TC-CROSS-008 | Client + Prestataire | Auto-validation vs contestation simultanée | — | Prestation A_VALIDER à J+3 exactement | — | 1. Simuler une contestation client au même moment que le déclenchement du cron | Vérifier l'absence de race condition (statut final cohérent, pas de double transition) | REGRESSION | HAUTE | RG-CLI-019, RG-ADM-003 |

---

## 8. Tests d'autorisation / sécurité fonctionnelle

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-SEC-001 | Client | Élévation de privilège | Accès endpoint admin | Compte client connecté, token valide | — | 1. Appeler un des 10 endpoints admin (ex. GET /api/admin/users) avec le token client | 403 Forbidden sur les 10 endpoints, un par un | SECURITE | CRITIQUE | RG-ADM-001 |
| TC-SEC-002 | Prestataire | Élévation de privilège | Accès endpoint admin | Compte prestataire connecté | — | 1. Idem TC-SEC-001 avec un token prestataire | 403 Forbidden sur les 10 endpoints | SECURITE | CRITIQUE | RG-ADM-001 |
| TC-SEC-003 | Non authentifié | Accès direct | Tous profils | Aucun token | — | 1. Appeler chaque endpoint protégé (client/prestataire/admin) sans header Authorization | 401 sur tous | SECURITE | CRITIQUE | auth.middleware.ts:10-36 |
| TC-SEC-004 | Client | IDOR | Accès ressource d'autrui | 2 comptes clients distincts | ID d'une demande/devis/prestation/message d'un autre client | 1. Appeler chaque endpoint de lecture/écriture en remplaçant l'ID par celui d'un autre client | 403 Forbidden systématique (aucune fuite de données d'un autre client) | SECURITE | CRITIQUE | demande.service.ts:114, devis.service.ts:238, prestation.service.ts:395 |
| TC-SEC-005 | Prestataire | IDOR | Accès ressource d'autrui | 2 comptes prestataires distincts | ID d'un devis/EDL/prestation d'un autre prestataire | 1. Idem TC-SEC-004 côté prestataire | 403 Forbidden systématique | SECURITE | CRITIQUE | — |
| TC-SEC-006 | Client/Prestataire | Token expiré/falsifié | — | Token JWT modifié manuellement (signature invalide) | — | 1. Appeler un endpoint protégé avec un JWT altéré | 401 Unauthorized | SECURITE | CRITIQUE | jwt.ts |
| TC-SEC-007 | Tous | requireRole mort | Vérification code mort | — | — | 1. Confirmer par revue de code qu'aucune route n'utilise `requireRole` | Confirme que la totalité du contrôle d'accès repose sur les vérifications manuelles `isAdmin()`/ownership — donc chaque nouvel endpoint doit être audité individuellement | REGRESSION | HAUTE | RG-ADM-002 |
| TC-SEC-008 | Prestataire | Exposition IBAN | Metadata Stripe | Prestation payée | — | 1. Inspecter le PaymentIntent créé côté Stripe (dashboard test) | Confirmer la présence de l'IBAN déchiffré en métadonnée — anomalie de sécurité à traiter en priorité | SECURITE | CRITIQUE | AN-ADM-003 (voir §11) |
| TC-SEC-009 | Tous | Webhook Stripe | Idempotence | Webhook `payment_intent.succeeded` | Rejouer 2 fois le même événement webhook (ex. via Stripe CLI `stripe trigger` ou re-livraison manuelle) | 1. Déclencher 2 fois le même événement | Vérifier si la prestation passe EN_COURS une seule fois ou si un traitement en double se produit (aucun garde d'idempotence confirmé dans le code) — anomalie potentielle | SECURITE | CRITIQUE | AN-ADM-002 |
| TC-SEC-010 | Client | Messagerie | Injection de coordonnées | Conversation active | message="Voici mon num : 06 12 34 56 78" (avec espaces, pour tester le contournement de regex) | 1. Envoyer ce message | Vérifier si la regex anti-coordonnées détecte aussi les formats avec espaces/séparateurs | LIMITE | MOYENNE | RG-CLI-024 |
| TC-SEC-011 | Client | Messagerie | Injection XSS | Conversation active | message="<script>alert(1)</script>" | 1. Envoyer ce message 2. Consulter la conversation côté destinataire | Le contenu est affiché en texte échappé, aucun script exécuté | SECURITE | CRITIQUE | À CONFIRMER échappement frontend (React échappe par défaut, à valider si dangerouslySetInnerHTML est utilisé quelque part) |

---

## 9. Tests de cohérence des données (dont paiements Stripe)

| ID | Profil | Fonctionnalité | Sous-fonctionnalité | Préconditions | Données de test | Étapes | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-COH-001 | Système | Paiement | Montant cohérent | Devis accepté avec montantFinal renseigné | — | 1. Payer 2. Comparer le montant Stripe (PaymentIntent) au montantFinal de la prestation en base | Montants strictement identiques (en centimes) | REGRESSION | CRITIQUE | RG-CLI-015 |
| TC-COH-002 | Système | Paiement | Montant sans montantFinal | Devis accepté sans montantFinal renseigné | — | 1. Payer | Le montant utilisé est bien `montant` (fallback), cohérent avec l'affichage client | REGRESSION | HAUTE | RG-CLI-015 |
| TC-COH-003 | Système | Paiement | Doublon PaymentIntent | Paiement initié puis page rechargée avant confirmation | — | 1. Initier un paiement 2. Recharger avant confirmation 3. Relancer | Un seul PaymentIntent actif au niveau Stripe pour cette prestation (pas de doublon facturé) | REGRESSION | CRITIQUE | RG-CLI-016 |
| TC-COH-004 | Système | Paiement | Webhook manquant | Paiement réussi côté Stripe mais webhook non reçu (simuler une coupure réseau backend) | — | 1. Payer avec succès 2. Bloquer temporairement le endpoint webhook 3. Vérifier l'état de la prestation | La prestation reste bloquée EN_ATTENTE_PAIEMENT malgré un paiement Stripe réussi — risque de désynchronisation à documenter | REGRESSION | CRITIQUE | payment.controller.ts (webhook handler) |
| TC-COH-005 | Système | Paiement | Statut Stripe vs statut interne | — | Comparer le dashboard Stripe (test mode) et la base Tasky sur un échantillon de 10 prestations payées | 1. Extraire les 10 derniers PaymentIntent 2. Comparer avec les statuts Prestation correspondants | Cohérence à 100% ; toute divergence est une anomalie de synchronisation | REGRESSION | HAUTE | — |
| TC-COH-006 | Système | Auto-validation | Cohérence des dates | Plusieurs prestations A_VALIDER à des dates différentes | — | 1. Lancer le job d'auto-validation 2. Vérifier que seules les prestations dépassant réellement J+3 sont validées | Aucune prestation à J+1 ou J+2 n'est validée par erreur | REGRESSION | HAUTE | RG-ADM-003 |
| TC-COH-007 | Système | Devis | Cohérence après refus en cascade | Demande avec 3 devis ENVOYE | — | 1. Client accepte un devis 2. Vérifier l'état des 2 autres devis en base | Les 2 autres devis sont bien REFUSE, aucun ne reste ENVOYE de façon incohérente | REGRESSION | HAUTE | RG-CLI-011 |
| TC-COH-008 | Système | Email | Cohérence EmailLog | Envoi d'email déclenché (ex. order-confirmed) | — | 1. Déclencher l'envoi 2. Vérifier la table EmailLog | Une entrée `status="sent"` créée uniquement si Resend confirme l'envoi (pas d'entrée fantôme en cas d'échec silencieux) | REGRESSION | MOYENNE | email.worker.ts:145-161 |
| TC-COH-009 | Système | Enum morts | Non-régression | — | — | 1. Vérifier par échantillonnage qu'aucune Demande n'est au statut ANNULEE et aucun Devis au statut EXPIRE en base production | Confirme que ces valeurs restent inutilisées (cohérent avec RG-ADM-006) — à re-tester après toute évolution du code touchant les transitions de statut | REGRESSION | BASSE | RG-ADM-006 |

---

## 10. Tests de workflow — transitions interdites

| ID | Entité | Transition testée | Résultat attendu | Type | Priorité | RG associée |
|---|---|---|---|---|---|---|
| TC-WF-001 | Devis | ENVOYE → ACCEPTE → ACCEPTE (double acceptation) | Refusée | WORKFLOW | HAUTE | RG-CLI-010 |
| TC-WF-002 | Devis | REFUSE → ACCEPTE | Refusée | WORKFLOW | HAUTE | RG-CLI-010 |
| TC-WF-003 | EtatDesLieux | VALIDE → REFUSE (changement après validation) | Refusée | WORKFLOW | HAUTE | RG-CLI-012 |
| TC-WF-004 | EtatDesLieux | REFUSE → VALIDE (retour arrière) | Refusée | WORKFLOW | HAUTE | RG-CLI-012 |
| TC-WF-005 | Prestation | A_VALIDER → EN_COURS directement (hors contestation) | Refusée sauf via le flux de contestation officiel | WORKFLOW | HAUTE | RG-CLI-017 |
| TC-WF-006 | Prestation | TERMINEE → A_VALIDER (retour arrière) | Refusée | WORKFLOW | HAUTE | RG-CLI-017 |
| TC-WF-007 | Prestation | EN_ATTENTE_PAIEMENT → TERMINEE (saut d'étapes) | Refusée | WORKFLOW | CRITIQUE | prestation.service.ts |
| TC-WF-008 | Demande | PUBLIEE → SUPPRIMEE alors que devis ACCEPTE existe | Vérifier si le contrôle de statut bloquant (RG-CLI-009) empêche bien ce cas | WORKFLOW | HAUTE | RG-CLI-009 |
| TC-WF-009 | Signalement | Créer un 2e signalement actif sur une demande déjà signalée | Refusée | WORKFLOW | MOYENNE | RG-CLI-022 |
| TC-WF-010 | Avis | Déposer un avis sur une prestation non TERMINEE | Refusée | WORKFLOW | HAUTE | RG-CLI-020 |

---

## 11. Registre consolidé des anomalies / points à vérifier (CLIENT + PRESTATAIRE + ADMIN)

| ID | Fonctionnalité | Observation | Risque | Source | Question QA | Priorité |
|---|---|---|---|---|---|---|
| AN-ADM-001 | Autorisation | Absence totale de middleware générique de contrôle de rôle ; chaque endpoint admin réimplémente son propre contrôle `isAdmin()` | Un futur endpoint admin ajouté sans reprendre ce pattern serait accessible sans contrôle | RG-ADM-001,002 | Faut-il centraliser le contrôle d'accès admin dans un middleware réutilisable pour fiabiliser les futurs développements ? | P1 |
| AN-ADM-002 | Paiement | Aucun garde d'idempotence identifié sur le traitement du webhook Stripe | Un même événement webhook rejoué (retry Stripe, replay attaque) pourrait déclencher un traitement en double (double passage EN_COURS, doubles emails) | payment.controller.ts (webhook handler) | Faut-il ajouter une vérification d'idempotence (ex. table des event.id Stripe déjà traités) ? | P0 |
| AN-ADM-003 | Paiement | L'IBAN déchiffré du prestataire est inclus dans les métadonnées du PaymentIntent Stripe | Exposition de données bancaires sensibles à un tiers (Stripe) au-delà du strict nécessaire | payment.controller.ts (metadata) | L'IBAN doit-il réellement transiter par Stripe, ou un identifiant interne suffit-il ? | P0 |
| AN-ADM-004 | Mot de passe | Incohérence backend/frontend sur la complexité (register ET reset), backend quasi permissif | Contournement possible de la politique de sécurité affichée à l'utilisateur via appel API direct | auth.controller.ts, auth.service.ts | Faut-il aligner la validation backend sur les règles frontend (recommandé) ? | P1 |
| AN-ADM-005 | Téléphone/Email | Contrôles de format très faibles côté backend (téléphone client facultatif sans regex, email changement `includes("@")` seul) | Données invalides en base, cassant potentiellement les fonctionnalités dépendantes (OTP SMS, envoi d'email) | auth.controller.ts, user.controller.ts:308 | Faut-il renforcer la validation backend indépendamment du frontend ? | P1 |
| AN-ADM-006 | Réputation | Aucun calcul de note moyenne dynamique confirmé pour les prestataires | Information de réputation potentiellement absente ou non fiable pour les clients | recherche exhaustive | Cette fonctionnalité est-elle prévue au roadmap ? | P2 |
| AN-ADM-007 | Portfolio | Fonctionnalité absente du code | Écart possible avec les attentes produit d'une marketplace | recherche exhaustive | Le portfolio prestataire est-il dans le périmètre à venir ? | P2 |
| AN-ADM-008 | Demande | Aucune fonctionnalité de modification d'une demande existante | Le client doit supprimer/recréer, ce qui peut nuire à l'expérience utilisateur | recherche exhaustive | Choix produit assumé ou fonctionnalité manquante ? | P2 |
| AN-ADM-009 | Enum morts | `StatusDemande.ANNULEE` et `StatusDevis.EXPIRE` ne sont jamais atteints par le code | Confusion possible pour les développeurs futurs, dette technique mineure | schema.prisma | Ces statuts doivent-ils être supprimés du schéma ou une fonctionnalité les activant est-elle prévue ? | P3 |
| AN-ADM-010 | Session | Le reset de mot de passe n'invalide pas les sessions/refresh tokens existants | Un token dérobé avant reset reste valide jusqu'à expiration naturelle (7 jours) | auth.service.ts:111-133 | Faut-il révoquer tous les refresh tokens lors d'un reset password réussi ? | P1 |
| AN-ADM-011 | Signalement/Contestation | Contrôles de longueur minimale absents côté backend pour la contestation de prestation (présents uniquement côté frontend) | Un utilisateur contournant le frontend peut soumettre un motif vide | prestation.service.ts:454-464 | Faut-il dupliquer ce contrôle côté backend ? | P2 |
| AN-ADM-012 | Devis | Absence de contrainte d'unicité confirmée pour empêcher un prestataire d'envoyer plusieurs devis sur la même demande | Un prestataire pourrait spammer une demande de plusieurs devis | devis.service.ts | Un seul devis actif par prestataire et par demande doit-il être imposé ? | P2 |
| AN-ADM-013 | Disponibilité | Aucun lien fonctionnel confirmé entre statut INDISPONIBLE et capacité d'action (devis, visibilité recherche) | Un prestataire "indisponible" continue d'apparaître et d'agir normalement, ce qui peut ne pas correspondre à l'intention | recherche exhaustive | Le statut Disponibilité doit-il avoir un effet fonctionnel concret ? | P2 |

---

## 12. Priorisation P0-P3 — Vue globale

**P0 — Critique (bloquant, à traiter avant mise en production/ouverture large)**
AN-ADM-002 (idempotence webhook Stripe), AN-ADM-003 (exposition IBAN Stripe), et l'ensemble des cas TC-SEC-001 à 009, TC-COH-001 à 004, TC-CROSS-001 à 003.

**P1 — Haute**
AN-ADM-001, 004, 005, 010, ainsi que la majorité des cas nominaux/erreurs critiques de chaque module (création demande, devis, EDL, paiement, prestation) listés en P0/P1 dans `clientTest.docx` et `prestataireTest.docx`.

**P2 — Moyenne**
AN-ADM-006, 007, 008, 011, 012, 013, ainsi que les cas de test de confort, de messagerie non critique, et les cas limites secondaires.

**P3 — Basse**
AN-ADM-009, cas de régression sur enums morts, cas de test purement cosmétiques.

---

## 13. Couverture fonctionnelle

| Module | Nombre de TC | Couverture estimée | Zones À CONFIRMER restantes |
|---|---|---|---|
| Authentification / Compte (CLIENT+PRESTATAIRE) | 34 | Élevée | Format exact des contraintes prestataire (téléphone, IBAN) |
| Demandes | 19 | Élevée | Limite haute de longueur du titre, schéma de validation frontend exact |
| Devis | 21 | Élevée | Unicité devis/prestataire/demande |
| État des lieux | 9 | Élevée | Contrainte exacte de nombre de photos |
| Paiement | 15 | Moyenne-Élevée | Détail exact du flux webhook, comportement en cas d'échec réseau |
| Prestation / Litiges | 17 | Élevée | Action admin exacte de résolution de litige |
| Avis | 6 | Élevée | — |
| Signalement | 9 | Élevée | Enum complet des statuts de traitement admin |
| Messagerie | 11 | Élevée | Comportement exact de la regex sur formats variés |
| Admin | 9 | Moyenne | Périmètre exact des actions de suspension de compte |
| Sécurité / Autorisation | 11 | Élevée sur le principe, à dérouler sur les 10 endpoints admin individuellement | — |
| Cohérence des données | 9 | Moyenne | Accès réel à un dashboard Stripe test pour exécution |

**Non couvert / hors périmètre confirmé** : Portfolio prestataire, calcul de réputation dynamique (fonctionnalités absentes du code — retirées du plan de test actif, à réintégrer si le Product Owner confirme leur existence ou leur mise en chantier).

---

## 14. Questions au Product Owner

1. La note de réputation moyenne du prestataire est-elle une fonctionnalité prévue, en cours de développement, ou abandonnée ?
2. Le portfolio prestataire est-il dans le périmètre produit actuel ou futur ?
3. Un client doit-il pouvoir modifier une demande existante après publication, ou est-ce un choix assumé de forcer suppression/recréation ?
4. Le statut Disponibilité du prestataire doit-il avoir un effet fonctionnel bloquant (visibilité recherche, capacité à envoyer un devis) ?
5. Un prestataire doit-il être limité à un seul devis actif par demande ?
6. Quelle est l'action admin exacte attendue pour trancher un litige (contestation client) au-delà de la simple visualisation ?
7. Le reset de mot de passe doit-il invalider toutes les sessions actives de l'utilisateur ?
8. La politique de complexité de mot de passe doit-elle être appliquée côté backend, alignée sur le frontend ?
9. L'envoi de l'IBAN prestataire en métadonnée Stripe est-il un choix technique assumé, ou faut-il le remplacer par un identifiant interne ?
10. Existe-t-il un mécanisme d'idempotence prévu (ou à ajouter) pour le traitement des webhooks Stripe ?
11. Les statuts `StatusDemande.ANNULEE` et `StatusDevis.EXPIRE` doivent-ils être activés par une fonctionnalité à venir (ex. annulation manuelle par le client), ou supprimés du schéma ?
12. Quel est le déclenchement exact du versement au prestataire après validation de la prestation (automatique, différé, ou déclenché manuellement par l'admin) ?
