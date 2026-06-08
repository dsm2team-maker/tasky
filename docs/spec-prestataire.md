# Tasky — Spécification QA · Espace Prestataire

**Version :** 1.0  
**URL de test :** http://localhost:3000/prestataire

---

## Comptes de test suggérés

| Email | Mot de passe | Notes |
|---|---|---|
| artisan1@mail.com | Test1234! | Profil complet, actif |
| artisan2@mail.com | Test1234! | Profil incomplet (sans IBAN) |

---

## EPIC 1 — Inscription & Activation du profil

### PRE-01 — Inscription prestataire
**URL :** `/auth/register` (onglet Prestataire)

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Remplir le formulaire avec toutes les infos + accepter les CGU | Compte créé, email de vérification envoyé |
| 2 | Soumettre sans accepter les CGU | Erreur "Vous devez accepter les CGU" |
| 3 | Téléphone < 10 chiffres | Erreur "Téléphone invalide" |
| 4 | Email déjà utilisé | Erreur "Un compte existe déjà" |

### PRE-02 — Activation du profil (5 étapes)
**URL :** `/prestataire/profile`

La barre de progression affiche `X/5` tant que le profil est incomplet.

| Étape | Action | Résultat attendu |
|---|---|---|
| 1. Email | Vérifier l'email via le lien reçu | Case cochée ✅ |
| 2. Bio | Saisir une bio ≥ 100 caractères | Case cochée ✅ |
| 3. Compétences | Ajouter au moins 1 compétence | Case cochée ✅ |
| 4. Point de dépôt | Renseigner adresse + code postal + ville | Case cochée ✅ |
| 5. IBAN | Saisir un IBAN français valide | Case cochée ✅ |
| Toutes complètes | Profil complet | Barre de progression disparaît, demandes disponibles |

---

## EPIC 2 — Tableau de bord

### PRE-10 — Statistiques d'activité
**URL :** `/prestataire/dashboard`

| # | Vérification | Résultat attendu |
|---|---|---|
| 1 | KPI "Terminées" | Nombre de prestations terminées |
| 2 | KPI "En cours" | Nombre de prestations actives |
| 3 | KPI "En attente" | Devis en attente de réponse |
| 4 | KPI "À valider" | Prestations attendant validation client |
| 5 | Revenus nets | Montant total - 15% commission |
| 6 | Devis refusés | Alerte avec bouton "Ignorer" |

---

## EPIC 3 — Demandes disponibles

### PRE-20 — Voir les demandes disponibles
**URL :** `/prestataire/requests`

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Accéder à la page | Liste des demandes compatibles avec le score de matching |
| 2 | Badge "Match parfait" (vert) | Score ≥ 70/100 |
| 3 | Badge "Bon match" (bleu) | Score entre 40 et 69 |
| 4 | Badge "Match partiel" (orange) | Score < 40 |
| 5 | Cliquer "Voir le détail du score" | Breakdown catégorie/sous-cat/interventions/ville/note |
| 6 | Filtrer par label | Seules les demandes du label sélectionné s'affichent |
| 7 | Prestataire inactif | Page vide avec message d'invitation à compléter le profil |

### PRE-21 — Envoyer un devis
**URL :** `/prestataire/requests/:id`

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Remplir montant, délai, description | Bouton "Envoyer le devis" actif |
| 2 | Montant ≤ 0 | Erreur "Montant invalide" |
| 3 | Description < 20 caractères | Erreur "Description trop courte" |
| 4 | Envoyer un devis valide | Toast de confirmation, client notifié par email |
| 5 | Essayer d'envoyer un 2ème devis | Message "Vous avez déjà envoyé un devis" |

---

## EPIC 4 — Gestion des prestations

### PRE-30 — Voir ses prestations
**URL :** `/prestataire/requests` (onglet "Mes prestations")

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Liste des prestations | Toutes les prestations avec leur statut |
| 2 | Filtrer par statut | Seules les prestations du statut sélectionné |
| 3 | Cliquer "Voir le détail" | Navigation vers le détail de la prestation |

### PRE-31 — Créer un état des lieux (MODIFICATION)
**URL :** `/prestataire/requests/:id` (statut EN_ATTENTE_INSPECTION)

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Section "État des lieux" visible | Formulaire avec description, photos, montant révisé |
| 2 | Description < 10 caractères | Erreur "Description trop courte" |
| 3 | Ajouter photos (avant) | Photos uploadées et affichées |
| 4 | Proposer un montant révisé | Badge orange chez le client |
| 5 | Soumettre l'état des lieux | Client notifié pour valider/refuser |

### PRE-32 — Confirmer la conformité
**Pré-requis :** Client a accepté l'état des lieux

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Bouton "Confirmer la conformité" visible | Visible uniquement statut EN_ATTENTE_PAIEMENT |
| 2 | Cliquer "Confirmer" | Prestation attend le paiement du client |

### PRE-33 — Marquer la prestation terminée
**URL :** `/prestataire/requests/:id` (statut EN_COURS)

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Bouton "Marquer comme terminé" visible | Visible uniquement si EN_COURS |
| 2 | Cliquer le bouton | Statut passe en "À valider", compteur J+3 démarre |
| 3 | Message Tasky-Infos dans le chat | "La prestation a été marquée terminée..." |
| 4 | Badge auto-validation visible chez le client | "Auto-validation le JJ/MM/AAAA" |

---

## EPIC 5 — Messagerie

### PRE-40 — Chat avec le client
**URL :** `/prestataire/requests/:id` (onglet Messages)

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Envoyer un message | Message affiché en temps réel |
| 2 | Recevoir un message | Badge rouge sur la liste des prestations |
| 3 | Ouvrir la conversation | Badge disparaît |
| 4 | Tenter d'envoyer un email/téléphone | Bloqué par le filtre anti-contact |
| 5 | Onglet "Tasky-Infos" | Messages système visibles |

---

## EPIC 6 — Profil prestataire

### PRE-50 — Gérer les compétences
**URL :** `/prestataire/profile`

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Ouvrir le modal compétences | Arborescence catégorie → sous-catégorie → intervention |
| 2 | Sélectionner ≤ 3 catégories | Sélection autorisée |
| 3 | Sélectionner > 3 catégories | Sélection bloquée |
| 4 | Sauvegarder | Toast "Compétences mises à jour !" |

### PRE-51 — Disponibilité
| # | Action | Résultat attendu |
|---|---|---|
| 1 | Changer disponibilité en "Occupé" | Badge jaune "Occupé" affiché |
| 2 | Changer en "Absent" | Badge rouge "Absent" affiché |
| 3 | Revenir en "Actif" | Badge vert "Disponible" affiché |

### PRE-52 — IBAN
| # | Action | Résultat attendu |
|---|---|---|
| 1 | Saisir un IBAN invalide | Erreur de validation |
| 2 | Saisir un IBAN FR valide | Formaté automatiquement |
| 3 | Sauvegarder | Toast "IBAN enregistré !" |

---

## Règles de gestion spécifiques prestataire

| Règle | Détail |
|---|---|
| Commission | 15% prélevée sur chaque paiement |
| Virement | Manuel par l'admin Tasky (1-2 jours ouvrés) |
| Devis actifs | Max 1 devis par demande |
| Profil inactif | Aucune demande visible tant que les 5 étapes ne sont pas complètes |
| Devis expiré | Expire automatiquement après 7 jours si non accepté |
