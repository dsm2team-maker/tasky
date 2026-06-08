# Tasky — Spécification API · Guide Postman

**Version :** 1.0  
**Base URL :** `http://localhost:3001`  
**Auth :** Bearer Token (JWT) dans le header `Authorization`

---

## Configuration Postman

### Variables d'environnement à créer

| Variable | Valeur |
|---|---|
| `base_url` | `http://localhost:3001` |
| `token_client` | *(obtenu après login client)* |
| `token_prestataire` | *(obtenu après login prestataire)* |
| `token_admin` | *(obtenu après login admin)* |
| `demande_id` | *(ID d'une demande créée)* |
| `devis_id` | *(ID d'un devis envoyé)* |
| `prestation_id` | *(ID d'une prestation créée)* |

### Header standard (routes authentifiées)
```
Authorization: Bearer {{token_client}}
Content-Type: application/json
```

---

## 1. AUTH — `/api/auth`

### POST /api/auth/register/client
**Description :** Inscription d'un client  
**Auth :** Non requise

```json
{
  "email": "test@mail.com",
  "password": "Test1234!",
  "firstName": "Jean",
  "lastName": "Dupont",
  "city": "Paris",
  "phone": "0612345678"
}
```

**Réponses :**
- `201` : `{ success: true, data: { user: {...}, tokens: { accessToken, refreshToken } } }`
- `400` : Données invalides
- `409` : Email déjà utilisé

---

### POST /api/auth/register/prestataire
**Auth :** Non requise

```json
{
  "email": "artisan@mail.com",
  "password": "Test1234!",
  "firstName": "Marie",
  "lastName": "Martin",
  "city": "Lyon",
  "phone": "0698765432",
  "competences": ["cat_id_1"],
  "cguAccepted": true
}
```

**Réponses :** `201` succès · `400` invalide · `409` email utilisé

---

### POST /api/auth/login
**Auth :** Non requise

```json
{
  "email": "test@mail.com",
  "password": "Test1234!"
}
```

**Réponses :**
- `200` : `{ success: true, data: { user: { id, email, role, firstName, ... }, tokens: { accessToken, refreshToken } } }`
- `401` : Mot de passe incorrect
- `403` : Email non vérifié / compte désactivé
- `404` : Utilisateur non trouvé

---

### POST /api/auth/refresh
**Auth :** Non requise

```json
{ "refreshToken": "{{refresh_token}}" }
```

**Réponses :** `200` nouveaux tokens · `401` token invalide

---

### POST /api/auth/logout
**Auth :** Requise

```json
{ "refreshToken": "{{refresh_token}}" }
```

**Réponses :** `200` déconnexion réussie

---

### GET /api/auth/me
**Auth :** Requise  
**Réponses :** `200` profil complet avec `client` ou `prestataire`

---

### GET /api/auth/verify-email?token=XXX
**Auth :** Non requise  
**Réponses :** `200` email vérifié · `400` token invalide

---

### POST /api/auth/resend-verification
**Auth :** Non requise

```json
{ "email": "test@mail.com" }
```

---

### POST /api/auth/forgot-password
**Auth :** Non requise

```json
{ "email": "test@mail.com" }
```

---

### POST /api/auth/reset-password
**Auth :** Non requise

```json
{
  "token": "{{reset_token}}",
  "password": "NouveauPass1234!"
}
```

---

### GET /api/auth/check-email?email=test@mail.com
**Auth :** Non requise  
**Réponses :** `200` `{ available: true/false }`

---

### GET /api/auth/check-phone?phone=0612345678
**Auth :** Non requise  
**Réponses :** `200` `{ available: true/false }`

---

### POST /api/auth/recover-email/send-otp
**Auth :** Non requise

```json
{ "email": "ancien@mail.com" }
```

---

### POST /api/auth/recover-email/verify-otp
**Auth :** Non requise

```json
{
  "email": "ancien@mail.com",
  "otp": "123456",
  "newEmail": "nouveau@mail.com"
}
```

---

## 2. USERS — `/api/users`

### GET /api/users/profile
**Auth :** Requise  
**Réponses :** `200` profil détaillé

---

### PATCH /api/users/profile
**Auth :** Requise

```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "city": "Paris"
}
```

---

### POST /api/users/avatar
**Auth :** Requise

```json
{ "imageData": "data:image/jpeg;base64,/9j/4AAQ..." }
```

---

### POST /api/users/profile/request-phone-change
**Auth :** Requise

```json
{ "newPhone": "0699999999" }
```

---

### POST /api/users/profile/verify-phone-otp
**Auth :** Requise

```json
{
  "otp": "123456",
  "newPhone": "0699999999"
}
```

---

### POST /api/users/profile/request-email-change
**Auth :** Requise

```json
{ "newEmail": "nouveau@mail.com" }
```

---

### POST /api/users/profile/verify-email-otp
**Auth :** Requise

```json
{
  "otp": "123456",
  "newEmail": "nouveau@mail.com"
}
```

---

### PATCH /api/users/prestataire
**Auth :** Requise (PRESTATAIRE)

```json
{
  "bio": "Artisan spécialisé en retouches textiles depuis 10 ans...",
  "disponibilite": "ACTIF",
  "pointDepotAdresse": "12 rue de la Paix",
  "pointDepotCodePostal": "75001",
  "pointDepotVille": "Paris",
  "pointDepotInstructions": "Sonner au 2ème étage"
}
```

---

### GET /api/users/prestataire/competences
**Auth :** Requise (PRESTATAIRE)

---

### PUT /api/users/prestataire/competences
**Auth :** Requise (PRESTATAIRE)

```json
{
  "competences": [
    { "categoryId": "cat_id_1" },
    { "categoryId": "cat_id_1", "subCategoryId": "sub_id_1" },
    { "categoryId": "cat_id_1", "subCategoryId": "sub_id_1", "interventionId": "int_id_1" }
  ]
}
```

---

### GET /api/users/prestataire/stats
**Auth :** Requise (PRESTATAIRE)  
**Réponses :** `200` `{ totalPrestations, prestationsTerminees, enCours, revenuTotal, rating, reviewCount }`

---

### POST /api/users/profile/request-delete-account
**Auth :** Requise

---

### POST /api/users/profile/confirm-delete-account
**Auth :** Requise

```json
{ "otp": "123456" }
```

---

## 3. DEMANDES — `/api/demandes`

### POST /api/demandes
**Auth :** Requise (CLIENT)

```json
{
  "titre": "Retouche robe de soirée",
  "description": "Raccourcir une robe de soirée de 10 cm, tissu satin noir",
  "typePrestation": "MODIFICATION",
  "categoryId": "cat_textile_id",
  "subCategoryId": "sub_id",
  "interventionIds": ["int_id_1"],
  "budget": 50,
  "ville": "Paris",
  "photos": [],
  "delaiJours": 7,
  "urgence": "NORMAL"
}
```

**Réponses :** `201` demande créée · `400` invalide · `404` catégorie inexistante

---

### GET /api/demandes
**Auth :** Requise (CLIENT)  
**Réponses :** `200` liste des demandes du client

---

### GET /api/demandes/:id
**Auth :** Requise (CLIENT)  
**Réponses :** `200` détail demande · `403` accès refusé · `404` non trouvée

---

### DELETE /api/demandes/:id
**Auth :** Requise (CLIENT)  
**Réponses :** `200` supprimée · `409` impossible (en cours)

---

### GET /api/demandes/available
**Auth :** Requise (PRESTATAIRE)  
**Réponses :** `200` liste des demandes disponibles avec score de matching

---

### GET /api/demandes/:id/detail
**Auth :** Requise (PRESTATAIRE)  
**Réponses :** `200` détail complet pour envoyer un devis

---

### GET /api/demandes/:id/devis
**Auth :** Requise (CLIENT)  
**Réponses :** `200` `{ demande: {...}, devis: [...] }`

---

### POST /api/demandes/:id/devis
**Auth :** Requise (PRESTATAIRE)

```json
{
  "montant": 75,
  "delai": 5,
  "description": "Je peux réaliser cette retouche en 5 jours. Tissu satin, finition soignée."
}
```

**Réponses :** `201` devis créé · `409` devis déjà envoyé · `403` prestataire inactif

---

## 4. DEVIS — `/api/devis`

### GET /api/devis/mes-stats
**Auth :** Requise (PRESTATAIRE)  
**Réponses :** `200` `{ envoyes, acceptes, refuses, enAttente, tauxAcceptation }`

---

### GET /api/devis/mes-devis-refuses
**Auth :** Requise (PRESTATAIRE)  
**Réponses :** `200` liste des devis refusés récents

---

### PATCH /api/devis/:id/accept
**Auth :** Requise (CLIENT)  
**Réponses :** `200` devis accepté, prestation créée · `400` non disponible · `403` accès refusé

---

### PATCH /api/devis/:id/refuse
**Auth :** Requise (CLIENT)  
**Réponses :** `200` devis refusé

---

### PATCH /api/devis/:id/dismiss
**Auth :** Requise (PRESTATAIRE)  
**Réponses :** `200` devis masqué de la liste des refusés

---

## 5. PRESTATIONS — `/api/prestations`

### GET /api/prestations
**Auth :** Requise (PRESTATAIRE)  
**Réponses :** `200` liste des prestations du prestataire

---

### GET /api/prestations/client
**Auth :** Requise (CLIENT)  
**Réponses :** `200` liste des prestations du client

---

### GET /api/prestations/:id
**Auth :** Requise (PRESTATAIRE)  
**Réponses :** `200` détail prestation avec état des lieux, messages

---

### POST /api/prestations/:id/etat-des-lieux
**Auth :** Requise (PRESTATAIRE)

```json
{
  "description": "L'objet est en bon état général, quelques petites taches sur le devant.",
  "photos": ["url_photo_1", "url_photo_2"],
  "montantRevise": 85
}
```

**Réponses :** `201` état des lieux créé · `409` déjà existant

---

### PATCH /api/prestations/:id/etat-des-lieux/valider
**Auth :** Requise (CLIENT)

```json
{ "accepte": true }
```

**Réponses :** `200` accepté ou refusé (demande republiée si false)

---

### PATCH /api/prestations/:id/confirmer-conformite
**Auth :** Requise (PRESTATAIRE)  
**Réponses :** `200` conformité confirmée

---

### PATCH /api/prestations/:id/terminer
**Auth :** Requise (PRESTATAIRE)  
**Réponses :** `200` prestation marquée terminée, délai J+3 démarré

---

### PATCH /api/prestations/:id/valider
**Auth :** Requise (CLIENT)  
**Réponses :** `200` prestation validée, statut TERMINEE

---

### PATCH /api/prestations/:id/contester
**Auth :** Requise (CLIENT)

```json
{ "motif": "Le travail ne correspond pas à ce qui a été convenu. La couture est mal faite." }
```

**Réponses :** `200` contestation enregistrée · `400` motif trop court

---

### POST /api/prestations/:id/review
**Auth :** Requise (CLIENT)

```json
{
  "rating": 5,
  "comment": "Excellent travail, très professionnel !"
}
```

**Réponses :** `201` avis créé · `409` avis déjà existant

---

## 6. MESSAGES — `/api/messages`

### GET /api/messages/unread-count
**Auth :** Requise  
**Réponses :** `200` `{ count: 3 }`

---

### GET /api/messages/unread-by-prestation
**Auth :** Requise  
**Réponses :** `200` `{ "prestation_id": 2, ... }`

---

### GET /api/messages/:prestationId
**Auth :** Requise  
**Réponses :** `200` `{ messages: [...], participants: { client: {...}, prestataire: {...} } }`

---

### POST /api/messages/:prestationId
**Auth :** Requise

```json
{ "contenu": "Bonjour, quand puis-je vous déposer l'article ?" }
```

**Réponses :** `201` message envoyé · `400` contenu vide/trop long/coordonnées détectées

---

## 7. PAYMENT — `/api/payment`

### POST /api/payment/create-intent
**Auth :** Requise (CLIENT)

```json
{ "prestationId": "{{prestation_id}}" }
```

**Réponses :** `200` `{ clientSecret: "pi_xxx_secret_xxx" }`

---

### POST /api/payment/confirm
**Auth :** Requise (CLIENT)

```json
{
  "prestationId": "{{prestation_id}}",
  "paymentIntentId": "pi_xxx"
}
```

**Réponses :** `200` paiement confirmé, prestation EN_COURS · `400` paiement non confirmé Stripe

---

## 8. SIGNALEMENTS — `/api/signalements`

### POST /api/signalements
**Auth :** Requise (CLIENT)

```json
{
  "demandeId": "{{demande_id}}",
  "message": "Le prestataire ne répond plus depuis 5 jours et n'a pas effectué le travail convenu."
}
```

**Réponses :**
- `201` signalement créé
- `400` message trop court (< 10 chars) / statut invalide
- `409` signalement déjà en cours

---

## 9. PRESTATAIRES — `/api/prestataires`

### GET /api/prestataires
**Auth :** Non requise

**Query params :** `?ville=Paris&categoryId=xxx&page=1`

**Réponses :** `200` liste paginée des prestataires publics

---

### GET /api/prestataires/:id
**Auth :** Non requise  
**Réponses :** `200` profil public avec compétences, avis, disponibilité

---

## 10. ADMIN — `/api/admin` *(token admin requis)*

### GET /api/admin/dashboard
**Réponses :** `200` `{ totalUsers, totalClients, totalPrestataires, prestationsActives, prestationsTerminees, caTotal, commissionTotal, signalentsOuverts }`

---

### GET /api/admin/users?page=1&search=
**Réponses :** `200` `{ users: [...], total, pages }`

---

### PATCH /api/admin/users/:id/suspend
**Réponses :** `200` utilisateur suspendu

---

### PATCH /api/admin/users/:id/reactivate
**Réponses :** `200` utilisateur réactivé

---

### GET /api/admin/prestations?page=1&status=
**Query params status :** `EN_COURS`, `A_VALIDER`, `TERMINEE`, `EN_ATTENTE_PAIEMENT`, `EN_ATTENTE_INSPECTION`, `ANNULEE`  
**Réponses :** `200` liste paginée

---

### GET /api/admin/prestations/:id
**Réponses :** `200` détail complet (demande, devis, messages, état des lieux, review)

---

### GET /api/admin/signalements?page=1
**Réponses :** `200` liste des signalements

---

### PATCH /api/admin/signalements/:id/resolve
```json
{ "note": "Litige résolu après médiation. Remboursement partiel accordé." }
```
**Réponses :** `200` signalement résolu, message Tasky-Infos créé

---

### GET /api/admin/paiements?page=1
**Réponses :** `200` liste des prestations payées avec IBAN et Stripe PI

---

### POST /api/admin/jobs/auto-validate
**Réponses :** `200` `{ message: "X prestation(s) auto-validée(s)" }`

---

## 11. Codes d'erreur communs

| Code HTTP | Signification |
|---|---|
| `200` | Succès |
| `201` | Créé avec succès |
| `400` | Données invalides / règle de gestion violée |
| `401` | Non authentifié (token manquant ou expiré) |
| `403` | Accès refusé (mauvais rôle ou pas le propriétaire) |
| `404` | Ressource non trouvée |
| `409` | Conflit (doublon, état incompatible) |
| `429` | Trop de tentatives (OTP) |
| `500` | Erreur serveur interne |

---

## 12. Collection Postman — Ordre de test recommandé

1. `POST /api/auth/register/client` → récupérer `accessToken`
2. `POST /api/auth/register/prestataire` → récupérer `accessToken`
3. `POST /api/demandes` (client) → récupérer `demande_id`
4. `POST /api/demandes/:id/devis` (prestataire) → récupérer `devis_id`
5. `PATCH /api/devis/:id/accept` (client) → prestation créée (`prestation_id`)
6. `POST /api/payment/create-intent` → `clientSecret`
7. `POST /api/payment/confirm` → prestation EN_COURS
8. `PATCH /api/prestations/:id/terminer` (prestataire)
9. `PATCH /api/prestations/:id/valider` (client)
10. `POST /api/prestations/:id/review` (client)
