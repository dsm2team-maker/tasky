# Tasky — Spécification Générale de Fonctionnement

**Version :** 1.0  
**Date :** Mai 2026  
**Environnement de test :** http://localhost:3000 (frontend) · http://localhost:3001 (backend)

---

## 1. Présentation de la plateforme

Tasky est une marketplace B2C spécialisée dans les **services artisanaux et de création textile**. Elle met en relation des **clients** qui ont un besoin de prestation avec des **prestataires** qualifiés qui proposent leurs compétences.

---

## 2. Acteurs

| Rôle | Description |
|---|---|
| **Client** | Publie des demandes, reçoit des devis, paie et valide les prestations |
| **Prestataire** | Répond aux demandes, réalise les prestations, perçoit le paiement |
| **Admin** | Supervise la plateforme, gère les litiges, suit les paiements |

---

## 3. Types de prestations

| Type | Description |
|---|---|
| `MODIFICATION` | Retouche ou modification d'un article existant. Nécessite un état des lieux (remise physique de l'objet) |
| `CREATION` | Création d'un article de A à Z. Paiement direct sans état des lieux |
| `FORMATION` | Apprentissage d'une technique. Paiement direct |

---

## 4. Cycle de vie d'une demande (StatusDemande)

```
PUBLIEE → EN_ATTENTE_INSPECTION → EN_ATTENTE_PAIEMENT → EN_COURS → A_VALIDER → TERMINEE
                                                                  ↘ (contestation) EN_COURS
```

| Statut | Déclencheur |
|---|---|
| `PUBLIEE` | Demande créée par le client |
| `EN_ATTENTE_INSPECTION` | Devis accepté (type MODIFICATION uniquement) |
| `EN_ATTENTE_PAIEMENT` | Devis accepté (CREATION/FORMATION) ou état des lieux accepté |
| `EN_COURS` | Paiement Stripe confirmé |
| `A_VALIDER` | Prestataire marque la prestation terminée |
| `TERMINEE` | Client valide OU auto-validation J+3 |
| `ANNULEE` | Annulation manuelle ou état des lieux refusé |

---

## 5. Cycle de vie d'une prestation (StatusPrestation)

Identique au cycle de la demande associée (synchronisés à chaque étape).

---

## 6. Règles de gestion critiques

### 6.1 Commission Tasky
- **15%** prélevée sur le montant du devis, à la charge du **prestataire**
- Le client paie exactement le montant affiché dans le devis
- Exemple : devis 100 € → client paie 100 € → prestataire reçoit 85 €

### 6.2 Auto-validation J+3
- Quand une prestation passe en `A_VALIDER`, un champ `autoValidateAt` est calculé à `now + 3 jours`
- Un cron job tourne **toutes les heures** et passe automatiquement les prestations en `TERMINEE` si le délai est dépassé sans action du client
- Un message Tasky-Infos est envoyé dans le chat pour notifier les parties

### 6.3 Paiement Stripe
- Le paiement est capturé via **Stripe Elements** (formulaire intégré, pas de redirection)
- Clés de test : utiliser les cartes Stripe de test (ex : `4242 4242 4242 4242`)
- Le webhook Stripe est configuré en fallback — le frontend appelle `/api/payment/confirm` après confirmation

### 6.4 Matching prestataire
- Chaque demande est scorée sur 100 points selon les compétences du prestataire
  - Catégorie : 40 pts
  - Sous-catégorie : 25 pts
  - Interventions : 20 pts
  - Localisation (ville) : 10 pts
  - Note prestataire : 5 pts
- Labels : `PARFAIT` (≥70), `BON` (≥40), `PARTIEL` (<40)

### 6.5 État des lieux (MODIFICATION uniquement)
- Le prestataire soumet un état des lieux avec photos (avant) et description
- Il peut proposer un montant révisé si l'objet diffère de la description initiale
- Le client accepte ou refuse :
  - **Acceptation** → passe en `EN_ATTENTE_PAIEMENT`
  - **Refus** → prestation annulée, demande republiée en `PUBLIEE`

### 6.6 Contestation
- Disponible quand la prestation est en `A_VALIDER`
- Le client conteste avec un motif (min 10 caractères)
- La prestation repasse en `EN_COURS`
- Un message Tasky-Infos est créé dans le chat

### 6.7 Signalement
- Disponible pour les prestations en `EN_COURS`, `A_VALIDER`, `EN_ATTENTE_PAIEMENT`, `EN_ATTENTE_INSPECTION`
- Un seul signalement actif par demande
- L'admin résout le signalement avec une note → notification Tasky-Infos au client

### 6.8 Activation du compte prestataire
Un prestataire doit compléter 5 étapes pour recevoir des demandes :
1. Email vérifié
2. Bio complétée (min 100 caractères)
3. Compétences ajoutées
4. Point de dépôt défini (adresse pour les échanges physiques)
5. IBAN renseigné

---

## 7. Emails transactionnels

| Événement | Destinataire |
|---|---|
| Inscription | Client ou Prestataire (lien de vérification) |
| Mot de passe oublié | Utilisateur |
| Nouveau devis reçu | Client |
| Devis non retenu | Prestataire |
| Paiement confirmé | Client + Prestataire |
| Prestation terminée | Client + Prestataire |
| Changement téléphone (OTP) | Utilisateur |
| Alerte changement email | Ancienne adresse |
| Suppression de compte (OTP) | Utilisateur |

---

## 8. Sécurité

- Authentification par **JWT** (access token 7 jours, refresh token 30 jours)
- Les routes sont protégées par `authMiddleware` (vérification du Bearer token)
- Le panel admin est accessible uniquement aux utilisateurs avec `role: ADMIN`
- Les routes `/prestataire/*` redirigent un admin/client vers leur espace

---

## 9. Architecture technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 14, TypeScript, TailwindCSS, React Query |
| Backend | Node.js, Express, TypeScript, Prisma 5 |
| Base de données | PostgreSQL (Supabase) |
| Paiement | Stripe Elements |
| Emails | Resend + BullMQ (Redis) |
| Stockage avatars | Supabase Storage |
