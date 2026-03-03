# 📋 Documentation des Routes - Tasky

## 🎯 Vue d'ensemble

**Projet** : Tasky - Marketplace de services artisanaux en click & collect  
**Concept** : Zéro contact domicile, tous les échanges en lieux neutres (points relais)  
**Phrase d'accroche** : "La bonne personne, pour la bonne tâche, près de chez vous."

---

## ✅ Pages créées (12 pages)

### 🏠 Page d'accueil

#### **`/`**

- **URL** : `http://localhost:3001/`
- **Accès** : Public
- **Rôle** : Page d'atterrissage principale
- **Contenu** :
  - Hero avec titre et 2 CTA (client/artisan)
  - Badges de confiance (1200+ artisans, 4.8/5, 24h)
  - Section "Pourquoi nous choisir" (clients + prestataires)
  - Section "Comment ça marche" (parcours client + artisan)
  - Témoignages
  - Double CTA final
  - Footer professionnel
- **Actions** :
  - Bouton "Je cherche un prestataire" → `/auth/register/client`
  - Bouton "Devenir prestataire" → `/auth/register/artisan/step-1`
  - Bouton "Se connecter" → `/auth/login`

---

### 🔐 Authentification (7 pages)

#### **`/auth/login`**

- **URL** : `http://localhost:3000/auth/login`
- **Accès** : Public
- **Rôle** : Connexion pour clients ET artisans
- **Contenu** :
  - Formulaire : email + mot de passe
  - Lien "Mot de passe oublié ?"
  - Liens inscription (client/artisan)
- **Validation** : Zod (email valide, mot de passe requis)
- **Actions** :
  - Connexion réussie → Redirige vers `/client/dashboard` ou `/artisan/dashboard` selon le rôle
  - Clic "Mot de passe oublié" → `/auth/forgot-password`

---

#### **`/auth/register/client`**

- **URL** : `http://localhost:3000/auth/register/client`
- **Accès** : Public
- **Rôle** : Inscription d'un nouveau client
- **Contenu** :
  - Formulaire : email, mot de passe, confirmation, CGU
  - **Indicateur de force du mot de passe** (temps réel)
  - Validation unicité email (debounced)
  - Couleurs PINK cohérentes
- **Validation** :
  - Email unique (vérification API)
  - Mot de passe : 8 caractères min, majuscule, minuscule, chiffre, caractère spécial
  - Confirmation identique
  - Acceptation CGU obligatoire
- **Actions** :
  - Inscription réussie → Mode démo : redirige vers `/client/dashboard`
  - Avec backend : redirige vers `/auth/verify-email?type=client`
  - Lien "Vous êtes prestataire ?" → `/auth/register/artisan/step-1`

---

#### **`/auth/register/artisan/step-1`**

- **URL** : `http://localhost:3000/auth/register/artisan/step-1`
- **Accès** : Public
- **Rôle** : Inscription artisan - Étape 1 sur 4 (Compte de base)
- **Contenu** :
  - ProgressSteps (1/4)
  - Formulaire : email, mot de passe, confirmation, CGU
  - **Indicateur de force du mot de passe** (temps réel)
  - Couleurs EMERALD cohérentes
  - Icône 🛠️
- **Validation** : Identique à register/client
- **Actions** :
  - Validation réussie → `/auth/register/artisan/step-2`
  - Sauvegarde user + token dans store (setAuth)

---

#### **`/auth/register/artisan/step-2`**

- **URL** : `http://localhost:3000/auth/register/artisan/step-2`
- **Accès** : Authentifié (redirige vers step-1 si non connecté)
- **Rôle** : Inscription artisan - Étape 2 sur 4 (Profil public)
- **Contenu** :
  - ProgressSteps (2/4, étape 1 validée en vert)
  - Upload photo de profil (drag & drop, preview)
  - Prénom, nom, bio, code postal
  - Icône 🛠️
- **Validation** :
  - Photo : max 5MB, formats image
  - Bio : 50 caractères min
  - Code postal : format français
- **Actions** :
  - Validation réussie → `/auth/register/artisan/step-3`
  - Bouton retour → `/auth/register/artisan/step-1`

---

#### **`/auth/register/artisan/step-3`**

- **URL** : `http://localhost:3000/auth/register/artisan/step-3`
- **Accès** : Authentifié (redirige vers step-1 si non connecté)
- **Rôle** : Inscription artisan - Étape 3 sur 4 (Vérification identité)
- **Contenu** :
  - ProgressSteps (3/4, étapes 1-2 validées en vert)
  - Choix type document (CNI / Passeport)
  - Upload pièce d'identité OU capture webcam
  - Preview du document
  - Encadré sécurité/confidentialité
  - Icône 🛠️
- **Validation** :
  - Document : max 10MB
  - Type requis
- **Actions** :
  - Validation réussie → `/auth/register/artisan/step-4`
  - Bouton retour → `/auth/register/artisan/step-2`

---

#### **`/auth/register/artisan/step-4`**

- **URL** : `http://localhost:3000/auth/register/artisan/step-4`
- **Accès** : Authentifié (redirige vers step-1 si non connecté)
- **Rôle** : Inscription artisan - Étape 4 sur 4 (CGU Artisan et finalisation)
- **Contenu** :
  - ProgressSteps (4/4, toutes étapes validées en vert)
  - CGU Artisan détaillées (scrollable)
  - Checkbox acceptation obligatoire
  - Encadré de bienvenue 🎉
  - Icône 🛠️
- **Validation** :
  - Acceptation CGU obligatoire
- **Actions** :
  - Validation réussie → Alert succès puis redirige vers `/artisan/dashboard`
  - Bouton retour → `/auth/register/artisan/step-3`

---

#### **`/auth/forgot-password`**

- **URL** : `http://localhost:3000/auth/forgot-password`
- **Accès** : Public
- **Rôle** : Demande de réinitialisation de mot de passe
- **Contenu** :
  - Formulaire : email
  - Info : "Email envoyé uniquement si l'adresse existe"
  - 2 états : formulaire initial / confirmation envoi
- **Validation** : Email valide
- **Actions** :
  - Soumission → Affiche écran de confirmation
  - Écran confirmation :
    - Instructions (vérifier email, cliquer sur lien, etc.)
    - Alert spam/courrier indésirable
    - Bouton "Renvoyer l'email"
    - Lien "Retour à la connexion" → `/auth/login`

---

#### **`/auth/reset-password`**

- **URL** : `http://localhost:3000/auth/reset-password?token=XXX`
- **Accès** : Public (via lien email)
- **Rôle** : Réinitialisation du mot de passe
- **Contenu** :
  - **5 états possibles** :
    1. **Loading** : Vérification du token (spinner)
    2. **Valid** : Formulaire de réinitialisation
    3. **Invalid** : Lien invalide (erreur)
    4. **Expired** : Lien expiré après 1h
    5. **Success** : Mot de passe changé avec succès
  - **État Valid (formulaire)** :
    - Encadré bleu avec les 5 règles (temps réel : ○ → ✓)
    - Nouveau mot de passe + confirmation
    - Indicateur de force (5 barres colorées)
    - Boutons show/hide sur les 2 champs
- **Validation** :
  - Mot de passe : 8 caractères min, majuscule, minuscule, chiffre, caractère spécial
  - Confirmation identique
- **Actions** :
  - **Valid** : Soumission → Écran Success → Redirige vers `/auth/login` après 3s
  - **Invalid/Expired** : Bouton "Demander un nouveau lien" → `/auth/forgot-password`

**URLs de test** :

```
Valid    : http://localhost:3000/auth/reset-password?token=abc123validtoken456789
Invalid  : http://localhost:3000/auth/reset-password?token=short
Expired  : http://localhost:3000/auth/reset-password?token=expired
```

---

#### **`/auth/verify-email`**

- **URL** : `http://localhost:3000/auth/verify-email?type=client` ou `?token=XXX`
- **Accès** : Public (via lien email ou après inscription)
- **Rôle** : Vérification de l'adresse email
- **Contenu** :
  - **4 états possibles** :
    1. **Loading** : Vérification du token (spinner)
    2. **Pending** : En attente (après inscription, pas de token)
    3. **Success** : Email vérifié avec succès
    4. **Invalid** : Lien invalide
    5. **Expired** : Lien expiré après 24h
  - **État Pending** :
    - Instructions étape par étape
    - Alert spam
    - Bouton "Renvoyer l'email"
    - Lien "Mauvaise adresse email ?"
  - **État Success** :
    - Animation bounce ✅
    - Message de bienvenue personnalisé (client/artisan)
    - Redirection automatique après 3s vers dashboard
  - **État Invalid/Expired** :
    - Explications des causes
    - Bouton "Renvoyer un nouveau lien" (emerald)
    - Bouton "Essayer de se connecter" (rose) ← Espacé avec mt-4
- **Actions** :
  - **Pending** : Bouton "Renvoyer" → Renvoie email de vérification
  - **Success** : Redirige automatiquement vers `/client/dashboard` ou `/artisan/dashboard`
  - **Invalid/Expired** : Bouton "Renvoyer" → Renvoie nouveau lien

**URLs de test** :

```
Pending  : http://localhost:3000/auth/verify-email?type=client
Success  : http://localhost:3000/auth/verify-email?token=abc123validtoken456789&type=client
Invalid  : http://localhost:3000/auth/verify-email?token=short
Expired  : http://localhost:3000/auth/verify-email?token=expired
```

---

### 📊 Dashboards - Après connexion (2 pages)

#### **`/client/dashboard`**

- **URL** : `http://localhost:3000/client/dashboard`
- **Accès** : Authentifié (redirige vers `/auth/login` si non connecté)
- **Rôle** : Tableau de bord principal du client
- **Contenu** :
  - **Header** : Logo, navigation (Dashboard, Recherche, Demandes, Messages), profil, déconnexion
  - **Banner rose** : "Bienvenue [nom] !", bouton CTA "Créer une nouvelle demande"
  - **4 cartes statistiques** :
    - Demandes actives (icône 📋 bleue)
    - En cours (icône ⏰ ambre)
    - Terminées (icône ✅ verte)
    - Nouveaux messages (icône 💬 rose)
  - **2 cartes actions rapides** :
    - Trouver un prestataire 🔍 (rose)
    - Créer une demande ➕ (emerald)
  - **État vide** : Aucune demande pour le moment
- **Actions** :
  - Clic logo → `/`
  - "Trouver un prestataire" → `/client/search` (pas encore créé)
  - "Mes demandes" → `/client/requests` (pas encore créé)
  - "Messages" → `/client/messages` (pas encore créé)
  - "Mon profil" → `/client/profile` (pas encore créé)
  - "Créer une demande" → `/client/requests/new` (pas encore créé)
  - "Déconnexion" → logout() + redirige vers `/`

---

#### **`/artisan/dashboard`**

- **URL** : `http://localhost:3000/artisan/dashboard`
- **Accès** : Authentifié (redirige vers `/auth/login` si non connecté)
- **Rôle** : Tableau de bord principal de l'artisan
- **Contenu** :
  - **Header** : Logo, navigation (Dashboard, Demandes, Prestations, Messages), profil, déconnexion
  - **Banner vert** : "Bienvenue [nom] ! 🛠️", bouton CTA "Voir les demandes disponibles"
  - **4 cartes statistiques** :
    - Nouvelles demandes (icône 🔔 bleue) + badge compteur
    - Prestations en cours (icône ⏰ ambre)
    - Terminées ce mois (icône ✅ verte)
    - Revenus ce mois (icône 💰 emerald)
  - **2 cartes actions rapides** :
    - Demandes disponibles 📋 (emerald)
    - Mes prestations 🛠️ (bleu)
  - **État vide** : Aucune prestation en cours
- **Actions** :
  - Clic logo → `/`
  - "Demandes disponibles" → `/artisan/requests` (pas encore créé)
  - "Mes prestations" → `/artisan/services` (pas encore créé)
  - "Messages" → `/artisan/messages` (pas encore créé)
  - "Mon profil" → `/artisan/profile` (pas encore créé)
  - "Voir les demandes" → `/artisan/requests` (pas encore créé)
  - "Déconnexion" → logout() + redirige vers `/`

---

### 🎨 Pages de démonstration (2 pages)

#### **`/demo/dashClient`**

- **URL** : `http://localhost:3000/demo/dashClient`
- **Accès** : Public (pas de protection)
- **Rôle** : **Prévisualisation** du dashboard client avec données fictives
- **Différences avec `/client/dashboard`** :
  - Badge jaune "PAGE DE DÉMONSTRATION"
  - **Données fictives réalistes** :
    - Stats : 3 demandes actives, 2 en cours, 8 terminées, 5 messages
    - Utilisateur : "Marie"
    - 3 demandes détaillées :
      1. "Réparation machine à laver" (En cours, Jean Dupont, 85€)
      2. "Retouche costume" (3 propositions, Paris 15ème, 45€)
      3. "Cours de tricot" (Terminé, Sophie Martin, ⭐ 5/5, 30€)
  - Badges de statut colorés (En cours, Propositions, Terminé)
  - Prix affichés
  - Dates relatives ("Il y a 2 jours")
- **Utilité** :
  - Montrer à quoi ressemble le dashboard **avec des données**
  - Tester le design sans créer de compte
  - Présentation du projet

---

#### **`/demo/dashArtisan`**

- **URL** : `http://localhost:3000/demo/dashArtisan`
- **Accès** : Public (pas de protection)
- **Rôle** : **Prévisualisation** du dashboard artisan avec données fictives
- **Différences avec `/artisan/dashboard`** :
  - Badge jaune "PAGE DE DÉMONSTRATION"
  - **Données fictives réalistes** :
    - Stats : 12 nouvelles demandes, 5 en cours, 23 terminées ce mois, 1 847€ revenus
    - Utilisateur : "Jean"
    - **Prestations en cours** :
      1. "Réparation machine à laver" (Marie Dubois, demain 14h, 85€, commission 12,75€)
      2. "Retouche costume" (Thomas Laurent, à déposer, 45€, commission 6,75€)
    - **Nouvelles demandes disponibles** :
      1. "Réparation vélo électrique" (🎯 Correspond à votre profil, 2,3 km, 120€, 0 propositions)
      2. "Cours de couture débutant" (4,7 km, 40€, 2 propositions)
  - Badges de statut (En cours, À récupérer, Nouvelle)
  - Distances affichées
  - Nombre de propositions concurrentes
  - Commission Tasky visible
  - Points relais mentionnés
- **Utilité** :
  - Montrer le parcours artisan complet
  - Tester l'UX avec données réalistes
  - Présentation du projet

---

## ❌ Pages pas encore créées (12+ pages)

### 👤 Client - Après connexion

#### **`/client/profile`**

- **Accès** : Authentifié client
- **Rôle** : Voir et éditer son profil
- **Contenu à créer** :
  - Photo de profil (upload)
  - Prénom, nom, email
  - Adresse (optionnelle)
  - Téléphone
  - Bouton "Enregistrer les modifications"
  - Bouton "Changer mon mot de passe"

---

#### **`/client/search`**

- **Accès** : Authentifié client
- **Rôle** : Rechercher des prestataires
- **Contenu à créer** :
  - Barre de recherche (mots-clés)
  - Filtres : catégorie, localisation, note, prix
  - Carte interactive avec pins
  - Liste de prestataires :
    - Photo, nom, bio, note, localisation, prix moyens
    - Badge "Vérifié"
    - Bouton "Voir le profil"
  - Pagination

---

#### **`/client/requests`**

- **Accès** : Authentifié client
- **Rôle** : Liste de toutes mes demandes
- **Contenu à créer** :
  - Onglets : Toutes / Actives / En cours / Terminées
  - Liste de demandes :
    - Titre, description courte, statut, date, budget
    - Nombre de propositions reçues
    - Action : "Voir détails"
  - Bouton "Créer une nouvelle demande"
  - Filtres : date, statut, catégorie

---

#### **`/client/requests/new`**

- **Accès** : Authentifié client
- **Rôle** : Créer une nouvelle demande
- **Contenu à créer** :
  - Formulaire multi-étapes :
    1. Catégorie (réparation, retouche, cours, etc.)
    2. Titre + description détaillée
    3. Budget estimé
    4. Localisation / Code postal
    5. Date souhaitée
    6. Photos (optionnel, max 5)
  - Bouton "Publier ma demande"

---

#### **`/client/requests/:id`**

- **Accès** : Authentifié client (propriétaire uniquement)
- **Rôle** : Détail d'une demande spécifique
- **Contenu à créer** :
  - Toutes les infos de la demande
  - Liste des propositions reçues :
    - Photo prestataire, nom, note, prix proposé, délai
    - Message du prestataire
    - Bouton "Accepter" / "Refuser"
  - Chat avec les prestataires qui ont proposé
  - Bouton "Modifier la demande"
  - Bouton "Annuler la demande"

---

#### **`/client/messages`**

- **Accès** : Authentifié client
- **Rôle** : Messagerie (liste des conversations)
- **Contenu à créer** :
  - Liste des conversations :
    - Photo prestataire, nom, dernier message, date
    - Badge "Non lu"
  - Barre de recherche
  - Filtre : Tous / Non lus

---

#### **`/client/messages/:id`**

- **Accès** : Authentifié client
- **Rôle** : Conversation avec un prestataire
- **Contenu à créer** :
  - Historique des messages
  - Champ de saisie + bouton envoyer
  - Upload fichiers/photos
  - Infos prestation en sidebar (titre, prix, statut)

---

#### **`/client/settings`**

- **Accès** : Authentifié client
- **Rôle** : Paramètres du compte
- **Contenu à créer** :
  - Onglets :
    - Compte (changer email, mot de passe)
    - Notifications (email, SMS, push)
    - Paiement (cartes bancaires)
    - Confidentialité
    - Supprimer mon compte

---

### 🛠️ Artisan - Après connexion

#### **`/artisan/profile`**

- **Accès** : Authentifié artisan
- **Rôle** : Voir et éditer son profil public
- **Contenu à créer** :
  - Photo de profil
  - Prénom, nom
  - Bio détaillée
  - Compétences / Services proposés
  - Tarifs horaires
  - Zone d'intervention (code postal, rayon)
  - Portfolio (photos de réalisations)
  - Avis clients (lecture seule)
  - Bouton "Enregistrer"

---

#### **`/artisan/requests`**

- **Accès** : Authentifié artisan
- **Rôle** : Voir les demandes disponibles
- **Contenu à créer** :
  - Filtres : catégorie, localisation, budget, date
  - Badge "🎯 Correspond à votre profil"
  - Liste de demandes :
    - Titre, description, client (prénom), localisation, distance
    - Budget, date de publication
    - Nombre de propositions concurrentes
    - Bouton "Envoyer une proposition"
  - Carte interactive

---

#### **`/artisan/requests/:id`**

- **Accès** : Authentifié artisan
- **Rôle** : Détail d'une demande + envoyer proposition
- **Contenu à créer** :
  - Détails complets de la demande
  - Infos client (prénom, note, localisation)
  - Formulaire de proposition :
    - Prix proposé
    - Délai estimé
    - Message au client
    - Bouton "Envoyer ma proposition"
  - Liste des autres propositions (si public)

---

#### **`/artisan/services`**

- **Accès** : Authentifié artisan
- **Rôle** : Liste de mes prestations
- **Contenu à créer** :
  - Onglets : En cours / Terminées / Annulées
  - Liste des prestations :
    - Titre, client, statut, date, prix
    - Point relais (lieu d'échange)
    - Actions : "Contacter client", "Confirmer dépôt", "Marquer terminé"
  - Filtres : date, statut

---

#### **`/artisan/services/:id`**

- **Accès** : Authentifié artisan
- **Rôle** : Détail d'une prestation
- **Contenu à créer** :
  - Toutes les infos de la prestation
  - Infos client
  - Point relais (adresse, horaires)
  - Chat avec le client
  - Timeline (demande → acceptée → en cours → déposée → récupérée → payée)
  - Boutons d'action selon le statut

---

#### **`/artisan/messages`**

- **Accès** : Authentifié artisan
- **Rôle** : Messagerie (liste des conversations)
- **Contenu** : Identique à `/client/messages`

---

#### **`/artisan/messages/:id`**

- **Accès** : Authentifié artisan
- **Rôle** : Conversation avec un client
- **Contenu** : Identique à `/client/messages/:id`

---

#### **`/artisan/earnings`**

- **Accès** : Authentifié artisan
- **Rôle** : Revenus et historique des paiements
- **Contenu à créer** :
  - Stats du mois : revenus bruts, commission Tasky, net
  - Graphique évolution (6 derniers mois)
  - Historique des transactions :
    - Date, client, prestation, montant, commission, net
    - Statut : En attente / Payé
  - Filtres : période, statut
  - Bouton "Télécharger relevé PDF"

---

#### **`/artisan/settings`**

- **Accès** : Authentifié artisan
- **Rôle** : Paramètres du compte
- **Contenu à créer** :
  - Onglets :
    - Compte (changer email, mot de passe)
    - Notifications
    - Paiement (IBAN pour recevoir paiements)
    - Disponibilités (calendrier)
    - Confidentialité
    - Supprimer mon compte

---

### 📄 Pages légales (3 pages)

#### **`/legal/cgu`**

- **Accès** : Public
- **Rôle** : Conditions Générales d'Utilisation
- **Contenu à créer** :
  - Texte complet des CGU
  - Sections : Objet, Acceptation, Services, Responsabilités, etc.

---

#### **`/legal/privacy`**

- **Accès** : Public
- **Rôle** : Politique de confidentialité (RGPD)
- **Contenu à créer** :
  - Données collectées
  - Usage des données
  - Droits des utilisateurs
  - Cookies

---

#### **`/contact`**

- **Accès** : Public
- **Rôle** : Formulaire de contact
- **Contenu à créer** :
  - Formulaire : nom, email, sujet, message
  - Informations : email support, réseaux sociaux

---

## 📊 Statistiques du projet

| Catégorie      | Créées | À créer | Total  |
| -------------- | ------ | ------- | ------ |
| **Accueil**    | 1      | 0       | 1      |
| **Auth**       | 7      | 0       | 7      |
| **Dashboards** | 2      | 0       | 2      |
| **Démos**      | 2      | 0       | 2      |
| **Client**     | 0      | 7       | 7      |
| **Artisan**    | 0      | 7       | 7      |
| **Légal**      | 0      | 3       | 3      |
| **TOTAL**      | **12** | **17**  | **29** |

**Progression** : 41% des pages créées ✅

---

## 🎨 Composants réutilisables créés

### Layouts

- `AuthLayout` - Structure pour toutes les pages d'auth (logo, fond, carte)

### Forms

- `Button` - Bouton avec variants (primary, outline, ghost), tailles, loading
- `Input` - Input avec label, icône, erreur, helper text
- `Checkbox` - Checkbox avec label et gestion d'erreurs
- `FileUpload` - Upload de fichiers avec drag & drop et preview

### Other

- `ProgressSteps` - Indicateur d'étapes (cercles verts validés)
- `PasswordStrengthIndicator` - Indicateur de force du mot de passe (règles + barres)
- `Header` - Header avec logo et navigation (à créer pour toutes les pages)
- `Footer` - Footer professionnel (déjà sur la homepage)

---

## 🔧 Configuration technique

### Validation (Zod)

- `registerClientSchema`
- `registerArtisanStep1Schema`
- `artisanProfileSchema`
- `identityVerificationSchema`
- `artisanTermsSchema`
- `loginSchema`
- `forgotPasswordSchema`
- `resetPasswordSchema` (dans le composant reset-password)

### Store (Zustand)

- `auth-store.ts` - Gestion de l'authentification
  - `user`, `token`, `isAuthenticated`
  - `setAuth()`, `updateUser()`, `logout()`

### API Client (Axios)

- `api-client.ts` - Instance configurée
- `apiClientUpload` - Pour multipart/form-data

### Hooks personnalisés

- `useEmailValidation` - Vérification unicité email (debounced 500ms)

---

## 🚀 Prochaines étapes recommandées

### Priorité 1 (Essentiel)

1. **Profil Client** (`/client/profile`)
2. **Profil Artisan** (`/artisan/profile`)
3. **Changer mot de passe** (dans settings)

### Priorité 2 (Important)

4. **Rechercher prestataires** (`/client/search`)
5. **Créer une demande** (`/client/requests/new`)
6. **Voir demandes disponibles** (`/artisan/requests`)
7. **Messagerie** (`/client/messages` + `/artisan/messages`)

### Priorité 3 (Nice to have)

8. **Détails demande** (`/client/requests/:id`)
9. **Mes prestations** (`/artisan/services`)
10. **Revenus** (`/artisan/earnings`)
11. **Paramètres** (`/client/settings` + `/artisan/settings`)

---

## 💡 Notes importantes

### Mode démo actuel

- Toutes les pages d'authentification fonctionnent en **mode simulation**
- Pas de vrai backend → Les données ne persistent pas
- `setAuth()` sauvegarde dans localStorage
- Quand le backend sera prêt, il faudra remplacer les simulations par de vrais appels API

### Design system

- **Couleurs principales** :
  - Client : Pink/Rose (`from-pink-500 to-rose-600`)
  - Artisan : Emerald/Vert (`from-emerald-500 to-teal-600`)
  - Neutre : Emerald/Teal/Indigo
- **Logo** : `/public/logo-tasky.png`
- **Animations** : `animate-float`, `animate-bounce`, `animate-spin`

### Fichiers clés

```
src/
├── app/
│   ├── page.tsx (homepage)
│   ├── auth/ (7 pages)
│   ├── client/ (2 pages)
│   ├── artisan/ (2 pages)
│   └── demo/ (2 pages)
├── components/ (8 composants)
├── lib/
│   ├── api-client.ts
│   ├── schemas.ts
│   └── utils.ts
├── hooks/
│   └── useEmailValidation.ts
├── stores/
│   └── auth-store.ts
└── providers/
    └── query-provider.tsx
```

---

**Dernière mise à jour** : 11 février 2026
**Statut** : 12/29 pages créées (41%)
