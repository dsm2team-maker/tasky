# Tasky — Spécification QA · Espace Client

**Version :** 1.0  
**URL de test :** http://localhost:3000/client

---

## Comptes de test suggérés

| Email | Mot de passe | Notes |
|---|---|---|
| client1@mail.com | Test1234! | Compte actif vérifié |
| client2@mail.com | Test1234! | Compte avec demandes en cours |

> Créer les comptes via `/auth/register` si inexistants.

---

## EPIC 1 — Inscription & Connexion

### CAS-01 — Inscription client
**URL :** `/auth/register`  
**Pré-requis :** Email non existant

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Remplir le formulaire avec un email valide, mot de passe ≥ 8 caractères | Bouton "Créer mon compte" actif |
| 2 | Soumettre le formulaire | Redirection vers page de confirmation + email de vérification envoyé |
| 3 | Cliquer sur le lien dans l'email | Compte vérifié, redirection vers login |
| 4 | Réessayer avec le même email | Message "Un compte existe déjà avec cet email" |
| 5 | Soumettre avec mot de passe < 8 caractères | Erreur de validation sous le champ |

### CAS-02 — Connexion
**URL :** `/auth/login`

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Se connecter avec email/mot de passe valides | Redirection vers `/client/dashboard` |
| 2 | Se connecter avec mauvais mot de passe | Message "Mot de passe incorrect" |
| 3 | Se connecter sans vérifier l'email | Message "Veuillez vérifier votre email" |
| 4 | Se connecter en tant qu'admin | Redirection vers `/admin/dashboard` |

---

## EPIC 2 — Gestion des demandes

### CAS-10 — Créer une demande
**URL :** `/client/requests/new`

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Remplir tous les champs obligatoires (titre, description, type, catégorie, délai) | Bouton "Publier" actif |
| 2 | Titre < 5 caractères | Erreur "Titre trop court" |
| 3 | Description < 20 caractères | Erreur "Description trop courte" |
| 4 | Budget négatif ou 0 | Erreur "Budget supérieur à 0 €" |
| 5 | Délai > 365 jours | Erreur "Délai entre 1 et 365 jours" |
| 6 | Soumettre > 2 photos | Erreur "Maximum 2 photos" |
| 7 | Publier une demande valide | Redirection vers liste des demandes, statut "Publiée" |

### CAS-11 — Consulter ses demandes
**URL :** `/client/requests`

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Accéder à la liste | Toutes les demandes non supprimées sont affichées |
| 2 | Filtrer par statut | Seules les demandes du statut sélectionné s'affichent |
| 3 | Cliquer "Voir le détail" | Navigation vers le détail de la demande |

### CAS-12 — Supprimer une demande
| # | Action | Résultat attendu |
|---|---|---|
| 1 | Cliquer l'icône 🗑️ sur une demande "Publiée" | Bouton de confirmation apparaît |
| 2 | Confirmer la suppression | Demande disparaît de la liste |
| 3 | Tenter de supprimer une demande "En cours" | Bouton 🗑️ absent |

---

## EPIC 3 — Gestion des devis

### CAS-20 — Recevoir et consulter un devis
**URL :** `/client/requests/:id`

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Un prestataire envoie un devis | Badge "X devis reçus" apparaît sur la carte |
| 2 | Ouvrir le détail de la demande | Section devis affichée avec montant, délai, description |
| 3 | Plusieurs devis reçus | Tous les devis listés avec leurs détails |

### CAS-21 — Accepter un devis
| # | Action | Résultat attendu |
|---|---|---|
| 1 | Cliquer "Accepter" sur un devis (type MODIFICATION) | Modale de confirmation → statut passe en "En attente inspection" |
| 2 | Cliquer "Accepter" sur un devis (type CREATION) | Statut passe en "En attente paiement" |
| 3 | Accepter un devis alors qu'un autre est déjà accepté | Non possible (boutons désactivés) |

### CAS-22 — Refuser un devis
| # | Action | Résultat attendu |
|---|---|---|
| 1 | Cliquer "Refuser" sur un devis | Devis marqué comme refusé, prestataire notifié par email |
| 2 | Refuser tous les devis | Demande reste en "Publiée" |

---

## EPIC 4 — État des lieux (MODIFICATION uniquement)

### CAS-30 — Valider l'état des lieux
**Pré-requis :** Devis accepté, prestataire a soumis un état des lieux

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Voir l'état des lieux soumis par le prestataire | Section "État des lieux" visible avec photos et description |
| 2 | Si montant révisé proposé | Badge orange "Nouveau montant proposé : X €" visible |
| 3 | Cliquer "Accepter l'état des lieux" | Statut passe en "En attente paiement" |
| 4 | Cliquer "Refuser l'état des lieux" | Prestation annulée, demande republiée, redirection liste |

---

## EPIC 5 — Paiement

### CAS-40 — Effectuer un paiement
**URL :** `/client/requests/:id` (statut EN_ATTENTE_PAIEMENT)

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Section paiement Stripe visible | Formulaire carte, champs pré-remplis (nom, email) |
| 2 | Saisir carte de test `4242 4242 4242 4242`, exp 12/29, CVC 123 | Paiement accepté |
| 3 | Paiement réussi | Statut passe en "En cours", email de confirmation envoyé |
| 4 | Saisir carte refusée `4000 0000 0000 0002` | Message d'erreur Stripe |
| 5 | Tenter de payer une prestation déjà en cours | Section paiement absente |
| 6 | Tenter de payer deux fois la même prestation | Message "Déjà en cours" (protection anti-double paiement) |

---

## EPIC 6 — Suivi et validation

### CAS-50 — Valider une prestation
**URL :** `/client/requests/:id` (statut A_VALIDER)

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Section "Valider la prestation" visible | Bouton "Valider" et bouton "Contester" présents |
| 2 | Cliquer "Valider" | Modale de confirmation → statut "Terminée", email envoyé |
| 3 | Badge auto-validation visible | Date limite affichée en violet |

### CAS-51 — Contester une prestation
| # | Action | Résultat attendu |
|---|---|---|
| 1 | Cliquer "Contester" | Textarea pour saisir le motif |
| 2 | Motif < 10 caractères | Erreur "Minimum 10 caractères" |
| 3 | Soumettre avec motif valide | Prestation repasse en "En cours", message Tasky-Infos créé |
| 4 | Badge "Commande contestée" visible | Bandeau rouge sur la page de détail |

### CAS-52 — Auto-validation J+3
| # | Action | Résultat attendu |
|---|---|---|
| 1 | Attendre 3 jours sans valider ni contester | Prestation passe automatiquement en "Terminée" |
| 2 | (Admin) Lancer le job manuellement | Bouton "⏰ Lancer auto-validation" dans dashboard admin |

---

## EPIC 7 — Messagerie

### CAS-60 — Envoyer un message
**URL :** `/client/requests/:id` (onglet Messages)

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Taper un message et envoyer | Message apparaît en temps réel |
| 2 | Recevoir un message du prestataire | Badge rouge sur la liste des demandes |
| 3 | Ouvrir le chat | Messages marqués comme lus, badge disparaît |
| 4 | Essayer d'envoyer un numéro de téléphone | Message bloqué, erreur "Coordonnées non autorisées" |
| 5 | Onglet "Tasky-Infos" | Messages système visibles (paiement, contestation, etc.) |

---

## EPIC 8 — Signalement

### CAS-70 — Créer un signalement
**URL :** `/client/requests/:id` (prestation EN_COURS)

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Bouton "⚠️ Signaler un problème à Tasky" visible | Visible uniquement si prestation active |
| 2 | Cliquer le bouton | Modale avec textarea |
| 3 | Message < 10 caractères | Erreur de validation |
| 4 | Soumettre un signalement valide | Confirmation affichée, bouton remplacé par bandeau orange |
| 5 | Tenter de signaler une 2ème fois | Bouton absent (signalement déjà en cours) |

---

## EPIC 9 — Avis

### CAS-80 — Laisser un avis
**URL :** `/client/requests/:id` (statut TERMINEE)

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Section "Laisser un avis" visible | Étoiles cliquables + textarea commentaire |
| 2 | Soumettre sans étoile | Erreur "Note requise" |
| 3 | Soumettre avec 5 étoiles | Avis enregistré, note du prestataire mise à jour |
| 4 | Section absente après soumission | L'avis ne peut être laissé qu'une fois |

---

## EPIC 10 — Profil

### CAS-90 — Modifier le profil
**URL :** `/client/profile`

| # | Action | Résultat attendu |
|---|---|---|
| 1 | Modifier prénom/nom/ville | Toast "Profil mis à jour !" |
| 2 | Upload photo (JPG/PNG max 5 Mo) | Avatar mis à jour |
| 3 | Changer le téléphone | OTP envoyé par email, saisie du code |
| 4 | Changer l'email | OTP envoyé, nouvelle email vérifiée |
| 5 | Supprimer le compte | OTP envoyé, données anonymisées (email → DEL_...) |
