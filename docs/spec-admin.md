# Tasky — Spécification QA · Espace Admin

**Version :** 1.0  
**URL de test :** http://localhost:3000/admin

---

## Compte admin

| Email | Mot de passe |
|---|---|
| tasky-adm@outlook.fr | Admin@Tasky2026! |

> Pour créer le compte : `cd backend && npx ts-node scripts/create-admin.ts`

---

## Accès & Sécurité

| # | Test | Résultat attendu |
|---|---|---|
| 1 | Accéder à `/admin` sans être connecté | Redirection vers `/auth/login` |
| 2 | Se connecter en tant que client puis aller sur `/admin` | Redirection vers `/client/dashboard` |
| 3 | Se connecter en tant que prestataire puis aller sur `/admin` | Redirection vers `/prestataire/dashboard` |
| 4 | Se connecter en tant qu'admin | Redirection automatique vers `/admin/dashboard` |
| 5 | Accéder à `/prestataire/dashboard` en tant qu'admin | Redirection vers `/admin/dashboard` |

---

## EPIC 1 — Dashboard

**URL :** `/admin/dashboard`

### ADM-01 — KPIs

| # | Vérification | Résultat attendu |
|---|---|---|
| 1 | KPI "Utilisateurs actifs" | Nombre total d'utilisateurs avec `isActive: true` |
| 2 | Sous-titre KPI utilisateurs | "X clients · Y prestataires" |
| 3 | KPI "Prestations actives" | Prestations en EN_COURS + EN_ATTENTE_* + A_VALIDER |
| 4 | Sous-titre prestations | "X terminées" |
| 5 | KPI "CA total" | Somme de toutes les prestations avec stripePaymentIntentId |
| 6 | Sous-titre CA | "Commission : X €" (15% du CA) |
| 7 | KPI "Litiges ouverts" | Signalements avec statut EN_ATTENTE |
| 8 | Bordure rouge sur litiges | Apparaît seulement si > 0 signalements |
| 9 | Rafraîchissement auto | Toutes les 30 secondes |

### ADM-02 — Auto-validation manuelle

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Cliquer "⏰ Lancer auto-validation" | Toast avec nombre de prestations validées |
| 2 | Aucune prestation à valider | "0 prestation(s) auto-validée(s)" |
| 3 | Prestations A_VALIDER expirées | Passent en TERMINEE + demandes TERMINEE + message Tasky-Infos |

---

## EPIC 2 — Gestion des utilisateurs

**URL :** `/admin/users`

### ADM-10 — Liste des utilisateurs

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Afficher la liste | Tous les utilisateurs paginés (20 par page) |
| 2 | Rechercher par prénom | Liste filtrée en temps réel au submit |
| 3 | Rechercher par email | Liste filtrée |
| 4 | Colonnes affichées | Utilisateur, Rôle, Statut, Inscription, Activité, Actions |
| 5 | Badge rôle CLIENT | Bleu |
| 6 | Badge rôle PRESTATAIRE | Vert |
| 7 | Badge rôle ADMIN | Rouge |
| 8 | Statut "Actif" | Point vert ● Actif |
| 9 | Statut "Suspendu" | Point rouge ● Suspendu |
| 10 | Statut "Anonymisé" | 🗑️ Anonymisé (compte supprimé par le propriétaire) |

### ADM-11 — Suspendre / Réactiver

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Cliquer "Suspendre" sur un utilisateur actif | Statut passe en "Suspendu", bouton devient "Réactiver" |
| 2 | Cliquer "Réactiver" | Statut repasse en "Actif" |
| 3 | Compte admin | Bouton d'action absent |
| 4 | Compte anonymisé (DEL_...) | Bouton d'action absent |
| 5 | Utilisateur suspendu qui tente de se connecter | Message "Votre compte a été désactivé" |

---

## EPIC 3 — Gestion des prestations

**URL :** `/admin/prestations`

### ADM-20 — Liste des prestations

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Afficher la liste | Toutes les prestations paginées avec statut coloré |
| 2 | Filtrer par statut "En cours" | Seules les prestations EN_COURS |
| 3 | Filtrer "Tous les statuts" | Toutes les prestations |
| 4 | Colonnes | Référence, Prestation, Client, Prestataire, Statut, Montant, Détail |
| 5 | Cliquer "Voir →" | Navigation vers le détail |

### ADM-21 — Détail d'une prestation

**URL :** `/admin/prestations/:id`

| # | Vérification | Résultat attendu |
|---|---|---|
| 1 | Section "Parties" | Nom, email client + prestataire + IBAN prestataire |
| 2 | Section "Finance" | Montant final, commission 15%, net prestataire, Stripe PI |
| 3 | Section "Détail de la demande" | Catégorie, description, délai, dates |
| 4 | Section "Devis proposés" | Tous les devis avec statut (Accepté/Refusé/Envoyé) |
| 5 | Section "État des lieux" | Photos avant/après si présentes |
| 6 | Section "Avis client" | Note étoiles et commentaire |
| 7 | Section "Messages Tasky-Infos" | Messages système dans fond jaune |
| 8 | Section "Conversation" | Messages client/prestataire avec avatar C/P |
| 9 | Badge auto-validation | Affiché en violet si la prestation est en A_VALIDER |

---

## EPIC 4 — Signalements

**URL :** `/admin/signalements`

### ADM-30 — Liste des signalements

| # | Vérification | Résultat attendu |
|---|---|---|
| 1 | Signalement EN_ATTENTE | Badge rouge "En attente" |
| 2 | Signalement RESOLU | Badge vert "Résolu" |
| 3 | Bouton "Résoudre" | Visible uniquement si non résolu |

### ADM-31 — Résoudre un signalement

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Cliquer "Résoudre" | Modale avec textarea pour note |
| 2 | Soumettre sans note | Résolution sans note |
| 3 | Soumettre avec une note | Note ajoutée au message du signalement |
| 4 | Après résolution | Statut → "Résolu", bouton disparaît |
| 5 | Message Tasky-Infos | Message créé dans le chat de la prestation avec la note |
| 6 | KPI dashboard | Compteur "Litiges ouverts" décrémenté |

---

## EPIC 5 — Suivi des paiements

**URL :** `/admin/paiements`

### ADM-40 — Vue paiements

| # | Vérification | Résultat attendu |
|---|---|---|
| 1 | Résumé financier en haut | Volume brut, Commission 15%, Net prestataires |
| 2 | Colonnes | Référence, Client, Prestataire, IBAN, Montant, Commission, Net, Statut, Stripe PI |
| 3 | IBAN non renseigné | Badge rouge "Non renseigné" |
| 4 | IBAN présent | Affiché tronqué avec bouton copie ⎘ |
| 5 | Cliquer ⎘ sur IBAN | Copié dans le presse-papier, ✓ affiché |
| 6 | Stripe PI | Affiché tronqué avec bouton copie |
| 7 | Seules prestations payées | Uniquement les prestations avec stripePaymentIntentId |

---

## Règles de gestion admin

| Règle | Détail |
|---|---|
| Virements prestataires | Manuels via Stripe Dashboard ou virement bancaire IBAN |
| Données anonymisées | Non récupérables (RGPD) — ne pas tenter de réactiver |
| Auto-validation | Cron toutes les heures + bouton manuel sur dashboard |
| Commission | 15% calculée côté frontend dans l'affichage, non prélevée automatiquement |
