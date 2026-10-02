# TASKY — AUDIT PRÉ-PRODUCTION

> Date : 01/10/2026 — Commit audité : `2d1f17b` (branche `main`)
> Méthode : lecture du code réel (backend Express/Prisma, frontend Next.js), `npm audit` / `npm outdated` (lecture seule), `tsc --noEmit` (backend : OK), recherche de secrets dans l'historique git.
> Rapport initial établi sans modification de code. **Phase 1 appliquée le 02/10/2026** (voir « Suivi des corrections »). Aucun test n'a été lancé contre la production.
> Pas de score global (comme demandé). Tout ce qui n'a pas pu être vérifié depuis le code est marqué **NON VÉRIFIÉ**.

---

## Suivi des corrections — Phase 1 (02/10/2026, commits 0fa0251 → ad8f27c)

Vérifications : `tsc --noEmit` backend et front OK ; `npm test` backend : 10/10.
Aucune modification de schéma Prisma (le mode d'application du schéma en prod n'est pas confirmé, cf. SEC-026).

| Finding | Statut |
|---|---|
| SEC-001 | FIXED (mitigé) — flux désactivé hors dev (503), comptes ADMIN exclus, compteur OTP atomique. Ne réactiver qu'avec envoi SMS réel + confirmation par lien. |
| SEC-002 | FIXED — `payment.verification.ts` (pi.id, metadata.prestationId, devise, montant encaissé) sur confirm **et** webhook ; transition conditionnée à `stripePaymentIntentId`. |
| SEC-003 | FIXED (code) — script via `ADMIN_EMAIL`/`ADMIN_PASSWORD`, mdp fort exigé, refus si le compte existe. **NON VÉRIFIÉ** : changement du mot de passe admin en production. |
| SEC-004 | FIXED — `trust proxy` (`TRUST_PROXY_HOPS`, défaut 1) + limiteurs IP+email et IP. **À valider en staging** (`req.ip` = IP client). |
| SEC-005 | FIXED — `authMiddleware` relit isActive/deletedAt/rôle en BDD ; refresh refusé si suspendu + rotation à usage unique ; `suspendUser` révoque les refresh tokens. |
| SEC-008 | FIXED — `updateMany` conditionnels (demande PUBLIEE, devis ENVOYE + sélectionnable + non expiré) dans la transaction. |
| SEC-009 | FIXED — `consumeOtpAttempt` : incrément optimiste conditionné à la valeur lue + comparaison à temps constant (4 flux). |
| SEC-010 | FIXED — cron et `validerPrestation`/`contesterPrestation` conditionnés à `status: A_VALIDER`. |
| SEC-011 | PARTIAL — job horaire de réconciliation (SKIPPED/FAILED/manquant, vérif. `transfers.list` anti-doublon), relance sur `payouts_enabled`, `charge.dispute.created` → gel du transfert + alerte admin. Restent : remboursements, `charge.refunded`, reversal manuel. |
| SEC-025 | PARTIAL — `npm audit fix` sans `--force` (backend : 1 moderate restant `qs` via express 4 ; front : axios 1.20). Restent Next 14 (critical, nécessite Next 16) et glob/minimatch (outillage dev). |
| SEC-034 | FIXED — calcul en centimes, commission = total − part prestataire ; test sur 0,01 → 9 999,99 € (999 999 montants). |
| SEC-038 | PARTIAL — `npm test` (node:test, aucune dépendance ajoutée) : vérification PI + commission. Pas encore de CI ni de tests d'intégration. |
| SEC-040 | FIXED — PI réutilisé mis à jour si le montant diffère ; minimum Stripe 0,50 € vérifié à la création. |

**Actions manuelles requises (hors code)** :
1. Dashboard Stripe → webhook `/api/payment/webhook` : ajouter l'événement `charge.dispute.created`.
2. Staging : vérifier dans les logs que `req.ip` est l'IP du client ; ajuster `TRUST_PROXY_HOPS` sinon.
3. Production : confirmer le changement du mot de passe admin (SEC-003).
4. Le parcours « email perdu » affiche désormais « momentanément indisponible » en prod : prévoir un renvoi vers le support.

---

## Résumé exécutif

**Trois bloquants CRITICAL**, à corriger avant toute ouverture publique :

| ID | Problème | Conséquence |
|---|---|---|
| SEC-001 | `POST /api/auth/recover-email/*` : OTP SMS jamais envoyé en prod (Twilio non configuré) mais vérifiable, 6 chiffres, compteur d'essais non atomique, renouvelable à l'infini → l'email du compte est remplacé par celui de l'attaquant + lien de reset envoyé à l'attaquant | **Prise de contrôle de n'importe quel compte ayant un téléphone, y compris l'admin** |
| SEC-002 | `POST /api/payment/confirm` accepte **n'importe quel** PaymentIntent `succeeded` sans vérifier qu'il appartient à la prestation (id, montant, metadata) | **Contournement du paiement** : on paye 1 € une fois et on réutilise ce PI pour démarrer une prestation à 1 000 € |
| SEC-003 | Identifiants admin en clair dans `backend/scripts/create-admin.ts` (commité dans git) + le script promeut ADMIN un compte existant portant cet email | Accès admin complet si le mot de passe n'a pas été changé en prod (**NON VÉRIFIÉ**) |

Ensuite, **8 HIGH** (rate-limit inopérant derrière le proxy Railway, comptes suspendus toujours actifs, race sur l'acceptation de devis, absence de gestion des litiges et remboursements Stripe, transferts SKIPPED/FAILED jamais rejoués, dépendances Next.js avec avis critiques, etc.) et une série de MEDIUM/LOW.

Points **solides** vérifiés dans le code :
- ownership (IDOR) correct sur demandes, devis, prestations, messages, conversations, signalements, Connect ;
- vérification de signature des 2 webhooks Stripe (raw body) ;
- transitions de paiement atomiques (`updateMany where status`) entre `/confirm` et le webhook ;
- idempotency key sur `stripe.transfers.create` ;
- échappement HTML des emails ;
- Prisma (pas de SQL brut) ;
- admin protégé deux fois (route + contrôleur) ;
- aucun secret réel dans l'historique git, hors admin (`.env.example` ne contient que des placeholders `XXXX`).

---

## 1. Architecture

| Élément | Constat (code) |
|---|---|
| Frontend | Next.js **14.2.35** (App Router), Vercel, axios, zustand, react-query. `next.config.cjs` = `{}` (aucun header). Pas de `middleware.ts`. |
| Backend | Express 4.22, TypeScript, Railway. `helmet()` par défaut, `cors({origin: FRONTEND_URL, credentials})`, `morgan("dev")`, `express-rate-limit` 7. |
| BDD | PostgreSQL Supabase via Prisma 5.22 (pgbouncer). Déploiement par `prisma db push` (pas de migrations versionnées). |
| Storage | Supabase Storage, bucket **public** `avatars` (avatars + photos), clé service côté backend uniquement. |
| Queue | BullMQ sur Upstash (`rediss://`) : queue email, worker importé dans le même process que l'API (`index.ts:20`). |
| Jobs | `node-cron` : auto-validation (toutes les heures, +exécution au boot), expiration devis (toutes les heures). Lancés dans `app.listen` → un exemplaire par instance. |
| Auth | JWT HS256 stateless (access 7 j, refresh 30 j stocké en clair en BDD), bcryptjs 12 rounds. Tokens côté front dans **localStorage**. |
| Paiement | Stripe PaymentIntent (charges et transferts séparés) + Stripe Connect Embedded (comptes `controller.losses.payments = stripe`), transfert à `TERMINEE`, commission 15 %. |
| Email | Resend via BullMQ, templates avec `escapeHtml`. |
| CI/CD | **Aucun** (`.github/` absent). Aucun test automatisé (pas de script `test`). |

Flux métier : Demande (PUBLIEE) → Devis (ENVOYE) → acceptation → Prestation (EN_ATTENTE_INSPECTION si MODIFICATION / EN_ATTENTE_PAIEMENT) → paiement → EN_COURS → A_VALIDER → TERMINEE (validation client ou auto-validation à 3 j) → transfert Connect.

## 2. Surface d'attaque

- **Endpoints publics (sans JWT)** :
  - `/api/auth/*` : register ×2, login, refresh, verify-email, resend-verification, forgot/reset-password, check-email, check-phone, recover-email ×2 ;
  - `/api/prestataires` et `/api/prestataires/:id` ;
  - 2 webhooks Stripe ;
  - `/health`.
- **Endpoints authentifiés** : ~60, dont 12 admin.
- **Entrées non fiables à surveiller** :
  - URLs de photos fournies par le client (`demande.photos`) ;
  - data-URI base64 d'upload ;
  - montants (`montant` devis, `montantRevise`) ;
  - texte libre (description, messages, contact, motif) ;
  - `paymentIntentId` fourni par le client.
- **Tiers** : Stripe, Supabase, Upstash, Resend, Twilio (**non configuré** en prod d'après le code).
- La table complète des endpoints est en **Annexe A**.

## 3. Authentification

| Contrôle | Constat | Finding |
|---|---|---|
| Hash mot de passe | bcryptjs, 12 rounds | OK |
| Politique mot de passe | Register : min 8 seulement. `reset-password` : **aucune** règle | SEC-016 |
| Brute-force login | `loginLimiter` 10/15 min, mais clé = `req.ip` **sans `trust proxy`** | SEC-004 |
| Énumération | login 404 `USER_NOT_FOUND` vs 401 `WRONG_PASSWORD` ; check-email, check-phone, recover-email (404), resend-verification ("déjà vérifié") | SEC-014 |
| Vérification email | Register renvoie access+refresh **avant** vérification ; `verify-email` ne contrôle pas le type de token (accepte un OTP 6 chiffres) | SEC-006, SEC-007 |
| Récupération de compte | recover-email : prise de contrôle | **SEC-001** |
| Sessions | Access 7 j non révocable, refresh non lié à `isActive`, pas de détection de réutilisation, refresh en clair en BDD, logout ne révoque que le refresh fourni | SEC-005, SEC-018 |
| Changement d'email | OTP envoyé à la nouvelle adresse, **sans re-saisie du mot de passe** | SEC-022 |
| Changement de mot de passe connecté | Endpoint inexistant (seulement via forgot-password) | INFO |
| Casse des emails | register/login sans `toLowerCase()`, check-email avec | SEC-017 |

## 4. Autorisation

- **Ownership** : vérifié correctement dans tous les services lus, avec le motif `findUnique` puis `clientId`/`prestataireId === user` puis `FORBIDDEN` :
  - demandes, devis, prestations, messages, conversations, signalements, paiement, Connect.
  - **Aucun IDOR trouvé.**
- **Rôles** :
  - `requireRole` n'est utilisé que sur `/admin/*` et `/connect/*`.
  - Ailleurs, le rôle est implicite : `prisma.client.findUnique({where:{userId}})` renvoie `CLIENT_NOT_FOUND` pour un prestataire. C'est fonctionnellement équivalent, mais fragile : toute nouvelle route oubliant ce lookup est ouverte aux deux rôles.
- **Le rôle est lu dans le JWT et non en BDD** : un utilisateur rétrogradé ou suspendu garde ses droits jusqu'à 7 j (SEC-005).
- **Admin** : `router.use(authMiddleware, requireRole("ADMIN"))` plus `isAdmin()` dans chaque contrôleur. `test-email` est désactivé en prod.

Matrice des rôles : **Annexe B**.

## 5. OWASP Top 10 (2021)

| Catégorie | Constat |
|---|---|
| A01 Broken Access Control | Pas d'IDOR. Mais : comptes suspendus actifs (SEC-005) ; prestataire non éligible peut deviser n'importe quelle demande (SEC-012). |
| A02 Cryptographic Failures | Refresh tokens en clair en BDD (SEC-018) ; tokens en URL et logs (SEC-032) ; montants en Float (SEC-029). |
| A03 Injection | Prisma uniquement, pas de `$queryRaw` → pas de SQLi. Emails échappés. Pas de `dangerouslySetInnerHTML` dans le front. `reference` du formulaire contact injectée dans le sujet (SEC-033, faible). |
| A04 Insecure Design | Recover-email (SEC-001), confirm paiement (SEC-002), races de transitions (SEC-008, SEC-010), absence de gestion des litiges (SEC-011). |
| A05 Security Misconfiguration | Pas de `trust proxy` (SEC-004), pas de headers de sécurité côté front (SEC-019), env non bloquant (SEC-027), `prisma db push` en build (SEC-026). |
| A06 Vulnerable Components | Next 14.2.35 (avis critiques), axios, ws, path-to-regexp (SEC-025). |
| A07 Identification & Auth Failures | SEC-001, 004, 005, 006, 007, 014, 016, 018. |
| A08 Software & Data Integrity | Webhooks signés : OK. Pas de CI, déploiement direct (SEC-038). |
| A09 Logging & Monitoring Failures | `console.*` uniquement, pas d'alerting, `morgan("dev")` (SEC-039). |
| A10 SSRF | Le backend ne télécharge aucune URL fournie par l'utilisateur. Les URLs `photos` sont seulement rendues côté navigateur (SEC-021). Pas de SSRF serveur. |

## 6. API Security

- **Validation** :
  - Zod n'est utilisé que sur register et login.
  - Ailleurs, validation manuelle partielle :
    - pas de longueur max sur titre, description, bio, motif ;
    - `montant` du devis non borné (`Infinity`, `0.001` acceptés) ;
    - `montantRevise` passe par `parseFloat` (négatif accepté) ;
    - `photos` est un tableau de chaînes arbitraires.
- **Rate limiting** :
  - global 1000/15 min, login 10/15 min, création de demande ;
  - **rien** sur register, forgot, resend, reset, recover, refresh, check-*, contact, upload, messages, devis, signalements (SEC-015) ;
  - et tout est probablement inopérant derrière le proxy (SEC-004).
- **Pagination** :
  - présente côté admin (20) ;
  - **absente** sur demandes disponibles, liste publique des prestataires, messages, Tasky-Infos, prestations, devis (SEC-030).
- **Gestion d'erreurs** :
  - `handleError` mappe les codes métier ;
  - pas de handler Express global ;
  - les webhooks n'ont pas de try/catch autour du traitement BDD (SEC-028).
- **Taille des requêtes** : `express.json({limit:"10mb"})` sur toutes les routes (SEC-033).
- **CORS** : origine unique `FRONTEND_URL` (OK). En prod, si la variable est absente, le fallback est `http://localhost:3000` (SEC-027).
- **CSRF** : non applicable (Bearer token en header, pas de cookie).

## 7. Database

- **Montants en `Float`** :
  - `Devis.montant`, `Prestation.montant/montantFinal`, `EtatDesLieux.montantRevise`, `Transfer.amount`.
  - Recommandation : `Decimal(10,2)` ou centimes `Int` (SEC-029).
- **Index manquants sur les FK les plus filtrées** :
  - `Demande.clientId`, `Devis.demandeId`, `Devis.prestataireId`, `Prestation.demandeId`, `Prestation.prestataireId`, `Message.prestationId/conversationId/destinataireId`.
  - Postgres n'indexe pas automatiquement les FK.
- **Contraintes manquantes** :
  - pas d'unique `(demandeId, prestataireId)` sur `Devis` (doublons possibles en parallèle) ;
  - `Transfer.prestataireId` sans relation FK ;
  - `Signalement.statut` en `String` libre.
- **Contraintes présentes** : `Transfer.prestationId` @unique (bon garde-fou contre les doubles transferts), `Review.prestationId` (**NON VÉRIFIÉ** : unique ?), `Conversation(clientId, prestataireId)` unique.
- **`VerificationToken.token` unique** partagé entre OTP (6 chiffres) et tokens longs, ce qui provoque des collisions et l'oracle SEC-007.
- **RLS Supabase** : non utilisée. Le backend se connecte en `postgres`. Acceptable **si et seulement si** la clé `anon` n'est jamais utilisée côté front pour lire des tables.
  - Grep front : aucun usage `@supabase` côté front trouvé (aucune variable `NEXT_PUBLIC_*` dans `src/`).
  - **NON VÉRIFIÉ** côté dashboard Supabase : l'API REST PostgREST est-elle exposée avec RLS désactivée ? Fournir une capture *Database → Tables → RLS* et *API settings*.
- **Migrations** : `prisma db push` exécuté au build Railway (`railway.toml`), avec un historique de migrations partiel et non baseliné (SEC-026).

## 8. Stripe / Payment

| Point | Constat |
|---|---|
| Montant calculé côté serveur | OUI : `create-intent` recalcule depuis `montantFinal ?? montant` en BDD. |
| Liaison PI ↔ prestation à la confirmation | **NON** (SEC-002, CRITICAL). |
| Réutilisation d'un PI existant | Ne vérifie pas que `existing.amount === montantCentimes` (SEC-040, LOW). |
| Montant minimum Stripe (0,50 €) | Non vérifié à la création du devis : un devis à 0,01 € casse le paiement (SEC-012). |
| Idempotence transitions | OK (`updateMany where status`). |
| Idempotence transferts | OK (`idempotencyKey: transfer_${prestationId}` + unique BDD). Effet de bord : après un échec 4xx, la même clé renvoie la même erreur pendant 24 h, donc un retry immédiat est impossible. |
| Litiges / remboursements | **Aucun traitement** de `charge.dispute.created`, `charge.refunded`, `payment_intent.payment_failed`. Aucun flux de remboursement (SEC-011). |
| Transferts SKIPPED / FAILED | **Jamais rejoués** : ni au passage `payouts_enabled=true` (webhook `account.updated`), ni par un outil admin (SEC-011). |
| Commission | `splitMontant` arrondit chaque part séparément : **3 561 montants sur 100 000** (0,01 → 1000 €) ont une somme ≠ total à ±0,01 €. Impact limité aux metadata (le transfert utilise la part prestataire, la plateforme garde le reste) (SEC-034). |
| Connect | `losses.payments = "stripe"`, dashboard `none`, onboarding embarqué. Race `getOrCreateConnectAccount`, donc comptes orphelins possibles (SEC-035). |
| Clés | Mode test/live non déterminable depuis le code. **NON VÉRIFIÉ** : fournir le préfixe des clés Railway prod (`sk_live_` / `sk_test_`) et confirmer que la staging utilise `sk_test_`. |

### Tests d'arrondi de commission (calculés avec le code réel de `splitMontant`)

| Montant | Part prestataire | Commission | Somme = total ? |
|---|---|---|---|
| 0 | 0 | 0 | oui (mais un PI à 0 est refusé par Stripe) |
| 0,01 | 0,01 | 0 | oui (PI refusé : < 0,50 €) |
| 1 | 0,85 | 0,15 | oui |
| 10 | 8,50 | 1,50 | oui |
| 99,99 | 84,99 | 15,00 | oui |
| 100 | 85,00 | 15,00 | oui |
| 9 999,99 | 8 499,99 | 1 500,00 | oui |
| **0,10** | 0,09 | 0,02 | **non (+0,01)** |
| **1,50** | 1,28 | 0,23 | **non (−0,01)** |

→ Recommandation : calculer en centimes entiers, `commission = round(total*15/100)` et `prestataire = total − commission`.

## 9. Webhooks

- **Signature** : `constructEvent(rawBody, sig, secret)` sur les deux webhooks. OK. Le raw body est monté avant `express.json`. OK.
- **Secret absent** : réponse 503, Stripe réessaie. OK.
- **Idempotence** :
  - pas de table des `event.id` traités ;
  - acceptable aujourd'hui, car le seul effet (transition) est conditionnel ;
  - à ajouter dès qu'on traitera litiges et remboursements.
- **Erreurs** : aucun try/catch autour du traitement BDD.
  - Une erreur Prisma lève une promesse rejetée dans un handler async Express 4 : pas de réponse, la requête pend jusqu'au timeout, puis Stripe réessaie. Pas de crash du process (Node ≥15 crashe sur unhandled rejection **sauf** si un handler global existe ; ici **aucun** `process.on("unhandledRejection")`). Le process peut donc **crasher** (SEC-028).
- **Événements non gérés** : disputes, remboursements, échecs de paiement, `transfer.reversed`, `account.application.deauthorized` (SEC-011).
- **Webhook paiement** : ne vérifie pas que `pi.amount` correspond au montant attendu. C'est un risque faible, puisque seul le serveur crée les PI avec ce metadata.

## 10. Frontend

- **Tokens dans `localStorage`** : `auth_token` (7 j) et `refresh_token` (30 j). Toute XSS permet un vol de session long (SEC-018).
  - Le refresh token est stocké mais **jamais utilisé** : sur 401, le front déconnecte. Il ne fait qu'augmenter la surface d'attaque.
- **Aucun header de sécurité** : ni CSP, HSTS, `X-Frame-Options`/`frame-ancestors`, `Referrer-Policy` ou `Permissions-Policy` (`next.config.cjs` vide, `vercel.json` sans `headers`) (SEC-019).
  - Clickjacking possible sur les pages de paiement.
- **`dangerouslySetInnerHTML`** : aucun usage. React échappe par défaut. OK.
- **Open redirect** : aucun paramètre `next`/`redirect`/`returnTo` lu. OK.
- **`NEXT_PUBLIC_*`** : seul `NEXT_PUBLIC_API_URL` (+ clé publiable Stripe), fallback `http://localhost:3000`. Pas de secret exposé.
- **`<img src={demande.photos[0]}>`** : URLs arbitraires fournies par le client (SEC-021).
- **Next.js 14.2.35** : avis de sécurité critiques/hauts non corrigés dans la branche 14 (SEC-025).
- **Garde de routes** : côté client uniquement (pas de `middleware.ts`). Acceptable, car l'API applique les contrôles, mais les pages admin sont téléchargeables et leur code visible.

## 11. File Upload

- **Endpoints** : `POST /api/users/avatar` et `POST /api/users/photo`, en data-URI base64.
- **Points corrects** : liste blanche MIME déclarée (jpeg/png/webp), limite de 5 Mo après décodage. **Pas de SVG**, donc pas de XSS stockée via le bucket.
- **Pas de vérification des magic bytes** : le `contentType` stocké est celui déclaré. Un fichier HTML déclaré `image/png` est servi en `image/png`, donc le navigateur ne l'exécute pas. Risque faible, mais le bucket public héberge du contenu arbitraire de 5 Mo (abus d'hébergement).
- **Pas de quota ni de rate limit** sur `/photo` : chaque appel crée un fichier, sans nettoyage des orphelins. On peut remplir le stockage (coût) (SEC-020).
- **Nom de fichier `${userId}-${timestamp}`** : l'UUID interne est exposé publiquement.
- **Bucket public** : photos de demandes accessibles sans authentification par URL (énumération difficile, mais URLs devinables si l'userId est connu + timestamp).
- **Body JSON de 10 Mo accepté globalement** : le payload base64 est parsé avant la vérification de taille.

## 12. Redis / BullMQ

- **Connexion** : TLS (`rediss`) si l'URL le précise. OK.
- **Options des jobs** : `attempts: 3`, backoff, `removeOnComplete: 100`, `removeOnFail: 50`, `concurrency: 5`.
- **Données des jobs** : emails et **URLs de reset/vérification contenant le token** restent en Redis (jusqu'à 100 succès / 50 échecs). Une fuite Upstash revient à une fuite de tokens valides (SEC-032).
- **Worker dans le process API** : un pic d'emails consomme le CPU de l'API. Avec plusieurs instances, plusieurs workers tournent (OK pour BullMQ).
- **Redis indisponible** :
  - **NON VÉRIFIÉ** : `addEmailJob` est-il `await`é dans les flux critiques ? (forgot-password répond 200 de toute façon.) Il faut le tester en staging en coupant Redis.
  - Les emails sont perdus s'ils n'ont pas été enfilés (pas d'outbox).
- **Avis `npm audit`** sur bullmq 5.71 (moderate), corrigé en 5.81 (même major).

## 13. Secrets

- **Historique git** (`git log -p --all`) : aucune clé réelle `sk_live`/`sk_test`/`whsec`/`re_`/JWT/`sb_secret`. Seuls des placeholders `XXXX` / `VOTRE…` sont présents.
- **Seul secret réel** : mot de passe admin en clair dans `backend/scripts/create-admin.ts` (commits `b61e7f1`, `1f057dc`) **et** dans les notes de mémoire locales du projet (SEC-003).
- **`.env*.local`** : gitignored. Seuls les `.env.example` sont suivis.
- **`env.config.ts`** : en prod, un secret manquant ne produit qu'un `console.warn`. Le serveur démarre avec Stripe ou JWT non configuré, et `dotenv.config()` est appelé après des imports qui lisent l'env (`lib/jwt.ts`) (SEC-027).
- **NON VÉRIFIÉ** : longueur/entropie de `JWT_SECRET` et `JWT_REFRESH_SECRET` en prod. Il faut confirmer ≥ 32 octets aléatoires et des secrets différents.
- **NON VÉRIFIÉ** : rotation des clés après le partage éventuel des variables d'environnement (captures, chats).

## 14. Dependencies

`npm audit --omit=dev` :

| Paquet | Où | Sévérité | Version installée | Correctif | Breaking ? |
|---|---|---|---|---|---|
| next | front | **critical** (+ postcss high transitif) | 14.2.35 | 16.3.8 | **OUI** : majeur (React 19, App Router async APIs, `next lint` retiré). À planifier, pas de mise à jour automatique. |
| axios | front | high (SSRF NO_PROXY, prototype pollution `validateStatus`) | 1.13.3 | 1.20.0 | non (minor) |
| form-data, follow-redirects | front (transitif axios) | high / moderate | — | via axios | non |
| nanoid | front (transitif) | high | ≤3.3.17 | `npm audit fix` | non |
| ws | backend (transitif, supabase realtime) | high | 8.x ≤8.20.1 | `npm audit fix` | non |
| path-to-regexp | backend (express 4) | high (ReDoS) | <0.1.13 | `npm audit fix` (express 4.22.3) | non |
| morgan | backend | moderate (log forging) | 1.10.1 | 1.12.1 | non |
| qs, body-parser, uuid, bullmq, resend, svix | backend | low/moderate | — | même major | non |

Majeurs disponibles **à ne pas** appliquer sans analyse : Prisma 7, Express 5, Zod 4, helmet 8, express-rate-limit 8, bcryptjs 3, Stripe SDK 23, React 19, Tailwind 4.
Le backend compile (`npx tsc --noEmit` OK). Le front n'a pas été buildé (non nécessaire pour l'audit).

## 15. GDPR / RGPD

- **Suppression de compte** : seule la ligne `User` est anonymisée. Restent :
  - le compte Stripe Connect (non supprimé ni détaché) ;
  - les fichiers du bucket (avatar, photos) ;
  - les messages et le contenu des demandes ;
  - les refresh tokens (supprimés : OK) ;
  - les jobs Redis (SEC-024).
- **Droit d'accès / portabilité** : pas d'endpoint d'export.
- **Exposition publique** : `GET /api/prestataires/:id` (sans auth) renvoie `pointDepotAdresse`, `pointDepotCodePostal` et `pointDepotInstructions`. Si le point de dépôt est le domicile de l'artisan, c'est une adresse personnelle publiée à tout internet. La liste publique inclut aussi les prestataires **suspendus** (pas de filtre `isActive`) (SEC-023).
- **Durées de conservation** : aucune purge (tokens expirés, messages, comptes anonymisés).
- **Sous-traitants hors UE** : Resend, Upstash, Vercel, Railway. **NON VÉRIFIÉ** : régions et DPA signés. Fournir la liste des régions (Supabase = `eu-west-3` d'après l'exemple).
- **NON VÉRIFIÉ** : politique de confidentialité, CGU, bannière cookies (aucun cookie de tracking repéré dans le code).

## 16. Performance

- **Requêtes non paginées** (SEC-030) :
  - `getDemandesDisponibles` charge **toutes** les demandes PUBLIEE puis filtre/score en JS ;
  - `listPrestataires` (public) charge tous les profils avec `prestations` incluses pour compter ;
  - `getTaskyInfoMessages`, `getMessages`, `getMesPrestations*`.
- **`recalculerStatsPrestataire`** charge tous les devis du prestataire à chaque transition.
- **`getUnreadCount`** : 4 `findMany` + 3 `count` par appel, appelé en polling par le front (**NON VÉRIFIÉ** : fréquence de polling).
- **Index FK manquants** : voir §7.
- **Body 10 Mo** + parsing JSON synchrone : quelques requêtes suffisent à occuper l'event loop.

## 17. Load Testing (stratégie — staging uniquement)

**Rien n'a été exécuté.** Prérequis :
- environnement **staging** séparé (BDD Supabase dédiée, Redis dédié, Stripe **test mode**, Resend en mode sandbox ou domaine de test) ;
- `NODE_ENV=staging` affiché par `/health` pour pouvoir l'identifier.

Outil : k6 (ou Artillery). Scénarios :

| # | Scénario | Charge cible | Mesures | Seuil de succès |
|---|---|---|---|---|
| 1 | Lecture publique `GET /api/prestataires` | 50 → 200 VU, 10 min | p95, erreurs, CPU, connexions pgbouncer | p95 < 500 ms, 0 % 5xx |
| 2 | Login (comptes de test) | 20 VU | vérifier que le limiter s'applique **par IP client** (SEC-004) | 429 seulement pour l'IP fautive |
| 3 | Parcours prestataire : `GET /demandes/available` avec 5 000 demandes seedées | 50 VU | p95, mémoire | p95 < 800 ms |
| 4 | Messagerie : polling `unread-count` toutes les 10 s | 500 VU | QPS BDD | p95 < 200 ms |
| 5 | Concurrence : 20 `PATCH /devis/:id/accept` simultanés sur la même demande | burst | nombre de prestations créées | exactement 1 (SEC-008) |
| 6 | Paiement : `create-intent` + confirmation Stripe test (`4242…`) | 10 VU | doublons de notifications | 1 seule transition |
| 7 | File email : 1 000 jobs | burst | latence de la queue, retries | 0 perte |
| 8 | Soak 2 h à 30 % de la charge | — | fuite mémoire, connexions | stable |

**Interdits** : aucune exécution contre `tasky.fr` ou `api.tasky.fr`, aucune clé `sk_live`, aucun email réel.

## 18. Resilience

- **Pas de handler global d'erreurs Express** ni de `process.on("unhandledRejection"/"uncaughtException")`. Une exception dans un handler async non entouré de try/catch (webhooks) peut tuer le process (SEC-028).
- **Pas de graceful shutdown** (SIGTERM) : en redéploiement Railway, les jobs BullMQ en cours et les requêtes en vol sont coupés.
- **Effets de bord hors transaction** : `createTransferForPrestation` est appelé **après** la transaction de `validerPrestation`. Si le process meurt entre les deux, la prestation est TERMINEE sans transfert, et rien ne rejoue (SEC-011).
- **Crons à chaque boot** et dans chaque instance (SEC-031).
- **Dépendance à Twilio** : non configuré, donc tout le flux téléphone (recover-email, changement de téléphone) est non fonctionnel en prod, et dangereux dans le cas de SEC-001.

## 19. Backup / Disaster Recovery

**NON VÉRIFIÉ — informations nécessaires :**
- Plan Supabase (Free = pas de PITR ; Pro = backups quotidiens 7 j ; PITR en option). Fournir le plan et indiquer si le PITR est activé.
- Procédure de restauration testée ? (date du dernier test)
- Backup du bucket Storage (non couvert par les backups BDD Supabase).
- Upstash : persistance activée ? (perte de la queue email acceptable ?)
- `prisma db push` au build : migrations partielles non baselinées, un rollback de schéma est manuel (SEC-026).
- RPO/RTO cibles.

## 20. Monitoring

- Aucun outil d'APM, d'erreurs (Sentry) ni d'alerting dans le code. Logs `console.*` + `morgan("dev")` (format non structuré, sans request-id).
- Les échecs de transfert notifient les admins par email (bien), mais aucun autre événement critique n'est alerté : webhook en erreur, queue email bloquée, cron en échec, domaine Resend non vérifié (cf. incident du 31/08).
- `/health` ne vérifie ni la BDD ni Redis.
- **NON VÉRIFIÉ** : alertes Railway/Vercel configurées, rétention des logs Railway.

## 21. CI/CD

- **Aucun pipeline** : pas de `.github/workflows`, pas de lint, typecheck, `npm audit` ou tests avant déploiement (SEC-038).
- Déploiement Railway : 3 fichiers de config concurrents (`railway.toml`, `railway.json`, `nixpacks.toml`). Celui qui est effectivement utilisé n'est pas certain (**NON VÉRIFIÉ** : fournir la commande de build/start affichée dans Railway → Settings).
- `railway.toml` exécute `prisma db push` + seed au **build** (SEC-026).
- Aucun test automatisé (pas de script `test`).

---

## 22. Findings

### SEC-001 — Prise de contrôle de compte via recover-email
- **Severity** : CRITICAL — **BLOCKER**
- **Category** : Authentication / Account recovery (A04, A07)
- **File** : `backend/src/modules/users/user.service.ts` (`recoverEmailSendOtp`, `recoverEmailVerifyOtp`) ; `backend/src/routes/auth.routes.ts`
- **Endpoint** : `POST /api/auth/recover-email/send-otp`, `POST /api/auth/recover-email/verify-otp` (publics, sans rate limit dédié)
- **Description** :
  - Le flux "j'ai perdu l'accès à mon email" génère un OTP 6 chiffres censé partir par SMS.
  - En prod, Twilio n'est pas configuré : le code fait `console.warn("Twilio non configuré")`, l'OTP n'est **jamais livré** mais reste **valide**.
  - La limite de 5 essais est en lecture-modification-écriture non atomique, et un nouvel OTP peut être demandé indéfiniment (cooldown 2 min).
  - En cas de succès, l'email du compte est **remplacé** par `newEmail` (non validé, choisi par l'appelant), les refresh tokens sont supprimés et un lien `PASSWORD_RESET` est envoyé à la nouvelle adresse.
- **Evidence** :
  - `recoverEmailVerifyOtp` met à jour `user.email = newEmail` puis crée un token PASSWORD_RESET et l'envoie à `newEmail`.
  - Le compteur `attempts` est lu puis incrémenté sans condition dans le `where`.
  - L'admin créé par `create-admin.ts` a le téléphone `0000000000` et un email connu (SEC-003).
- **Attack scenario** (staging uniquement) :
  1. `send-otp {email: victime}`.
  2. Envoyer 50 requêtes `verify-otp` **en parallèle** avec des OTP différents : toutes lisent `attempts=0`.
  3. Répéter après chaque cooldown. L'espace de 10⁶ est couvert en quelques heures/jours selon le parallélisme. Sans `trust proxy` (SEC-004), le global limiter est partagé.
  4. Au succès, recevoir le lien de reset sur sa propre adresse et définir un mot de passe.
- **Impact** : prise de contrôle complète de n'importe quel compte (client, prestataire, **admin**), accès aux données, détournement des versements (modification du Connect via session embarquée).
- **Recommended fix** :
  1. **Désactiver immédiatement** les deux routes en prod tant qu'aucun SMS n'est réellement envoyé (feature flag).
  2. Une fois Twilio actif :
     - compteur atomique (`updateMany where attempts < 5` + `increment`) ;
     - limite par compte et par IP (ex. 3 OTP/jour) ;
     - OTP hashé ;
     - comparaison en temps constant.
  3. Ne **jamais** changer l'email directement : envoyer un lien de confirmation à `newEmail`, notifier l'ancienne adresse, délai de sécurité de 24-72 h. Exclure les comptes ADMIN de ce flux.
  4. Réponse identique que le compte existe ou non.
- **Example fix** :
```ts
// recoverEmailVerifyOtp — incrément atomique AVANT comparaison
const bumped = await prisma.verificationToken.updateMany({
  where: { userId: user.id, type: "RECOVER_EMAIL", attempts: { lt: 5 }, expiresAt: { gt: new Date() } },
  data: { attempts: { increment: 1 } },
});
if (bumped.count === 0) throw new Error("OTP_LOCKED");
const vt = await prisma.verificationToken.findFirst({ where: { userId: user.id, type: "RECOVER_EMAIL" } });
if (!vt || !timingSafeEqual(hash(otp), vt.tokenHash)) throw new Error("OTP_INVALID");
```
- **Test to verify fix** :
  - Test d'intégration : 20 `verify-otp` en parallèle avec de mauvais OTP, `attempts` final = 5 et ≥ 15 réponses `OTP_LOCKED`.
  - En prod sans Twilio : la route renvoie 503/404.
  - Un compte ADMIN est refusé.
- **Status** : FIXED (mitigé) — flux désactivé hors dev (503), comptes ADMIN exclus, compteur OTP atomique. Ne réactiver qu'avec envoi SMS réel + confirmation par lien.

### SEC-002 — Confirmation de paiement non liée à la prestation (bypass de paiement)
- **Severity** : CRITICAL — **BLOCKER**
- **Category** : Payment / Business logic (A04)
- **File** : `backend/src/controllers/payment.controller.ts` (`confirmPaymentHandler`, l. 100-194)
- **Endpoint** : `POST /api/payment/confirm`
- **Description** :
  - Le handler récupère le PI via `paymentIntentId` fourni par le client et vérifie seulement `pi.status === "succeeded"`.
  - Il ne vérifie **pas** :
    - `pi.id === prestation.stripePaymentIntentId` ;
    - `pi.metadata.prestationId === prestationId` ;
    - `pi.amount === montantCentimes` ;
    - `pi.currency`.
- **Evidence** : l. 120-149 : `retrieve(paymentIntentId)` → `if (pi.status !== "succeeded")` → `updateMany(... status: "EN_COURS", stripeChargeId)`.
- **Attack scenario** (Stripe test mode) :
  1. Le client A paie une prestation P1 à 10 € et obtient `pi_1`.
  2. Pour une prestation P2 à 1 000 € en EN_ATTENTE_PAIEMENT, il appelle `POST /payment/confirm {prestationId: P2, paymentIntentId: pi_1}`.
  3. P2 passe EN_COURS : le prestataire travaille sans avoir été payé.
  4. À la validation, le transfert de 850 € part avec `source_transaction = charge de P1` : il échoue (fonds insuffisants sur la charge) ou est prélevé sur le solde de la plateforme.
- **Impact** : perte financière directe, prestataire non payé, litiges.
- **Recommended fix** : vérifier l'identité du PI et son montant ; idéalement ne plus accepter `paymentIntentId` du client et utiliser `prestation.stripePaymentIntentId`.
- **Example fix** :
```ts
if (!prestation.stripePaymentIntentId || prestation.stripePaymentIntentId !== paymentIntentId)
  return res.status(400).json({ success: false, message: "PaymentIntent invalide" });
const expected = Math.round((prestation.montantFinal ?? prestation.montant) * 100);
if (pi.metadata?.prestationId !== prestationId || pi.amount_received !== expected || pi.currency !== "eur")
  return res.status(400).json({ success: false, message: "Paiement incohérent" });
```
  Appliquer le même contrôle de montant dans le webhook `payment_intent.succeeded`.
- **Test to verify fix** : test d'intégration en Stripe test mode avec 2 prestations du même client, le PI de P1 sur P2 donne 400 et P2 reste EN_ATTENTE_PAIEMENT.
- **Status** : FIXED — `payment.verification.ts` (pi.id, metadata.prestationId, devise, montant encaissé) sur confirm **et** webhook ; transition conditionnée à `stripePaymentIntentId`.

### SEC-003 — Identifiants administrateur en clair dans le dépôt
- **Severity** : CRITICAL — **BLOCKER** (sauf preuve que le mot de passe prod a été changé)
- **Category** : Secrets (A07)
- **File** : `backend/scripts/create-admin.ts`
- **Endpoint** : `POST /api/auth/login` (puis `/api/admin/*`)
- **Description** :
  - Email `tasky-adm@outlook.fr` et mot de passe `Admin@T…` (complet dans le fichier) en dur, commités (`b61e7f1`, `1f057dc`).
  - Si un utilisateur existe déjà avec cet email, le script le **promeut ADMIN** : quelqu'un qui s'inscrit avec cette adresse avant l'exécution du script devient admin.
  - Aucun endpoint de changement de mot de passe connecté.
- **Attack scenario** : toute personne ayant eu accès au dépôt (collaborateur, fuite, dépôt rendu public) se connecte en admin.
- **Impact** : contrôle admin (suspension de comptes, lecture de toutes les prestations, emails et paiements, déclenchement de l'auto-validation donc des transferts).
- **Recommended fix** :
  1. Changer **immédiatement** le mot de passe admin en prod via forgot-password et vérifier les connexions récentes.
  2. Le script doit lire `ADMIN_EMAIL`/`ADMIN_PASSWORD` depuis l'env, refuser de promouvoir un compte existant et exiger un mot de passe fort.
  3. Retirer le mot de passe des notes locales.
  4. Envisager la réécriture de l'historique git (BFG) si le dépôt doit devenir partagé.
  5. 2FA admin à moyen terme.
- **Test to verify fix** : `git grep -n "Admin@"` vide ; le login avec l'ancien mot de passe en prod échoue (vérifié manuellement par vous).
- **Status** : FIXED (code) — script via `ADMIN_EMAIL`/`ADMIN_PASSWORD`, mdp fort exigé, refus si le compte existe. **NON VÉRIFIÉ** : changement du mot de passe admin en production. — **NON VÉRIFIÉ** : le mot de passe prod est-il encore celui du script ? (à vérifier par vous, sans me le communiquer)

### SEC-004 — Rate limiting inopérant derrière le proxy Railway (`trust proxy` absent)
- **Severity** : HIGH
- **Category** : API Security / Misconfiguration (A05, A07)
- **File** : `backend/src/index.ts` (aucun `app.set("trust proxy", …)`), `backend/src/routes/auth.routes.ts` (`loginLimiter`)
- **Endpoint** : toutes, en particulier `POST /api/auth/login`
- **Description** :
  - Derrière le proxy Railway, `req.ip` vaut l'IP du proxy.
  - `express-rate-limit` utilise `req.ip` comme clé : **tous les utilisateurs partagent le même compteur**.
  - 10 échecs de login en 15 min, par n'importe qui, bloquent le login de toute la plateforme. Le global limiter 1000/15 min est aussi partagé.
  - À l'inverse, la protection brute-force par IP n'existe pas.
- **Evidence** : `grep "trust proxy"` → aucun résultat.
- **Attack scenario** : script de 10 logins invalides toutes les 15 min, donc login indisponible pour tout le monde (DoS applicatif).
- **Impact** : indisponibilité, et absence réelle de protection brute-force.
- **Recommended fix** : `app.set("trust proxy", 1)` (nombre exact de proxies Railway à confirmer), puis limiter par IP **et** par email cible pour le login.
- **Example fix** :
```ts
app.set("trust proxy", 1);
const loginLimiter = rateLimit({ windowMs: 15*60e3, max: 10, keyGenerator: (req) => `${req.ip}:${String(req.body?.email||"").toLowerCase()}` });
```
- **Test to verify fix** : en staging, logger `req.ip` pour 2 clients différents (IPs distinctes) ; 11 logins depuis le client A donnent 429 pour A et 200 pour B.
- **Status** : FIXED — `trust proxy` (`TRUST_PROXY_HOPS`, défaut 1) + limiteurs IP+email et IP. **À valider en staging** (`req.ip` = IP client). — **NON VÉRIFIÉ** en conditions réelles. Fournir un log de `req.ip` + `X-Forwarded-For` depuis Railway staging pour confirmer le comportement.

### SEC-005 — Comptes suspendus ou supprimés gardent l'accès
- **Severity** : HIGH
- **Category** : Authorization / Session management (A01, A07)
- **File** : `backend/src/middleware/auth.middleware.ts` ; `backend/src/controllers/auth.controller.ts` (`refreshToken`) ; `backend/src/modules/admin/admin.service.ts` (`suspendUser`, l. 90)
- **Endpoint** : toutes les routes authentifiées ; `POST /api/auth/refresh` ; `PATCH /api/admin/users/:id/suspend`
- **Description** :
  - `authMiddleware` vérifie uniquement la signature du JWT (7 j), pas `isActive`, `deletedAt` ni le rôle courant.
  - `refreshToken` ne vérifie pas non plus `isActive`.
  - `suspendUser` passe seulement `isActive=false` et **ne supprime pas** les refresh tokens.
- **Attack scenario** : un prestataire frauduleux est suspendu, continue d'utiliser l'app 7 jours (devis, messages, validation), puis renouvelle via refresh pendant 30 jours de plus.
- **Impact** : la suspension est inefficace ; un compte supprimé reste utilisable avec son token.
- **Recommended fix** :
  - Dans `authMiddleware`, charger l'utilisateur (`select id, role, isActive, deletedAt, tokenVersion`) avec un cache Redis de 30-60 s si besoin, et rejeter s'il est inactif.
  - Utiliser le rôle **de la BDD**.
  - `suspendUser` : `refreshToken.deleteMany({where:{userId}})` + incrémenter un `tokenVersion` inclus dans le JWT.
  - Réduire l'access token à 15 min.
- **Test to verify fix** : suspendre un utilisateur puis appeler `GET /api/auth/me` avec son ancien token → 401 ; `POST /refresh` → 401.
- **Status** : FIXED — `authMiddleware` relit isActive/deletedAt/rôle en BDD ; refresh refusé si suspendu + rotation à usage unique ; `suspendUser` révoque les refresh tokens.

### SEC-006 — Inscription : tokens émis avant vérification de l'email
- **Severity** : MEDIUM
- **Category** : Authentication (A07)
- **File** : `backend/src/controllers/auth.controller.ts` (`registerClient`, `registerPrestataire`)
- **Endpoint** : `POST /api/auth/register/client|prestataire`
- **Description** : la réponse contient access + refresh alors que `emailVerified=false`. Aucune route ne vérifie `emailVerified` (ni demande, ni devis, ni message).
- **Attack scenario** : créer des comptes en masse avec des emails jetables ou d'autres personnes, puis publier des demandes ou devis et spammer les messageries.
- **Impact** : spam, fraude, usurpation d'adresses email de tiers.
- **Recommended fix** : soit ne pas émettre de tokens tant que l'email n'est pas vérifié, soit les émettre avec un scope restreint et bloquer les actions métier (`requireVerifiedEmail` sur create demande, envoyer devis, messages, paiement).
- **Test to verify fix** : inscription puis `POST /api/demandes` sans vérification → 403 `EMAIL_NOT_VERIFIED`.
- **Status** : OPEN

### SEC-007 — `verify-email` accepte n'importe quel type de token (oracle et consommation des OTP)
- **Severity** : MEDIUM
- **Category** : Authentication
- **File** : `backend/src/modules/auth/auth.service.ts` (`verifyEmailToken`)
- **Endpoint** : `GET /api/auth/verify-email?token=`
- **Description** :
  - La recherche se fait par `token` (unique, partagé entre OTP 6 chiffres et tokens longs), sans filtrer `type = EMAIL_VERIFICATION` ni limiter les essais.
  - Un OTP de changement de téléphone, d'email ou de suppression de compte d'un autre utilisateur peut être deviné par force brute (10⁶) et **consommé**, et le compte cible est marqué `emailVerified=true`.
- **Attack scenario** : boucle de `GET /verify-email?token=000000..999999`. Chaque succès invalide l'OTP en cours d'une victime (DoS de son flux) et indique qu'un OTP est actif.
- **Impact** : DoS des flux OTP, vérification d'email non voulue, oracle.
- **Recommended fix** : `where: { token, type: "EMAIL_VERIFICATION" }`, tokens longs ≥ 32 octets, OTP stockés hashés et indexés par `(userId, type)`, rate limit.
- **Test to verify fix** : créer un OTP PHONE_CHANGE puis appeler `verify-email` avec sa valeur → 400, et l'OTP reste valide.
- **Status** : OPEN

### SEC-008 — Race condition et contrôles d'état manquants à l'acceptation d'un devis
- **Severity** : HIGH
- **Category** : Business logic / Concurrency (A04)
- **File** : `backend/src/modules/devis/devis.service.ts` (`accepterDevis`)
- **Endpoint** : `PATCH /api/devis/:id/accept`
- **Description** :
  - Les vérifications (`status === ENVOYE`, `estSelectionnable`, statut de la demande) sont faites **hors transaction**, puis les updates sont inconditionnels.
  - Ni `demande.status === "PUBLIEE"` ni `devis.expiresAt > now` ne sont vérifiés.
  - Il n'y a pas d'unique sur `Prestation.demandeId` (volontaire).
- **Attack scenario** : double-clic ou deux onglets acceptant deux devis différents en parallèle : 2 prestations et 2 devis ACCEPTE pour la même demande, donc 2 paiements possibles.
- **Impact** : double facturation ou incohérence d'état.
- **Recommended fix** : faire la transition dans la transaction avec des `updateMany` conditionnels et vérifier `count === 1`.
- **Example fix** :
```ts
await prisma.$transaction(async (tx) => {
  const d = await tx.demande.updateMany({ where: { id: devis.demandeId, status: "PUBLIEE" }, data: { status: next } });
  if (d.count !== 1) throw new Error("DEMANDE_NOT_AVAILABLE");
  const v = await tx.devis.updateMany({ where: { id, status: "ENVOYE", estSelectionnable: true, expiresAt: { gt: new Date() } }, data: { status: "ACCEPTE" } });
  if (v.count !== 1) throw new Error("DEVIS_NOT_ACCEPTABLE");
  await tx.prestation.create({ ... });
});
```
- **Test to verify fix** : 20 `accept` en parallèle (`Promise.all`) sur 2 devis de la même demande → exactement 1 prestation créée.
- **Status** : FIXED — `updateMany` conditionnels (demande PUBLIEE, devis ENVOYE + sélectionnable + non expiré) dans la transaction.

### SEC-009 — Compteurs d'essais OTP non atomiques (flux authentifiés)
- **Severity** : MEDIUM
- **Category** : Authentication
- **File** : `backend/src/modules/users/user.service.ts` (`verifyPhoneOtp`, `verifyEmailOtp`, `confirmDeleteAccount`)
- **Endpoint** : `POST /api/users/profile/verify-phone-otp`, `/verify-email-otp`, `/confirm-delete-account`
- **Description** : même motif lecture-modification-écriture que SEC-001. Un attaquant qui a une session volée peut forcer l'OTP de changement d'email sans accès à la boîte.
- **Attack scenario** : avec un token volé, `request-email-change` vers une adresse que l'attaquant contrôle. Ici l'OTP part vers la nouvelle adresse, donc ce cas est sans objet. L'intérêt est plutôt le **changement de téléphone** (OTP envoyé à…). **NON VÉRIFIÉ** : destinataire exact de l'OTP de changement de téléphone en prod sans Twilio (email ?).
- **Impact** : contournement de la limite de 5 essais.
- **Recommended fix** : incrément atomique (voir SEC-001).
- **Test to verify fix** : 20 vérifications parallèles → `attempts` = 5 et 15 refus.
- **Status** : FIXED — `consumeOtpAttempt` : incrément optimiste conditionné à la valeur lue + comparaison à temps constant (4 flux).

### SEC-010 — Auto-validation non conditionnelle (course avec la contestation)
- **Severity** : MEDIUM
- **Category** : Business logic / Concurrency
- **File** : `backend/src/jobs/autoValidate.job.ts` (l. 28-31) ; `backend/src/modules/prestations/prestation.service.ts` (`validerPrestation`, `contesterPrestation`, `marquerTermine`)
- **Endpoint** : cron + `PATCH /api/prestations/:id/valider|contester`
- **Description** :
  - Le cron lit les prestations A_VALIDER puis fait `update({where:{id}, data:{status:"TERMINEE"}})` **sans condition de statut**.
  - Si le client conteste entre la lecture et l'écriture, la prestation passe TERMINEE et le transfert part malgré la contestation.
  - `validerPrestation` et `contesterPrestation` font aussi check-then-update. Validation + cron simultanés donnent des notifications en double ; le transfert est protégé par l'idempotency key.
- **Impact** : versement malgré un litige (fenêtre étroite) ; notifications en double.
- **Recommended fix** : `updateMany({ where: { id, status: "A_VALIDER" } })` partout, et poursuivre seulement si `count === 1`.
- **Test to verify fix** : simuler la contestation pendant le cron (hook de test) → la prestation reste EN_COURS et aucun Transfer n'est créé.
- **Status** : FIXED — cron et `validerPrestation`/`contesterPrestation` conditionnés à `status: A_VALIDER`.

### SEC-011 — Litiges, remboursements et transferts non rejoués non gérés
- **Severity** : HIGH
- **Category** : Payment / Resilience
- **File** : `backend/src/controllers/payment.controller.ts` (webhook), `backend/src/modules/payment/transfer.service.ts`, `connect.service.ts` (`syncConnectAccountStatus`)
- **Endpoint** : `POST /api/payment/webhook`, `POST /api/payment/webhook/connect`
- **Description** :
  - Seuls `payment_intent.succeeded` et `account.updated` sont traités.
  - Rien pour `charge.dispute.created` (chargeback) : le transfert au prestataire part quand même, et la plateforme supporte la perte.
  - Rien pour `charge.refunded`, et aucun flux de remboursement.
  - Les transferts `SKIPPED` (prestataire pas prêt) et `FAILED` ne sont **jamais** rejoués : `account.updated` ne relance rien et il n'y a pas d'outil admin.
  - Si le process meurt après `TERMINEE` et avant `createTransferForPrestation`, aucun enregistrement Transfer n'existe.
- **Impact** : argent des prestataires bloqué indéfiniment, pertes sur chargebacks, travail manuel invisible.
- **Recommended fix** :
  1. Job de réconciliation : prestations TERMINEE sans Transfer SUCCEEDED, puis `createTransferForPrestation` (nouvelle idempotency key par tentative, ex. `transfer_${id}_${attempt}`).
  2. Sur `account.updated` avec `payouts_enabled`, rejouer les SKIPPED du prestataire.
  3. Webhook `charge.dispute.created` : geler le transfert si pas encore fait, alerter l'admin ; si déjà fait, `transfers.createReversal`.
  4. Endpoint admin de remboursement (`refunds.create` + reversal).
- **Test to verify fix** : Stripe CLI test mode `stripe trigger charge.dispute.created` → Transfer gelé + alerte ; prestataire passant `payouts_enabled` → transfert SKIPPED exécuté.
- **Status** : PARTIAL — job horaire de réconciliation (SKIPPED/FAILED/manquant, vérif. `transfers.list` anti-doublon), relance sur `payouts_enabled`, `charge.dispute.created` → gel du transfert + alerte admin. Restent : remboursements, `charge.refunded`, reversal manuel.

### SEC-012 — `envoyerDevis` : pas de contrôle d'éligibilité ni de bornes de montant
- **Severity** : MEDIUM
- **Category** : Business logic / Validation
- **File** : `backend/src/modules/devis/devis.service.ts` (`envoyerDevis`)
- **Endpoint** : `POST /api/demandes/:id/devis`
- **Description** :
  - N'importe quel prestataire peut deviser n'importe quelle demande PUBLIEE par son ID, même sans Connect (`stripePayoutsEnabled`), sans bio, sans email vérifié ou sans compétence correspondante. Le matching filtre ces cas dans la liste, mais pas l'action.
  - `montant` n'est pas borné : `Infinity`, `1e308` et `0.001` sont acceptés (Stripe exige ≥ 0,50 € et ≤ 999 999,99 €).
  - Pas d'unique `(demandeId, prestataireId)`, donc doublons en parallèle.
- **Impact** : devis non payables ; prestataire non payable sélectionné (transfert SKIPPED) ; spam.
- **Recommended fix** : réutiliser les filtres de `matching.service` comme garde ; `montant` entre 1 et 50 000 (à définir), 2 décimales ; `@@unique([demandeId, prestataireId])`.
- **Test to verify fix** : devis à 0,01 → 400 ; prestataire sans Connect → 403 ; 2 devis parallèles → 1 créé.
- **Status** : OPEN

### SEC-013 — `montantRevise` non validé (état des lieux)
- **Severity** : LOW
- **Category** : Validation
- **File** : `backend/src/controllers/prestation.controller.ts` (l. 44), `prestation.service.ts` (`creerEtatDesLieux`)
- **Endpoint** : `POST /api/prestations/:id/etat-des-lieux`
- **Description** : `parseFloat(montantRevise)` accepte les négatifs et les valeurs démesurées ; `photos` n'est pas validé (type, nombre). Si le client accepte un montant négatif, le PI ne peut pas être créé et la prestation est bloquée.
- **Recommended fix** : bornes identiques à SEC-012 ; `photos` = max N URLs issues du bucket Tasky.
- **Test to verify fix** : `montantRevise: -50` → 400.
- **Status** : OPEN

### SEC-014 — Énumération de comptes
- **Severity** : MEDIUM
- **Category** : Authentication (A07)
- **File** : `auth.controller.ts` (`login`, `checkEmail`, `checkPhone`), `auth.recovery.controller.ts`, `user.service.ts` (`recoverEmailSendOtp`), `auth.service.ts` (`resendVerificationEmail`)
- **Endpoint** : `POST /login`, `GET /check-email`, `GET /check-phone`, `POST /recover-email/send-otp`, `POST /resend-verification`
- **Description** :
  - Les réponses diffèrent selon que le compte existe (404 vs 401, "déjà vérifié", `phoneMasked`).
  - Sur login, `isActive` est vérifié avant le mot de passe : un compte suspendu est révélé sans connaître le mot de passe.
  - Pas de bcrypt factice, donc l'écart de temps de réponse est mesurable.
- **Impact** : constitution de listes d'emails et téléphones clients, ciblage du phishing et de SEC-001.
- **Recommended fix** : message unique "Identifiants invalides" ; check-email/phone seulement à l'étape finale de l'inscription, avec rate limit strict, ou suppression ; réponses génériques sur resend et recover.
- **Test to verify fix** : login avec un email inexistant et avec un mauvais mot de passe → même code, même corps, temps comparable (±50 ms).
- **Status** : OPEN

### SEC-015 — Absence de rate limit sur les endpoints sensibles
- **Severity** : MEDIUM
- **Category** : API Security
- **File** : `auth.routes.ts`, `contact.routes.ts`, `user.routes.ts`, `message.routes.ts`, `conversation.routes.ts`, `signalement.routes.ts`
- **Endpoint** : register, forgot-password, reset-password, resend-verification, refresh, check-email/phone, recover-email, contact, upload avatar/photo, messages, signalements, request-*-change
- **Description** : seul le global limiter (1000/15 min, partagé, cf. SEC-004) s'applique.
- **Impact** : bombardement d'emails (Resend : quota et réputation du domaine `mail.tasky.fr`), spam de messages, remplissage du stockage.
- **Recommended fix** : limiter dédié (ex. 5/h par IP + par email) sur les endpoints qui envoient un email ; 30 msg/min par utilisateur ; 20 uploads/jour ; Redis store (`rate-limit-redis`) pour le multi-instance.
- **Test to verify fix** : 6 `forgot-password` en 1 h pour le même email → le 6e donne 429 et un seul email est enfilé au-delà de la limite.
- **Status** : OPEN

### SEC-016 — Politique de mot de passe faible / absente au reset
- **Severity** : MEDIUM
- **Category** : Authentication
- **File** : `auth.controller.ts` (schéma Zod register), `auth.recovery.controller.ts` (`resetPassword`)
- **Endpoint** : `POST /register/*`, `POST /reset-password`
- **Description** : 8 caractères minimum à l'inscription ; **aucune** contrainte au reset (`"a"` est accepté).
- **Recommended fix** : schéma Zod partagé (≥ 10-12 caractères, max 128, refus des mots de passe courants / HIBP k-anonymity) appliqué partout.
- **Test to verify fix** : reset avec `"a"` → 400.
- **Status** : OPEN

### SEC-017 — Emails sensibles à la casse
- **Severity** : LOW
- **Category** : Authentication / Data integrity
- **File** : `auth.controller.ts`
- **Endpoint** : register, login
- **Description** : `Jean@x.fr` et `jean@x.fr` donnent deux comptes, et le login échoue si la casse diffère.
- **Recommended fix** : `email.trim().toLowerCase()` partout + migration des données existantes (vérifier les doublons avant).
- **Test to verify fix** : inscription `A@x.fr` puis `a@x.fr` → 409.
- **Status** : OPEN

### SEC-018 — Gestion des tokens : stockage et révocation
- **Severity** : MEDIUM
- **Category** : Session management (A02, A07)
- **File** : `src/stores/auth-store.ts`, `src/lib/api-client.ts`, `src/app/auth/login/page.tsx` (front) ; `backend/src/lib/jwt.ts`, `auth.controller.ts`
- **Endpoint** : `/api/auth/refresh`, `/api/auth/logout`
- **Description** :
  - L'access token (7 j) et le refresh token (30 j) sont dans `localStorage`.
  - Le refresh est stocké **en clair** en BDD, rotaté sans détection de réutilisation ; deux refresh concurrents donnent une 500.
  - Le logout laisse l'access token valide 7 j.
  - Le front n'utilise jamais `/refresh`.
- **Impact** : une XSS (ou une extension malveillante) donne 30 jours de session ; une fuite de la table permet d'usurper des sessions.
- **Recommended fix** :
  - Access 15 min ; refresh en cookie `HttpOnly; Secure; SameSite=Strict` sur le domaine API, hashé (SHA-256) en BDD ; détection de réutilisation (familles de tokens) ; logout = révocation de la famille.
  - Si le cookie est trop lourd à mettre en place avant la prod : au minimum access 1 h + hash du refresh + suppression du refresh du localStorage.
- **Test to verify fix** : réutiliser un refresh déjà rotaté → 401 et révocation de toute la famille.
- **Status** : OPEN

### SEC-019 — Aucun header de sécurité côté frontend
- **Severity** : MEDIUM
- **Category** : Misconfiguration (A05)
- **File** : `next.config.cjs`, `vercel.json`
- **Endpoint** : toutes les pages `tasky.fr`
- **Description** : pas de CSP, HSTS, `frame-ancestors`/`X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`. Helmet ne protège que les réponses de l'API.
- **Impact** : clickjacking (pages de paiement, admin) ; aucune atténuation en cas de XSS.
- **Recommended fix** : `headers()` dans `next.config.cjs` : CSP compatible Stripe (`js.stripe.com`, `connect-js.stripe.com`, `*.stripe.com` en frame-src), `frame-ancestors 'none'`, HSTS `max-age=63072000; includeSubDomains; preload`, `Referrer-Policy: strict-origin-when-cross-origin`. Déployer d'abord en `Content-Security-Policy-Report-Only`.
- **Test to verify fix** : `curl -I https://staging…` affiche les headers ; securityheaders.com ; parcours de paiement Stripe test OK sans violation CSP.
- **Status** : OPEN

### SEC-020 — Upload : pas de vérification de contenu, bucket public, pas de quota
- **Severity** : LOW
- **Category** : File upload
- **File** : `backend/src/controllers/user.controller.ts` (`uploadAvatar`, `uploadPhoto`)
- **Endpoint** : `POST /api/users/avatar`, `POST /api/users/photo`
- **Description** : MIME déclaré non vérifié par magic bytes ; fichiers orphelins jamais supprimés ; pas de quota ; nom = userId ; bucket public.
- **Impact** : hébergement de contenu arbitraire, coûts de stockage, exposition des UUID.
- **Recommended fix** :
  - Vérifier les magic bytes (`file-type`) et ré-encoder via `sharp` (supprime aussi l'EXIF/GPS, ce qui compte pour le RGPD) ;
  - nom aléatoire (`crypto.randomUUID()`) ;
  - quota + nettoyage des orphelins ;
  - photos de demandes dans un bucket privé + URLs signées.
- **Test to verify fix** : upload d'un HTML déclaré `image/png` → 400 ; EXIF absent du fichier stocké.
- **Status** : OPEN

### SEC-021 — URLs de photos arbitraires stockées et rendues
- **Severity** : LOW
- **Category** : Validation / Privacy
- **File** : `backend/src/modules/demandes/demande.service.ts` ; front `src/app/prestataire/requests/page.tsx:165`, `src/app/client/requests/page.tsx:177`, `src/app/prestataire/services/page.tsx:152`
- **Endpoint** : `POST /api/demandes`
- **Description** : `photos` est un tableau de chaînes quelconques, rendu en `<img src>` chez les prestataires.
- **Impact** : pixel de tracking (IP et horaires des prestataires), image choquante hébergée ailleurs, URL `javascript:` (inoffensive dans `<img>`, mais à refuser).
- **Recommended fix** : accepter uniquement les URLs `https://<projet>.supabase.co/storage/v1/object/public/avatars/<userId>-…` appartenant à l'auteur.
- **Test to verify fix** : `photos: ["https://evil.example/x.png"]` → 400.
- **Status** : OPEN

### SEC-022 — Changement d'email sans ré-authentification
- **Severity** : MEDIUM
- **Category** : Authentication
- **File** : `backend/src/modules/users/user.service.ts` (`requestEmailChange`, `verifyEmailOtp`)
- **Endpoint** : `POST /api/users/profile/request-email-change`, `/verify-email-otp`
- **Description** : un token volé suffit à changer l'email (OTP envoyé à la **nouvelle** adresse contrôlée par l'attaquant), puis à faire forgot-password : prise de contrôle **persistante**.
- **Recommended fix** : exiger le mot de passe actuel ; notifier l'ancienne adresse avec un lien d'annulation valable 7 j.
- **Test to verify fix** : `request-email-change` sans `currentPassword` → 400 ; email de notification reçu sur l'ancienne adresse.
- **Status** : OPEN

### SEC-023 — Données personnelles publiques des prestataires
- **Severity** : MEDIUM
- **Category** : GDPR / Data exposure
- **File** : `backend/src/controllers/prestataires.controller.ts` (l. 12-66, 133-175)
- **Endpoint** : `GET /api/prestataires/:id`, `GET /api/prestataires` (sans auth)
- **Description** : expose `pointDepotAdresse`, `pointDepotCodePostal`, `pointDepotInstructions` à tout internet ; la liste et le détail incluent les comptes suspendus ou supprimés (pas de filtre `user.isActive`/`deletedAt`) ; pas de pagination.
- **Impact** : adresse potentiellement personnelle publiée (scraping) ; profils de prestataires bannis visibles.
- **Recommended fix** : adresse exacte visible seulement par un client ayant une prestation payée avec ce prestataire ; en public, ville + code postal seulement. Filtrer `user: { isActive: true, deletedAt: null }`. Paginer (20).
- **Test to verify fix** : `GET /api/prestataires/:id` anonyme → pas de `pointDepotAdresse` ; un prestataire suspendu → 404.
- **Status** : OPEN

### SEC-024 — Suppression de compte incomplète (RGPD)
- **Severity** : MEDIUM
- **Category** : GDPR
- **File** : `backend/src/modules/users/user.service.ts` (`confirmDeleteAccount`)
- **Endpoint** : `POST /api/users/profile/confirm-delete-account`
- **Description** : anonymise `User` seulement. Ne touche pas Stripe Connect (`accounts.del` / rejet), les fichiers Storage, les messages, les adresses de point de dépôt, les jobs Redis. Pas d'export de données.
- **Recommended fix** : procédure de suppression complète (en tenant compte des obligations comptables : conserver les factures/montants 10 ans, anonymiser le reste) ; endpoint d'export JSON.
- **Test to verify fix** : suppression puis vérification qu'aucun fichier `${userId}-*` ne reste dans le bucket, que les champs PII du prestataire sont nuls et que le compte Connect est rejeté.
- **Status** : OPEN

### SEC-025 — Dépendances vulnérables
- **Severity** : HIGH
- **Category** : Vulnerable components (A06)
- **File** : `package.json` (front), `backend/package.json`
- **Endpoint** : —
- **Description** : voir §14. Next 14.2.35 a des avis **critical** (DoS image optimizer, désérialisation de requêtes) ; axios, ws et path-to-regexp ont des avis high.
- **Recommended fix** :
  1. Immédiat, sans breaking : `npm audit fix` backend (même majeurs), axios 1.20, morgan 1.12.1, bullmq 5.81, resend 6.31.
  2. Planifié : Next 16 (+ React 19) dans une branche dédiée, avec tests de non-régression de toutes les pages.
  3. En attendant : vérifier pour chaque avis Next s'il s'applique (ex. pas de `remotePatterns` configuré, donc l'avis image optimizer ne s'applique pas).
- **Test to verify fix** : `npm audit --omit=dev` → 0 high/critical ; build + parcours E2E en staging.
- **Status** : PARTIAL — `npm audit fix` sans `--force` (backend : 1 moderate restant `qs` via express 4 ; front : axios 1.20). Restent Next 14 (critical, nécessite Next 16) et glob/minimatch (outillage dev).

### SEC-026 — `prisma db push` au build de production, pas de migrations
- **Severity** : MEDIUM
- **Category** : Database / CI-CD
- **File** : `backend/railway.toml` (+ `railway.json`, `nixpacks.toml` concurrents)
- **Endpoint** : —
- **Description** : chaque déploiement synchronise le schéma via `db push`. Un dossier `prisma/migrations` existe mais il est **partiel et non baseliné** (`20260903071556_add_stripe_connect`, `20260924124624_add_user_postal_code`, `v6_new_statuses.sql` hors format Prisma) : il ne permet ni de reconstruire le schéma ni de faire `migrate deploy`. Un renommage de champ = perte de données (`db push` refuse sans `--accept-data-loss`, ce qui bloque le build, ou l'option est ajoutée en urgence). Le seed est rejoué à chaque build. Il n'y a pas de rollback.
- **Recommended fix** : `prisma migrate diff` pour baseliner l'existant (`migrate resolve --applied`), puis `prisma migrate deploy` en **release/pre-deploy** (pas en build) ; seed idempotent hors déploiement ; un seul fichier de config Railway.
- **Test to verify fix** : déploiement staging → `_prisma_migrations` présent, aucune requête DDL non prévue.
- **Status** : OPEN

### SEC-027 — Configuration d'environnement non bloquante
- **Severity** : MEDIUM
- **Category** : Misconfiguration
- **File** : `backend/src/config/env.config.ts`, `backend/src/index.ts`
- **Description** : en prod, une variable critique manquante → `console.warn` seulement ; CORS revient à `localhost:3000` ; `dotenv.config()` est appelé après des imports qui lisent l'env.
- **Recommended fix** : schéma Zod de l'env, `process.exit(1)` en prod si JWT_SECRET (≥ 32 caractères), JWT_REFRESH_SECRET, DATABASE_URL, STRIPE_*, RESEND_API_KEY, FRONTEND_URL ou REDIS_URL manque ; `import "dotenv/config"` en première ligne.
- **Test to verify fix** : démarrer avec `NODE_ENV=production` sans `JWT_SECRET` → exit 1.
- **Status** : OPEN

### SEC-028 — Gestion d'erreurs globale absente
- **Severity** : MEDIUM
- **Category** : Resilience
- **File** : `backend/src/index.ts`, `payment.controller.ts` (`stripeWebhookHandler`), `connect.controller.ts`
- **Description** : pas de middleware d'erreur, pas de `process.on("unhandledRejection")`, pas de SIGTERM. Une erreur Prisma dans le webhook (après la signature) donne une promesse rejetée non gérée, donc un **crash** possible du process (Node 24).
- **Recommended fix** : try/catch dans les webhooks (500 pour que Stripe réessaie) ; middleware d'erreur final ; handlers process qui loggent + exit propre ; graceful shutdown (`server.close`, `worker.close`, `prisma.$disconnect`).
- **Test to verify fix** : en staging, couper la BDD et envoyer un événement Stripe test → réponse 500, process vivant.
- **Status** : OPEN

### SEC-029 — Modèle de données : Float, index, contraintes
- **Severity** : MEDIUM
- **Category** : Database
- **File** : `backend/prisma/schema.prisma`
- **Description** : voir §7.
- **Recommended fix** : `Decimal @db.Decimal(10,2)` (ou centimes `Int`) ; `@@index` sur les FK listées ; `@@unique([demandeId, prestataireId])` sur Devis ; relation sur `Transfer.prestataireId` ; enum pour `Signalement.statut`.
- **Test to verify fix** : `EXPLAIN` sur les requêtes principales en staging avec données volumineuses → Index Scan.
- **Status** : OPEN

### SEC-030 — Endpoints non paginés
- **Severity** : MEDIUM
- **Category** : Performance / DoS
- **File** : `devis.service.ts` (`getDemandesDisponibles`), `prestataires.controller.ts`, `message.service.ts`, `prestation.service.ts`
- **Description** : chargements complets en mémoire, dont un endpoint public.
- **Recommended fix** : pagination cursor (20-50) ; `_count` au lieu d'inclure les tableaux de prestations.
- **Test to verify fix** : scénario k6 n° 1 et n° 3.
- **Status** : OPEN

### SEC-031 — Crons et worker dupliqués en multi-instance
- **Severity** : LOW
- **Category** : Resilience
- **File** : `backend/src/index.ts` (l. 101-104), `jobs/*.ts`
- **Description** : chaque instance exécute les crons (et l'auto-validation au boot). Sans danger à une instance ; avec plusieurs, on aurait des notifications en double (et des races, cf. SEC-010).
- **Recommended fix** : jobs répétables BullMQ (un seul exécutant) ou verrou Redis (`SET NX PX`).
- **Status** : OPEN

### SEC-032 — Tokens dans les URLs, logs et Redis
- **Severity** : LOW
- **Category** : Sensitive data exposure
- **File** : `index.ts` (`morgan("dev")`), `auth.routes.ts` (`GET /verify-email?token=`), `email.queue.ts`
- **Description** : le token de vérification est loggé dans l'URL ; les liens reset/verify restent dans Redis (`removeOnComplete: 100`).
- **Recommended fix** : vérification par POST (le front lit le token et le poste) ; format morgan sans query string ; `removeOnComplete: true` pour les jobs contenant des tokens.
- **Status** : OPEN

### SEC-033 — Limites d'entrée
- **Severity** : LOW
- **Category** : Validation
- **File** : `index.ts` (`express.json({limit:"10mb"})`), `contact.routes.ts`, `demande.service.ts`, `user.service.ts`
- **Description** : 10 Mo de JSON sur toutes les routes ; pas de longueur max sur titre, description, bio, motif ou `reference` (cette dernière va dans le sujet de l'email) ; `competences` non borné.
- **Recommended fix** : 100 kb par défaut, 7 Mo seulement sur les routes d'upload ; `max()` Zod sur tous les champs texte ; `reference` en regex `^TSK-\d{6}$`.
- **Status** : OPEN

### SEC-034 — Arrondi de la commission
- **Severity** : LOW
- **Category** : Payment
- **File** : `backend/src/config/commission.config.ts`
- **Description** : ±0,01 € entre prestataire + commission et le total dans ~3,6 % des montants (voir tableau §8).
- **Recommended fix** : calcul en centimes, `commission = total − prestataire`.
- **Test to verify fix** : test unitaire paramétré sur 0,01 → 10 000 € : `p + c === total` pour tous.
- **Status** : FIXED — calcul en centimes, commission = total − part prestataire ; test sur 0,01 → 9 999,99 € (999 999 montants).

### SEC-035 — Création concurrente de comptes Connect
- **Severity** : LOW
- **Category** : Payment / Concurrency
- **File** : `backend/src/modules/payment/connect.service.ts` (`getOrCreateConnectAccount`)
- **Description** : deux appels simultanés créent deux comptes Stripe ; le dernier écrit gagne et l'autre est orphelin.
- **Recommended fix** : `idempotencyKey: connect_account_${prestataire.id}` sur `accounts.create` + `updateMany where stripeAccountId: null`.
- **Status** : OPEN

### SEC-036 — Script mort
- **Severity** : LOW (INFO)
- **File** : `backend/scripts/encrypt-bank-data.ts` (importe `../src/lib/crypto`, inexistant)
- **Recommended fix** : supprimer.
- **Status** : OPEN

### SEC-037 — Garde de rôle implicite
- **Severity** : LOW
- **Category** : Authorization
- **File** : `routes/demande.routes.ts`, `devis-actions.routes.ts`, `prestation.routes.ts`, `message.routes.ts`, `conversation.routes.ts`
- **Description** : pas de `requireRole` ; la sécurité repose sur les lookups `client`/`prestataire` dans chaque service. C'est correct aujourd'hui, mais fragile.
- **Recommended fix** : `requireRole("CLIENT")` / `requireRole("PRESTATAIRE")` sur chaque route (défense en profondeur).
- **Status** : OPEN

### SEC-038 — Pas de CI ni de tests automatisés
- **Severity** : MEDIUM
- **Category** : CI/CD
- **Description** : aucune barrière avant déploiement.
- **Recommended fix** : GitHub Actions : `npm ci`, `tsc --noEmit` (front + back), `next lint`, `npm audit --omit=dev --audit-level=high`, tests d'intégration (Vitest + Supertest + Postgres de test + Stripe test mode mocké) sur les flux SEC-001/002/005/008.
- **Status** : PARTIAL — `npm test` (node:test, aucune dépendance ajoutée) : vérification PI + commission. Pas encore de CI ni de tests d'intégration.

### SEC-039 — Monitoring et alerting absents
- **Severity** : MEDIUM
- **Category** : Logging & Monitoring (A09)
- **Description** : voir §20.
- **Recommended fix** : Sentry (front + back) ; logs JSON (pino) avec request-id ; `/health` qui vérifie BDD + Redis ; alertes sur webhook 5xx, échec de transfert, queue email > N en attente, échec de cron ; uptime check externe.
- **Status** : OPEN

### SEC-040 — Réutilisation d'un PaymentIntent sans vérifier le montant
- **Severity** : LOW
- **Category** : Payment
- **File** : `payment.controller.ts` (l. 51-56)
- **Description** : si `montantFinal` change après la création du PI (cas limite), l'ancien PI est réutilisé avec l'ancien montant.
- **Recommended fix** : si `existing.amount !== montantCentimes`, faire `paymentIntents.update(amount)` ou annuler et recréer.
- **Status** : FIXED — PI réutilisé mis à jour si le montant diffère ; minimum Stripe 0,50 € vérifié à la création.

---

## Matrice des findings

| ID | Catégorie | Sévérité | Fichier | Endpoint | Risque | Correction | Status |
|---|---|---|---|---|---|---|---|
| SEC-001 | Auth / Recovery | CRITICAL | user.service.ts | POST /api/auth/recover-email/* | Prise de contrôle de tout compte (admin inclus) | Désactiver en prod ; compteur atomique ; confirmation par lien | FIXED (mitigé) |
| SEC-002 | Paiement | CRITICAL | payment.controller.ts | POST /api/payment/confirm | Prestation démarrée sans paiement | Lier PI ↔ prestation ↔ montant | FIXED |
| SEC-003 | Secrets | CRITICAL | scripts/create-admin.ts | /api/auth/login | Accès admin | Changer le mdp, script via env | FIXED (code) |
| SEC-004 | Rate limit | HIGH | index.ts | toutes / login | DoS login global, pas d'anti-brute-force | `trust proxy` + clé IP+email | FIXED |
| SEC-005 | Session | HIGH | auth.middleware.ts, admin.service.ts | toutes | Suspension inefficace | Check BDD isActive + révocation | FIXED |
| SEC-008 | Logique métier | HIGH | devis.service.ts | PATCH /api/devis/:id/accept | Double prestation / double paiement | Transition conditionnelle en transaction | FIXED |
| SEC-011 | Paiement | HIGH | webhook, transfer.service.ts | webhooks | Fonds bloqués, pertes chargeback | Réconciliation + disputes + refunds | PARTIAL |
| SEC-025 | Dépendances | HIGH | package.json ×2 | — | CVE Next critical, axios/ws high | audit fix + plan Next 16 | PARTIAL |
| SEC-006 | Auth | MEDIUM | auth.controller.ts | POST /register/* | Comptes non vérifiés actifs | Bloquer les actions sans email vérifié | OPEN |
| SEC-007 | Auth | MEDIUM | auth.service.ts | GET /verify-email | Oracle/DoS OTP | Filtrer par type + hash | OPEN |
| SEC-009 | Auth | MEDIUM | user.service.ts | /profile/verify-*-otp, confirm-delete | Contournement limite d'essais | Incrément atomique | FIXED |
| SEC-010 | Logique métier | MEDIUM | autoValidate.job.ts, prestation.service.ts | cron, valider/contester | Versement malgré litige | updateMany conditionnel | FIXED |
| SEC-012 | Validation | MEDIUM | devis.service.ts | POST /demandes/:id/devis | Devis non payables, prestataire non éligible | Garde éligibilité + bornes + unique | OPEN |
| SEC-014 | Auth | MEDIUM | auth.controller.ts… | login, check-*, recover, resend | Énumération | Réponses génériques | OPEN |
| SEC-015 | Rate limit | MEDIUM | routes/* | register, forgot, contact, upload… | Email bombing, spam | Limiteurs dédiés (Redis) | OPEN |
| SEC-016 | Auth | MEDIUM | auth.*.controller.ts | register, reset-password | Mots de passe faibles | Politique unique | OPEN |
| SEC-018 | Session | MEDIUM | auth-store.ts, jwt.ts | refresh, logout | Vol de session long | Access court, refresh HttpOnly hashé | OPEN |
| SEC-019 | Frontend | MEDIUM | next.config.cjs | toutes pages | Clickjacking, pas d'atténuation XSS | Headers + CSP | OPEN |
| SEC-022 | Auth | MEDIUM | user.service.ts | request-email-change | Takeover persistant après vol de session | Mot de passe + notif ancienne adresse | OPEN |
| SEC-023 | RGPD | MEDIUM | prestataires.controller.ts | GET /api/prestataires/:id | Adresse publique, bannis visibles | Masquer, filtrer isActive | OPEN |
| SEC-024 | RGPD | MEDIUM | user.service.ts | confirm-delete-account | Données résiduelles | Suppression complète + export | OPEN |
| SEC-026 | BDD / Déploiement | MEDIUM | railway.toml | — | Perte de données, pas de rollback | migrate deploy | OPEN |
| SEC-027 | Config | MEDIUM | env.config.ts | — | Démarrage mal configuré silencieux | Fail-fast | OPEN |
| SEC-028 | Résilience | MEDIUM | index.ts, webhooks | webhooks | Crash process | Error handlers + shutdown | OPEN |
| SEC-029 | BDD | MEDIUM | schema.prisma | — | Arrondis, lenteurs, doublons | Decimal, index, unique | OPEN |
| SEC-030 | Performance | MEDIUM | devis.service.ts… | /demandes/available, /prestataires | Lenteur/DoS | Pagination | OPEN |
| SEC-038 | CI/CD | MEDIUM | — | — | Régressions non détectées | Pipeline CI | PARTIAL |
| SEC-039 | Monitoring | MEDIUM | — | — | Incidents invisibles | Sentry + alertes | OPEN |
| SEC-013 | Validation | LOW | prestation.controller.ts | POST /prestations/:id/etat-des-lieux | Prestation bloquée | Bornes | OPEN |
| SEC-017 | Auth | LOW | auth.controller.ts | register, login | Doublons de comptes | lowercase | OPEN |
| SEC-020 | Upload | LOW | user.controller.ts | /users/avatar, /users/photo | Abus de stockage | Magic bytes, sharp, quota | OPEN |
| SEC-021 | Validation | LOW | demande.service.ts | POST /demandes | Tracking des prestataires | URLs du bucket uniquement | OPEN |
| SEC-031 | Résilience | LOW | index.ts | — | Doublons multi-instance | Verrou / jobs BullMQ | OPEN |
| SEC-032 | Données sensibles | LOW | index.ts, email.queue.ts | GET /verify-email | Tokens en logs/Redis | POST + purge | OPEN |
| SEC-033 | Validation | LOW | index.ts… | toutes | Gros payloads | Limites | OPEN |
| SEC-034 | Paiement | LOW | commission.config.ts | — | ±0,01 € | Centimes | FIXED |
| SEC-035 | Paiement | LOW | connect.service.ts | POST /connect/account | Comptes orphelins | Idempotency key | OPEN |
| SEC-036 | Hygiène | LOW | scripts/encrypt-bank-data.ts | — | — | Supprimer | OPEN |
| SEC-037 | Autorisation | LOW | routes/* | — | Régression future | requireRole explicite | OPEN |
| SEC-040 | Paiement | LOW | payment.controller.ts | POST /payment/create-intent | Montant obsolète | Comparer/mettre à jour | FIXED |

## Checklist pré-production

### BLOCKER (à faire avant ouverture)
- [ ] **CRITICAL** SEC-001 — désactiver recover-email en prod (au minimum), puis corriger
- [ ] **CRITICAL** SEC-002 — lier le PaymentIntent à la prestation dans `/payment/confirm`
- [ ] **CRITICAL** SEC-003 — changer le mot de passe admin prod, corriger le script
- [ ] **HIGH** SEC-004 — `trust proxy` + vérification en staging
- [ ] **HIGH** SEC-005 — suspension effective (check BDD + révocation)
- [ ] **HIGH** SEC-008 — acceptation de devis atomique
- [ ] **HIGH** SEC-011 (partiel) — réconciliation des transferts SKIPPED/FAILED + alerte sur `charge.dispute.created`
- [ ] **HIGH** SEC-025 (partiel) — `npm audit fix` non-breaking + analyse applicabilité des avis Next
- [ ] **NON VÉRIFIÉ** — clés Stripe live en prod / test en staging ; secrets JWT forts ; backups Supabase activés

### NON-BLOCKER (à planifier juste après)
- **MEDIUM** : SEC-006, 007, 009, 010, 012, 014, 015, 016, 018, 019, 022, 023, 024, 026, 027, 028, 029, 030, 038, 039
- **LOW** : SEC-013, 017, 020, 021, 031, 032, 033, 034, 035, 036, 037, 040
- **INFO** :
  - endpoint de changement de mot de passe connecté manquant ;
  - Twilio non configuré, donc tout le flux téléphone inopérant ;
  - 3 fichiers de config Railway concurrents.

> Remarque : SEC-010, SEC-012 et SEC-015 sont classés MEDIUM mais sont peu coûteux et à fort impact métier. Je recommande de les inclure dans la phase 1 si le temps le permet.

## Plan de correction

Chaque correction : un commit par finding, testable isolément. Les tests ajoutés utilisent une BDD de test et le **Stripe test mode** (aucun vrai paiement).

### PHASE 1 — Bloquants (CRITICAL + HIGH bloquants)

| # | Finding | Changement | Fichiers | Risque de régression | Test à ajouter |
|---|---|---|---|---|---|
| 1.1 | SEC-003 | Mdp admin changé par vous en prod ; script lisant l'env, refus de promotion d'un compte existant | `scripts/create-admin.ts` | Nul (script manuel) | — (vérif. manuelle) |
| 1.2 | SEC-001 | Feature flag `RECOVER_EMAIL_ENABLED` (false si pas de Twilio) ; incrément atomique ; changement d'email via lien de confirmation + notif ancienne adresse ; refus pour ADMIN ; réponses génériques | `user.service.ts`, `user.controller.ts`/`auth.recovery.controller.ts`, `auth.routes.ts`, front `login/page.tsx` (message si désactivé) | Moyen : le parcours "email perdu" change côté UI | Intégration : brute-force parallèle → verrouillé ; flag off → 503 |
| 1.3 | SEC-002 | Vérif `pi.id`, `metadata.prestationId`, `amount_received`, `currency` (confirm + webhook) | `payment.controller.ts` | Faible : le front envoie déjà le bon PI | Intégration Stripe test : PI d'une autre prestation → 400 |
| 1.4 | SEC-004 | `app.set("trust proxy", 1)` ; loginLimiter clé IP+email | `index.ts`, `auth.routes.ts` | Moyen si le nombre de proxies est mal configuré (vérifier `req.ip` en staging) | Unitaire supertest avec `X-Forwarded-For` |
| 1.5 | SEC-005 | `authMiddleware` charge l'utilisateur (isActive, deletedAt, role) ; refresh idem ; `suspendUser` supprime les refresh tokens | `auth.middleware.ts`, `auth.controller.ts`, `admin.service.ts` | Faible ; +1 requête BDD par appel (acceptable, cache possible) | Suspendre → `/me` 401, `/refresh` 401 |
| 1.6 | SEC-008 | Transition conditionnelle en transaction + checks PUBLIEE/expiresAt | `devis.service.ts` | Moyen : flux central, tester MODIFICATION et standard | 20 accepts parallèles → 1 prestation |
| 1.7 | SEC-011 (min.) | Job de réconciliation transferts + relance sur `payouts_enabled` + webhook `charge.dispute.created` (gel + alerte admin) | `transfer.service.ts`, `connect.service.ts`, `payment.controller.ts`, nouveau job | Moyen : risque de double transfert → garder unique BDD + clé par tentative | Stripe CLI : trigger dispute ; SKIPPED rejoué |
| 1.8 | SEC-025 (min.) | `npm audit fix` backend (sans `--force`), axios 1.20, morgan 1.12.1 | `package*.json` | Faible (mêmes majeurs) ; build + tsc | `npm audit --omit=dev` |

### PHASE 2 — HIGH restants et MEDIUM à fort impact
- **SEC-025** : migration Next 16 dans une branche dédiée (React 19). Risque **élevé**. Tests : parcours E2E complet en staging.
- **SEC-010** : `updateMany` conditionnels dans valider, contester, cron. Test : course simulée.
- **SEC-012 / SEC-013** : gardes d'éligibilité, bornes de montant, `@@unique` Devis (attention aux doublons existants : requête de détection avant migration).
- **SEC-015** : limiteurs dédiés avec store Redis.
- **SEC-006 / SEC-007** : vérification d'email obligatoire pour les actions métier ; filtrage du type de token. Risque : comptes existants non vérifiés bloqués, donc prévoir une campagne de renvoi.

### PHASE 3 — MEDIUM
- **SEC-014, SEC-016, SEC-017** : réponses d'auth unifiées, politique de mot de passe, emails en minuscules (+ script de détection de doublons).
- **SEC-018** : refresh en cookie HttpOnly hashé, access 15 min, refresh silencieux côté front. Risque : changement d'architecture auth front et back ; CORS `credentials` déjà actif.
- **SEC-019** : headers et CSP (d'abord en Report-Only).
- **SEC-022** : mot de passe exigé pour changer email ou téléphone.
- **SEC-023 / SEC-024** : RGPD (masquage de l'adresse, suppression complète, export).
- **SEC-026** : baseline des migrations Prisma, `migrate deploy` en pre-deploy. Risque **élevé** si mal fait : répéter sur une copie de la BDD.
- **SEC-027, SEC-028** : env fail-fast, handlers d'erreurs, graceful shutdown.
- **SEC-029, SEC-030** : index, Decimal (migration de données), pagination (impacte le front).
- **SEC-038, SEC-039** : CI GitHub Actions, Sentry, health check étendu.

### PHASE 4 — Hardening
- **SEC-020 / SEC-021** : sharp + magic bytes + bucket privé pour les photos de demandes + whitelist d'URLs.
- **SEC-031** : jobs BullMQ répétables.
- **SEC-032 / SEC-033** : verify-email en POST, morgan sans query, limites de body et de champs.
- **SEC-034, SEC-035, SEC-037, SEC-040, SEC-036** : centimes, idempotency Connect, `requireRole` explicite, contrôle montant PI, nettoyage.
- 2FA admin (TOTP) ; endpoint de changement de mot de passe ; RLS Supabase activée en défense en profondeur ; tests de charge (§17) en staging.

---

## Annexe A — Endpoints API

| METHOD | ROUTE | AUTH | ROLE | VALIDATION | RATE LIMIT | OWNERSHIP | SENSITIVE DATA | RISK |
|---|---|---|---|---|---|---|---|---|
| POST | /api/auth/register/client | Non | — | Zod (partiel) | global | — | email, tél, mdp | MEDIUM (SEC-006/015/016/017) |
| POST | /api/auth/register/prestataire | Non | — | Zod (partiel) | global | — | idem | MEDIUM |
| POST | /api/auth/login | Non | — | Zod | login 10/15 min (proxy) | — | tokens | HIGH (SEC-004/014) |
| POST | /api/auth/refresh | Non | — | manuelle | global | token | tokens | MEDIUM (SEC-005/018) |
| GET | /api/auth/verify-email | Non | — | aucune | global | — | token en URL | MEDIUM (SEC-007/032) |
| POST | /api/auth/resend-verification | Non | — | manuelle | global | — | — | MEDIUM (SEC-014/015) |
| POST | /api/auth/forgot-password | Non | — | manuelle | global | — | — | MEDIUM (SEC-015) |
| POST | /api/auth/reset-password | Non | — | **aucune politique** | global | token | mdp | MEDIUM (SEC-016) |
| GET | /api/auth/check-email | Non | — | — | global | — | existence de compte | MEDIUM (SEC-014) |
| GET | /api/auth/check-phone | Non | — | — | global | — | existence de compte | MEDIUM (SEC-014) |
| POST | /api/auth/recover-email/send-otp | Non | — | manuelle | global | — | tél masqué | **CRITICAL (SEC-001)** |
| POST | /api/auth/recover-email/verify-otp | Non | — | `newEmail` non validé | global | — | changement d'email | **CRITICAL (SEC-001)** |
| GET | /api/auth/me | Oui | tous | — | global | soi | profil | OK |
| POST | /api/auth/logout | Oui | tous | — | global | soi | — | LOW (SEC-018) |
| POST | /api/users/avatar | Oui | tous | MIME déclaré, 5 Mo | global | soi | fichier | LOW (SEC-020) |
| DELETE | /api/users/avatar | Oui | tous | — | global | soi | — | OK |
| POST | /api/users/photo | Oui | tous | MIME déclaré, 5 Mo | global | — | fichier | LOW (SEC-020) |
| GET/PATCH | /api/users/profile | Oui | tous | partielle | global | soi | PII | LOW |
| POST | /api/users/profile/request-phone-change | Oui | tous | manuelle | global | soi | OTP | MEDIUM (SEC-009) |
| POST | /api/users/profile/verify-phone-otp | Oui | tous | 6 chiffres | global | soi | — | MEDIUM (SEC-009) |
| POST | /api/users/profile/request-email-change | Oui | tous | manuelle | global | soi | OTP | MEDIUM (SEC-022) |
| POST | /api/users/profile/verify-email-otp | Oui | tous | 6 chiffres | global | soi | — | MEDIUM (SEC-009/022) |
| POST | /api/users/profile/request-delete-account | Oui | tous | — | global | soi | OTP | LOW |
| POST | /api/users/profile/confirm-delete-account | Oui | tous | 6 chiffres | global | soi | — | MEDIUM (SEC-009/024) |
| PATCH | /api/users/prestataire | Oui | PRESTATAIRE (implicite) | faible | global | soi | adresse | LOW |
| POST/PUT | /api/users/prestataire/competences | Oui | PRESTATAIRE (implicite) | tableau non borné | global | soi | — | LOW (SEC-033) |
| GET | /api/users/prestataire/stats | Oui | PRESTATAIRE | — | global | soi | — | OK |
| GET | /api/prestataires | **Non** | — | query | global | — | profils | MEDIUM (SEC-023/030) |
| GET | /api/prestataires/:id | **Non** | — | — | global | — | **adresse dépôt** | MEDIUM (SEC-023) |
| POST | /api/demandes | Oui | CLIENT (implicite) | partielle, photos libres | createDemandeLimiter | soi | photos | LOW (SEC-021/033) |
| GET | /api/demandes | Oui | CLIENT | — | global | soi | — | OK |
| GET | /api/demandes/available | Oui | PRESTATAIRE | — | global | matching | — | MEDIUM (SEC-030) |
| GET | /api/demandes/:id, /:id/detail, /:id/devis | Oui | tous | — | global | vérifiée | — | OK |
| POST | /api/demandes/:id/devis | Oui | PRESTATAIRE (implicite) | montant non borné | global | — | — | MEDIUM (SEC-012) |
| POST | /api/demandes/:id/ignorer | Oui | PRESTATAIRE | — | global | — | — | LOW |
| DELETE | /api/demandes/:id | Oui | CLIENT | statut | global | vérifiée | — | OK |
| GET | /api/devis/mes-stats, mes-devis, mes-devis-refuses | Oui | PRESTATAIRE | — | global | soi | — | OK (pagination) |
| PATCH | /api/devis/:id/accept | Oui | CLIENT (implicite) | — | global | vérifiée | — | HIGH (SEC-008) |
| PATCH | /api/devis/:id/refuse, /dismiss | Oui | CLIENT / PRESTATAIRE | — | global | vérifiée | — | LOW |
| GET | /api/prestations, /:id, /client | Oui | rôle implicite | — | global | vérifiée | tél client (prestataire) | OK |
| POST | /api/prestations/:id/etat-des-lieux | Oui | PRESTATAIRE | `montantRevise` non borné | global | vérifiée | — | LOW (SEC-013) |
| PATCH | /api/prestations/:id/confirmer-conformite | Oui | PRESTATAIRE | statut | global | vérifiée | — | OK |
| PATCH | /api/prestations/:id/terminer | Oui | PRESTATAIRE | statut | global | vérifiée | — | OK |
| PATCH | /api/prestations/:id/valider | Oui | CLIENT | statut (non atomique) | global | vérifiée | déclenche transfert | MEDIUM (SEC-010) |
| PATCH | /api/prestations/:id/contester | Oui | CLIENT | motif ≥ 10 | global | vérifiée | — | MEDIUM (SEC-010) |
| POST | /api/prestations/:id/review | Oui | CLIENT | 1-5 entier | global | vérifiée | — | LOW (doublon concurrent : **NON VÉRIFIÉ** unique sur Review.prestationId) |
| GET/POST | /api/messages/:prestationId | Oui | participants | 1000 car., filtre contact | global | vérifiée | messages | LOW (spam) |
| GET | /api/messages/unread-*, /tasky-info* | Oui | tous | — | global | soi | — | MEDIUM (SEC-030) |
| GET/POST | /api/conversations, /:conversationId | Oui | participants | 1000 car. | global | vérifiée | messages | LOW |
| POST | /api/contact | Oui | tous | `reference` libre | global | — | — | LOW (SEC-015/033) |
| POST | /api/signalements | Oui | participants | message ≥ 10 | global | vérifiée | — | LOW |
| POST | /api/payment/create-intent | Oui | CLIENT | statut | global | vérifiée | client_secret | LOW (SEC-040) |
| POST | /api/payment/confirm | Oui | CLIENT | **PI non lié** | global | prestation vérifiée | — | **CRITICAL (SEC-002)** |
| POST | /api/payment/webhook | Signature Stripe | — | signature | global | — | — | MEDIUM (SEC-011/028) |
| POST | /api/payment/webhook/connect | Signature Stripe | — | signature | global | — | — | MEDIUM (SEC-011) |
| POST | /api/connect/account, /account-session | Oui | PRESTATAIRE | — | global | soi | client_secret Connect | LOW (SEC-035) |
| GET | /api/connect/status | Oui | PRESTATAIRE | — | global | soi | — | OK |
| GET | /api/admin/* (dashboard, users, prestations, signalements, paiements) | Oui | ADMIN | query | global | — | PII de tous | OK (paginé 20) |
| PATCH | /api/admin/users/:id/suspend, /reactivate | Oui | ADMIN | — | global | — | — | HIGH (SEC-005) |
| PATCH | /api/admin/signalements/:id/resolve | Oui | ADMIN | note libre | global | — | — | OK |
| POST | /api/admin/jobs/auto-validate | Oui | ADMIN | — | global | — | déclenche transferts | LOW (SEC-010) |
| GET/POST | /api/admin/test-email* | Oui | ADMIN | désactivé en prod | global | — | — | OK |
| GET | /health | Non | — | — | global | — | version | OK |

## Annexe B — Matrice des rôles

| Action | CLIENT | PRESTATAIRE | ADMIN | Contrôle effectif |
|---|---|---|---|---|
| Créer / supprimer une demande | ✅ (les siennes) | ❌ | ❌ | lookup `client` + ownership |
| Voir les demandes disponibles | ❌ | ✅ | ❌ | lookup `prestataire` + matching |
| Envoyer un devis | ❌ | ✅ **(toute demande PUBLIEE, même non éligible)** | ❌ | lookup `prestataire` (SEC-012) |
| Accepter / refuser un devis | ✅ (sur ses demandes) | ❌ | ❌ | ownership (race SEC-008) |
| État des lieux / conformité / terminer | ❌ | ✅ (ses prestations) | ❌ | ownership + statut |
| Valider / contester une prestation | ✅ | ❌ | ❌ (pas de résolution de litige admin) | ownership + statut |
| Payer | ✅ | ❌ | ❌ | ownership (SEC-002) |
| Onboarding Connect | ❌ | ✅ | ❌ | `requireRole` |
| Messagerie prestation / conversation | ✅ (participant) | ✅ (participant) | ❌ | participants |
| Avis | ✅ (après TERMINEE) | ❌ | ❌ | ownership + statut |
| Signalement | ✅ | ✅ (prestation la plus récente) | — | participants + statut |
| Suspendre / réactiver | ❌ | ❌ | ✅ **(sans effet sur les sessions, SEC-005)** | `requireRole` + `isAdmin` |
| Voir tous les utilisateurs / paiements | ❌ | ❌ | ✅ | `requireRole` + `isAdmin` |
| Rembourser / arbitrer un litige | ❌ | ❌ | ❌ **(inexistant, SEC-011)** | — |
| Compte suspendu (`isActive=false`) | ⚠️ accès conservé jusqu'à 7 j + refresh | idem | idem | aucun (SEC-005) |

## Annexe C — Informations nécessaires (NON VÉRIFIÉ)

1. Le mot de passe admin prod a-t-il été changé depuis `create-admin.ts` ? (répondre oui/non, **ne pas** me l'envoyer)
2. Préfixes des clés Stripe en prod et staging (`sk_live_`/`sk_test_`, `whsec_` distincts ?).
3. Existe-t-il un environnement **staging** séparé (URL, BDD, Redis) ? Indispensable pour tester SEC-004 et les tests de charge.
4. Log de `req.ip` et `X-Forwarded-For` sur Railway (pour SEC-004).
5. Plan Supabase, PITR, dernier test de restauration ; backup du Storage.
6. RLS / exposition PostgREST sur le projet Supabase (capture *Table Editor → RLS*).
7. Commande de build/start effectivement utilisée par Railway (lequel des 3 fichiers).
8. Longueur des `JWT_SECRET` / `JWT_REFRESH_SECRET` prod (≥ 32 octets, différents ?).
9. Régions et DPA de Resend, Upstash, Vercel, Railway.
10. Le point de dépôt des prestataires est-il en pratique leur domicile ? (impacte la gravité de SEC-023)
11. Unicité de `Review.prestationId` dans le schéma (je peux la vérifier si vous le souhaitez ; non lue dans cette passe).
