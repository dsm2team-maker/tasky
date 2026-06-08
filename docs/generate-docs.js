const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, ShadingType, Header, Footer, PageNumber,
  NumberFormat,
} = require("docx");
const fs = require("fs");
const path = require("path");

// ─── Utilitaires ──────────────────────────────────────────────────────────────

const COLORS = {
  primary:   "C2185B",
  secondary: "6C3483",
  header:    "1A1A2E",
  tableHead: "2C3E50",
  tableRow1: "FDFEFE",
  tableRow2: "F2F3F4",
  border:    "BDC3C7",
  muted:     "7F8C8D",
  white:     "FFFFFF",
  light:     "ECF0F1",
};

const h1 = (text) => new Paragraph({
  text,
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 200 },
  run: { color: COLORS.header, bold: true, size: 32 },
});

const h2 = (text) => new Paragraph({
  text,
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 300, after: 150 },
  run: { color: COLORS.primary, bold: true, size: 26 },
});

const h3 = (text) => new Paragraph({
  text,
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 200, after: 100 },
  run: { color: COLORS.secondary, bold: true, size: 22 },
});

const body = (text, options = {}) => new Paragraph({
  children: [new TextRun({ text, size: 20, ...options })],
  spacing: { after: 100 },
});

const bullet = (text) => new Paragraph({
  children: [new TextRun({ text: `• ${text}`, size: 20 })],
  spacing: { after: 80 },
  indent: { left: 360 },
});

const separator = () => new Paragraph({
  text: "",
  border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border } },
  spacing: { before: 200, after: 200 },
});

const badge = (text, color = COLORS.primary) => new Paragraph({
  children: [
    new TextRun({
      text: `  ${text}  `,
      bold: true,
      size: 18,
      color: COLORS.white,
      shading: { type: ShadingType.SOLID, fill: color, color: COLORS.white },
    }),
  ],
  spacing: { after: 80 },
  indent: { left: 360 },
});

const tableHeader = (headers) => new TableRow({
  tableHeader: true,
  children: headers.map((h) =>
    new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, color: COLORS.white, size: 18 })],
        alignment: AlignmentType.CENTER,
      })],
      shading: { type: ShadingType.SOLID, fill: COLORS.tableHead },
    })
  ),
});

const tableRow = (cells, even = true) => new TableRow({
  children: cells.map((c) =>
    new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: c, size: 18 })],
      })],
      shading: { type: ShadingType.SOLID, fill: even ? COLORS.tableRow1 : COLORS.tableRow2 },
    })
  ),
});

const makeTable = (headers, rows) => new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: {
    top:    { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    left:   { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    right:  { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    insideH: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
    insideV: { style: BorderStyle.SINGLE, size: 1, color: COLORS.border },
  },
  rows: [
    tableHeader(headers),
    ...rows.map((r, i) => tableRow(r, i % 2 === 0)),
  ],
});

const coverPage = (title, subtitle, version = "1.0", date = "Juin 2026") => [
  new Paragraph({ text: "", spacing: { before: 1200 } }),
  new Paragraph({
    children: [new TextRun({ text: "🔒 TASKY", bold: true, size: 48, color: COLORS.primary })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: title, bold: true, size: 52, color: COLORS.header })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: subtitle, size: 28, color: COLORS.muted })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 },
  }),
  new Paragraph({
    children: [
      new TextRun({ text: `Version ${version}   `, size: 20, color: COLORS.muted }),
      new TextRun({ text: `•   ${date}   `, size: 20, color: COLORS.muted }),
      new TextRun({ text: "•   Confidentiel", size: 20, color: COLORS.muted }),
    ],
    alignment: AlignmentType.CENTER,
  }),
  new Paragraph({ text: "", pageBreakBefore: true }),
];

// ─── DOC 1 — Spécification Générale ──────────────────────────────────────────

function buildSpecGeneral() {
  return new Document({
    sections: [{
      children: [
        ...coverPage("Spécification Générale", "Fonctionnement de la plateforme Tasky"),

        h1("1. Présentation de la plateforme"),
        body("Tasky est une marketplace B2C spécialisée dans les services artisanaux et de création textile. Elle met en relation des clients qui ont un besoin de prestation avec des prestataires qualifiés."),
        separator(),

        h1("2. Acteurs"),
        makeTable(
          ["Rôle", "Description"],
          [
            ["CLIENT", "Publie des demandes, reçoit des devis, paie et valide les prestations"],
            ["PRESTATAIRE", "Répond aux demandes, réalise les prestations, perçoit le paiement"],
            ["ADMIN", "Supervise la plateforme, gère les litiges, suit les paiements"],
          ]
        ),
        separator(),

        h1("3. Types de prestations"),
        makeTable(
          ["Type", "Description"],
          [
            ["MODIFICATION", "Retouche d'un article existant. Nécessite un état des lieux (remise physique)"],
            ["CREATION", "Création d'un article de A à Z. Paiement direct sans état des lieux"],
            ["FORMATION", "Apprentissage d'une technique. Paiement direct"],
          ]
        ),
        separator(),

        h1("4. Cycle de vie d'une demande"),
        makeTable(
          ["Statut", "Déclencheur"],
          [
            ["PUBLIEE", "Demande créée par le client"],
            ["EN_ATTENTE_INSPECTION", "Devis accepté (type MODIFICATION uniquement)"],
            ["EN_ATTENTE_PAIEMENT", "Devis accepté (CREATION/FORMATION) ou état des lieux accepté"],
            ["EN_COURS", "Paiement Stripe confirmé"],
            ["A_VALIDER", "Prestataire marque la prestation terminée"],
            ["TERMINEE", "Client valide OU auto-validation J+3"],
            ["ANNULEE", "Annulation manuelle ou état des lieux refusé"],
          ]
        ),
        separator(),

        h1("5. Règles de gestion critiques"),

        h2("5.1 Commission Tasky"),
        bullet("15% prélevée sur le montant du devis, à la charge du prestataire"),
        bullet("Le client paie exactement le montant affiché dans le devis"),
        bullet("Exemple : devis 100 € → client paie 100 € → prestataire reçoit 85 €"),

        h2("5.2 Auto-validation J+3"),
        bullet("Quand une prestation passe en A_VALIDER, autoValidateAt = now + 3 jours"),
        bullet("Un cron job tourne toutes les heures et valide automatiquement"),
        bullet("Un message Tasky-Infos notifie les deux parties"),

        h2("5.3 Paiement Stripe"),
        bullet("Formulaire carte intégré (pas de redirection)"),
        bullet("Carte de test : 4242 4242 4242 4242, exp 12/29, CVC 123"),
        bullet("Carte refusée : 4000 0000 0000 0002"),

        h2("5.4 Matching prestataire"),
        makeTable(
          ["Critère", "Points"],
          [
            ["Catégorie", "40 pts"],
            ["Sous-catégorie", "25 pts"],
            ["Interventions", "20 pts"],
            ["Localisation (ville)", "10 pts"],
            ["Note prestataire", "5 pts"],
          ]
        ),
        body("Labels : PARFAIT (≥ 70 pts) · BON (≥ 40 pts) · PARTIEL (< 40 pts)"),

        h2("5.5 Activation compte prestataire — 5 étapes"),
        makeTable(
          ["Étape", "Condition"],
          [
            ["1. Email vérifié", "Lien de vérification cliqué"],
            ["2. Bio complétée", "Minimum 100 caractères"],
            ["3. Compétences ajoutées", "Au moins 1 compétence"],
            ["4. Point de dépôt défini", "Adresse + code postal + ville"],
            ["5. IBAN renseigné", "IBAN français valide"],
          ]
        ),
        separator(),

        h1("6. Emails transactionnels"),
        makeTable(
          ["Événement", "Destinataire"],
          [
            ["Inscription", "Client ou Prestataire (lien de vérification)"],
            ["Mot de passe oublié", "Utilisateur"],
            ["Nouveau devis reçu", "Client"],
            ["Devis non retenu", "Prestataire"],
            ["Paiement confirmé", "Client + Prestataire"],
            ["Prestation terminée", "Client + Prestataire"],
            ["Changement téléphone (OTP)", "Utilisateur"],
            ["Alerte changement email", "Ancienne adresse"],
            ["Suppression de compte (OTP)", "Utilisateur"],
          ]
        ),
        separator(),

        h1("7. Architecture technique"),
        makeTable(
          ["Couche", "Technologie"],
          [
            ["Frontend", "Next.js 14, TypeScript, TailwindCSS, React Query"],
            ["Backend", "Node.js, Express, TypeScript, Prisma 5"],
            ["Base de données", "PostgreSQL (Supabase)"],
            ["Paiement", "Stripe Elements"],
            ["Emails", "Resend + BullMQ (Redis)"],
            ["Stockage avatars", "Supabase Storage"],
          ]
        ),
      ],
    }],
  });
}

// ─── DOC 2 — Spec Client ─────────────────────────────────────────────────────

function buildSpecClient() {
  return new Document({
    sections: [{
      children: [
        ...coverPage("Spec QA — Espace Client", "Cas de test · Espace Client"),

        h1("Comptes de test"),
        makeTable(
          ["Email", "Mot de passe", "Notes"],
          [
            ["client1@mail.com", "Test1234!", "Compte actif vérifié"],
            ["client2@mail.com", "Test1234!", "Compte avec demandes en cours"],
          ]
        ),
        separator(),

        h1("EPIC 1 — Inscription & Connexion"),
        h2("CAS-01 — Inscription client"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Remplir le formulaire avec email valide, mot de passe ≥ 8 chars", "Bouton actif"],
            ["2", "Soumettre le formulaire", "Email de vérification envoyé"],
            ["3", "Cliquer sur le lien dans l'email", "Compte vérifié, redirection login"],
            ["4", "Réessayer avec le même email", "Erreur 'Un compte existe déjà'"],
            ["5", "Mot de passe < 8 caractères", "Erreur de validation"],
          ]
        ),
        h2("CAS-02 — Connexion"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Login avec email/mdp valides", "Redirection vers /client/dashboard"],
            ["2", "Mauvais mot de passe", "Message 'Mot de passe incorrect'"],
            ["3", "Email non vérifié", "Message 'Veuillez vérifier votre email'"],
            ["4", "Connexion en tant qu'admin", "Redirection vers /admin/dashboard"],
          ]
        ),
        separator(),

        h1("EPIC 2 — Gestion des demandes"),
        h2("CAS-10 — Créer une demande"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Remplir tous les champs obligatoires", "Bouton Publier actif"],
            ["2", "Titre < 5 caractères", "Erreur 'Titre trop court'"],
            ["3", "Description < 20 caractères", "Erreur 'Description trop courte'"],
            ["4", "Budget ≤ 0", "Erreur 'Budget supérieur à 0 €'"],
            ["5", "Délai > 365 jours", "Erreur 'Délai entre 1 et 365 jours'"],
            ["6", "Ajouter > 2 photos", "Erreur 'Maximum 2 photos'"],
            ["7", "Publier une demande valide", "Statut 'Publiée', visible dans la liste"],
          ]
        ),
        separator(),

        h1("EPIC 3 — Gestion des devis"),
        h2("CAS-21 — Accepter un devis"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Accepter un devis (type MODIFICATION)", "Statut → EN_ATTENTE_INSPECTION"],
            ["2", "Accepter un devis (type CREATION)", "Statut → EN_ATTENTE_PAIEMENT"],
            ["3", "Accepter si un autre devis déjà accepté", "Non possible (boutons désactivés)"],
          ]
        ),
        separator(),

        h1("EPIC 4 — État des lieux (MODIFICATION)"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Voir l'état des lieux soumis", "Section visible avec photos + description"],
            ["2", "Montant révisé proposé", "Badge orange 'Nouveau montant : X €'"],
            ["3", "Cliquer 'Accepter l'état des lieux'", "Statut → EN_ATTENTE_PAIEMENT"],
            ["4", "Cliquer 'Refuser l'état des lieux'", "Prestation annulée, demande republiée"],
          ]
        ),
        separator(),

        h1("EPIC 5 — Paiement"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Formulaire Stripe visible", "Champs pré-remplis (nom, email)"],
            ["2", "Carte test 4242 4242 4242 4242", "Paiement accepté, statut EN_COURS"],
            ["3", "Carte refusée 4000 0000 0000 0002", "Message d'erreur Stripe"],
            ["4", "Payer une prestation déjà EN_COURS", "Section paiement absente"],
            ["5", "Tenter de payer deux fois", "Message 'Déjà en cours'"],
          ]
        ),
        separator(),

        h1("EPIC 6 — Validation & Contestation"),
        h2("CAS-50 — Valider"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Section validation visible (A_VALIDER)", "Boutons Valider + Contester présents"],
            ["2", "Cliquer Valider → confirmer", "Statut TERMINEE, email envoyé"],
            ["3", "Badge auto-validation visible", "Date limite affichée en violet"],
          ]
        ),
        h2("CAS-51 — Contester"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Cliquer Contester", "Textarea pour motif"],
            ["2", "Motif < 10 caractères", "Erreur 'Minimum 10 caractères'"],
            ["3", "Soumettre motif valide", "Prestation → EN_COURS, message Tasky-Infos"],
          ]
        ),
        separator(),

        h1("EPIC 7 — Messagerie"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Envoyer un message", "Message affiché en temps réel"],
            ["2", "Recevoir un message", "Badge rouge sur la liste des demandes"],
            ["3", "Ouvrir le chat", "Badge disparaît"],
            ["4", "Envoyer un téléphone", "Bloqué — erreur 'Coordonnées non autorisées'"],
            ["5", "Onglet Tasky-Infos", "Messages système visibles"],
          ]
        ),
        separator(),

        h1("EPIC 8 — Signalement"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Bouton 'Signaler un problème' visible", "Visible si prestation active"],
            ["2", "Message < 10 caractères", "Erreur de validation"],
            ["3", "Soumettre un signalement valide", "Confirmation + bandeau orange"],
            ["4", "Tenter un 2ème signalement", "Bouton absent (déjà en cours)"],
          ]
        ),
        separator(),

        h1("EPIC 9 — Avis"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Section avis visible (TERMINEE)", "Étoiles cliquables + textarea"],
            ["2", "Soumettre sans étoile", "Erreur 'Note requise'"],
            ["3", "Soumettre avec 5 étoiles", "Avis enregistré, note prestataire mise à jour"],
            ["4", "Tenter un 2ème avis", "Section absente"],
          ]
        ),
      ],
    }],
  });
}

// ─── DOC 3 — Spec Prestataire ─────────────────────────────────────────────────

function buildSpecPrestataire() {
  return new Document({
    sections: [{
      children: [
        ...coverPage("Spec QA — Espace Prestataire", "Cas de test · Espace Prestataire"),

        h1("Comptes de test"),
        makeTable(
          ["Email", "Mot de passe", "Notes"],
          [
            ["artisan1@mail.com", "Test1234!", "Profil complet, actif"],
            ["artisan2@mail.com", "Test1234!", "Profil incomplet (sans IBAN)"],
          ]
        ),
        separator(),

        h1("EPIC 1 — Inscription & Activation"),
        h2("PRE-01 — Inscription"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Remplir formulaire + accepter CGU", "Compte créé, email vérification envoyé"],
            ["2", "Soumettre sans accepter CGU", "Erreur 'Vous devez accepter les CGU'"],
            ["3", "Téléphone < 10 chiffres", "Erreur 'Téléphone invalide'"],
          ]
        ),
        h2("PRE-02 — Activation du profil (5/5)"),
        makeTable(
          ["Étape", "Action", "Résultat attendu"],
          [
            ["1. Email", "Vérifier via le lien reçu", "Case cochée ✅"],
            ["2. Bio", "Saisir bio ≥ 100 caractères", "Case cochée ✅"],
            ["3. Compétences", "Ajouter au moins 1 compétence", "Case cochée ✅"],
            ["4. Point de dépôt", "Renseigner adresse + CP + ville", "Case cochée ✅"],
            ["5. IBAN", "Saisir un IBAN FR valide", "Case cochée ✅"],
            ["Toutes complètes", "Barre de progression disparaît", "Demandes disponibles"],
          ]
        ),
        separator(),

        h1("EPIC 2 — Demandes disponibles"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Accéder à /prestataire/requests", "Demandes avec score de matching"],
            ["2", "Badge 'Match parfait' (vert)", "Score ≥ 70/100"],
            ["3", "Badge 'Bon match' (bleu)", "Score entre 40 et 69"],
            ["4", "Badge 'Match partiel' (orange)", "Score < 40"],
            ["5", "Voir détail du score", "Breakdown catégorie/sous-cat/interventions/ville"],
            ["6", "Prestataire inactif", "Page vide avec invitation à compléter le profil"],
          ]
        ),
        separator(),

        h1("EPIC 3 — Gestion des devis"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Remplir montant + délai + description", "Bouton 'Envoyer le devis' actif"],
            ["2", "Montant ≤ 0", "Erreur 'Montant invalide'"],
            ["3", "Description < 20 caractères", "Erreur 'Description trop courte'"],
            ["4", "Envoyer un devis valide", "Toast de confirmation, client notifié"],
            ["5", "Envoyer un 2ème devis sur la même demande", "Message 'Devis déjà envoyé'"],
          ]
        ),
        separator(),

        h1("EPIC 4 — Gestion des prestations"),
        h2("PRE-31 — État des lieux (MODIFICATION)"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Section état des lieux visible", "Formulaire description + photos + montant révisé"],
            ["2", "Description < 10 caractères", "Erreur 'Description trop courte'"],
            ["3", "Soumettre l'état des lieux", "Client notifié pour valider/refuser"],
          ]
        ),
        h2("PRE-33 — Marquer terminée"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Bouton 'Marquer terminé' visible (EN_COURS)", "Bouton visible uniquement si EN_COURS"],
            ["2", "Cliquer le bouton", "Statut A_VALIDER, délai J+3 démarre"],
            ["3", "Message Tasky-Infos", "Visible dans le chat"],
            ["4", "Badge auto-validation chez le client", "'Auto-validation le JJ/MM/AAAA'"],
          ]
        ),
        separator(),

        h1("EPIC 5 — Messagerie"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Envoyer un message", "Affiché en temps réel"],
            ["2", "Recevoir un message", "Badge rouge sur la liste prestations"],
            ["3", "Envoyer email/téléphone", "Bloqué par le filtre anti-contact"],
          ]
        ),
        separator(),

        h1("EPIC 6 — Profil prestataire"),
        h2("PRE-50 — Compétences"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Ouvrir le modal compétences", "Arborescence catégorie → sous-catégorie → intervention"],
            ["2", "Sélectionner ≤ 3 catégories", "Sélection autorisée"],
            ["3", "Sélectionner > 3 catégories", "Sélection bloquée"],
            ["4", "Sauvegarder", "Toast 'Compétences mises à jour !'"],
          ]
        ),
      ],
    }],
  });
}

// ─── DOC 4 — Spec Admin ───────────────────────────────────────────────────────

function buildSpecAdmin() {
  return new Document({
    sections: [{
      children: [
        ...coverPage("Spec QA — Espace Admin", "Cas de test · Panel Administrateur"),

        h1("Compte admin"),
        makeTable(
          ["Email", "Mot de passe"],
          [["tasky-adm@outlook.fr", "Admin@Tasky2026!"]]
        ),
        body("Pour créer le compte : cd backend && npx ts-node scripts/create-admin.ts"),
        separator(),

        h1("Accès & Sécurité"),
        makeTable(
          ["#", "Test", "Résultat attendu"],
          [
            ["1", "Accéder à /admin sans être connecté", "Redirection vers /auth/login"],
            ["2", "Connexion client → /admin", "Redirection vers /client/dashboard"],
            ["3", "Connexion prestataire → /admin", "Redirection vers /prestataire/dashboard"],
            ["4", "Connexion admin", "Redirection automatique vers /admin/dashboard"],
            ["5", "Admin → /prestataire/dashboard", "Redirection vers /admin/dashboard"],
          ]
        ),
        separator(),

        h1("EPIC 1 — Dashboard"),
        h2("ADM-01 — KPIs"),
        makeTable(
          ["#", "Vérification", "Résultat attendu"],
          [
            ["1", "KPI Utilisateurs actifs", "Nombre total d'utilisateurs actifs"],
            ["2", "Sous-titre utilisateurs", "X clients · Y prestataires"],
            ["3", "KPI Prestations actives", "EN_COURS + EN_ATTENTE_* + A_VALIDER"],
            ["4", "KPI CA total", "Somme des prestations avec paiement Stripe"],
            ["5", "Sous-titre CA", "Commission : X € (15% du CA)"],
            ["6", "KPI Litiges ouverts", "Signalements EN_ATTENTE"],
            ["7", "Bordure rouge litiges", "Uniquement si > 0 signalements"],
          ]
        ),
        h2("ADM-02 — Auto-validation manuelle"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Cliquer '⏰ Lancer auto-validation'", "Toast avec nombre validées"],
            ["2", "Aucune prestation à valider", "'0 prestation(s) auto-validée(s)'"],
            ["3", "Prestations A_VALIDER expirées", "→ TERMINEE + demande TERMINEE + Tasky-Infos"],
          ]
        ),
        separator(),

        h1("EPIC 2 — Utilisateurs"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Afficher la liste", "Tous les utilisateurs paginés (20/page)"],
            ["2", "Rechercher par prénom/email", "Liste filtrée"],
            ["3", "Badge rôle CLIENT", "Bleu"],
            ["4", "Badge rôle PRESTATAIRE", "Vert"],
            ["5", "Badge rôle ADMIN", "Rouge"],
            ["6", "Statut 'Anonymisé'", "Compte supprimé par le propriétaire — pas d'action"],
            ["7", "Cliquer 'Suspendre'", "Compte désactivé, bouton → 'Réactiver'"],
            ["8", "Cliquer 'Réactiver'", "Compte réactivé"],
          ]
        ),
        separator(),

        h1("EPIC 3 — Prestations"),
        h2("ADM-20 — Liste"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Afficher la liste", "Toutes les prestations paginées"],
            ["2", "Filtrer par statut", "Seules les prestations du statut sélectionné"],
            ["3", "Cliquer 'Voir →'", "Navigation vers le détail"],
          ]
        ),
        h2("ADM-21 — Détail"),
        makeTable(
          ["#", "Section", "Contenu attendu"],
          [
            ["1", "Parties", "Nom, email client + prestataire + IBAN"],
            ["2", "Finance", "Montant, commission 15%, net prestataire, Stripe PI"],
            ["3", "Devis proposés", "Tous les devis avec statut"],
            ["4", "État des lieux", "Photos avant/après si présentes"],
            ["5", "Messages Tasky-Infos", "Fond jaune, messages système"],
            ["6", "Conversation", "Messages client (C) / prestataire (P)"],
          ]
        ),
        separator(),

        h1("EPIC 4 — Signalements"),
        makeTable(
          ["#", "Action", "Résultat attendu"],
          [
            ["1", "Signalement EN_ATTENTE", "Badge rouge"],
            ["2", "Signalement RESOLU", "Badge vert, bouton absent"],
            ["3", "Cliquer 'Résoudre' + note", "Résolu + message Tasky-Infos dans le chat"],
            ["4", "KPI dashboard", "Compteur litiges décrémenté"],
          ]
        ),
        separator(),

        h1("EPIC 5 — Paiements"),
        makeTable(
          ["#", "Vérification", "Résultat attendu"],
          [
            ["1", "Résumé financier (haut)", "Volume brut, Commission 15%, Net prestataires"],
            ["2", "IBAN non renseigné", "Badge rouge 'Non renseigné'"],
            ["3", "Cliquer ⎘ sur IBAN", "Copié dans le presse-papier"],
            ["4", "Stripe PI", "Tronqué avec bouton copie"],
          ]
        ),
      ],
    }],
  });
}

// ─── DOC 5 — Spec API Postman ─────────────────────────────────────────────────

function buildSpecApi() {
  return new Document({
    sections: [{
      children: [
        ...coverPage("Spec API — Guide Postman", "Référence des endpoints · Tasky API"),

        h1("Configuration Postman"),
        h2("Variables d'environnement"),
        makeTable(
          ["Variable", "Valeur"],
          [
            ["base_url", "http://localhost:3001"],
            ["token_client", "(obtenu après login client)"],
            ["token_prestataire", "(obtenu après login prestataire)"],
            ["token_admin", "(obtenu après login admin)"],
            ["demande_id", "(ID d'une demande créée)"],
            ["devis_id", "(ID d'un devis envoyé)"],
            ["prestation_id", "(ID d'une prestation créée)"],
          ]
        ),
        body("Header standard : Authorization: Bearer {{token_client}}  |  Content-Type: application/json"),
        separator(),

        h1("1. AUTH — /api/auth"),
        makeTable(
          ["Méthode", "Endpoint", "Auth", "Description"],
          [
            ["POST", "/api/auth/register/client", "Non", "Inscription client"],
            ["POST", "/api/auth/register/prestataire", "Non", "Inscription prestataire"],
            ["POST", "/api/auth/login", "Non", "Connexion — retourne accessToken + refreshToken"],
            ["POST", "/api/auth/refresh", "Non", "Renouveler le token"],
            ["POST", "/api/auth/logout", "Oui", "Déconnexion"],
            ["GET", "/api/auth/me", "Oui", "Profil courant"],
            ["GET", "/api/auth/verify-email?token=X", "Non", "Vérifier l'email"],
            ["POST", "/api/auth/resend-verification", "Non", "Renvoyer l'email de vérification"],
            ["POST", "/api/auth/forgot-password", "Non", "Envoyer lien reset"],
            ["POST", "/api/auth/reset-password", "Non", "Réinitialiser le mot de passe"],
            ["GET", "/api/auth/check-email?email=X", "Non", "Vérifier disponibilité email"],
            ["GET", "/api/auth/check-phone?phone=X", "Non", "Vérifier disponibilité téléphone"],
            ["POST", "/api/auth/recover-email/send-otp", "Non", "Récupération email étape 1"],
            ["POST", "/api/auth/recover-email/verify-otp", "Non", "Récupération email étape 2"],
          ]
        ),
        separator(),

        h1("2. USERS — /api/users"),
        makeTable(
          ["Méthode", "Endpoint", "Description"],
          [
            ["GET", "/api/users/profile", "Mon profil complet"],
            ["PATCH", "/api/users/profile", "Modifier prénom/nom/ville"],
            ["POST", "/api/users/avatar", "Upload avatar (base64)"],
            ["POST", "/api/users/profile/request-phone-change", "Demander changement téléphone"],
            ["POST", "/api/users/profile/verify-phone-otp", "Confirmer nouveau téléphone"],
            ["POST", "/api/users/profile/request-email-change", "Demander changement email"],
            ["POST", "/api/users/profile/verify-email-otp", "Confirmer nouvel email"],
            ["POST", "/api/users/profile/request-delete-account", "Demander suppression compte"],
            ["POST", "/api/users/profile/confirm-delete-account", "Confirmer suppression"],
            ["PATCH", "/api/users/prestataire", "Modifier bio/disponibilité/point dépôt"],
            ["GET", "/api/users/prestataire/competences", "Mes compétences"],
            ["PUT", "/api/users/prestataire/competences", "Mettre à jour les compétences"],
            ["GET", "/api/users/prestataire/stats", "Mes statistiques"],
          ]
        ),
        separator(),

        h1("3. DEMANDES — /api/demandes"),
        makeTable(
          ["Méthode", "Endpoint", "Rôle", "Description"],
          [
            ["POST", "/api/demandes", "CLIENT", "Créer une demande"],
            ["GET", "/api/demandes", "CLIENT", "Mes demandes"],
            ["GET", "/api/demandes/:id", "CLIENT", "Détail d'une demande"],
            ["DELETE", "/api/demandes/:id", "CLIENT", "Supprimer une demande"],
            ["GET", "/api/demandes/available", "PRESTATAIRE", "Demandes disponibles (avec matching)"],
            ["GET", "/api/demandes/:id/detail", "PRESTATAIRE", "Détail pour envoyer un devis"],
            ["GET", "/api/demandes/:id/devis", "CLIENT", "Devis reçus sur une demande"],
            ["POST", "/api/demandes/:id/devis", "PRESTATAIRE", "Envoyer un devis"],
          ]
        ),
        separator(),

        h1("4. DEVIS — /api/devis"),
        makeTable(
          ["Méthode", "Endpoint", "Description"],
          [
            ["GET", "/api/devis/mes-stats", "Statistiques devis du prestataire"],
            ["GET", "/api/devis/mes-devis-refuses", "Devis refusés récents"],
            ["PATCH", "/api/devis/:id/accept", "Accepter un devis (CLIENT)"],
            ["PATCH", "/api/devis/:id/refuse", "Refuser un devis (CLIENT)"],
            ["PATCH", "/api/devis/:id/dismiss", "Masquer un devis refusé (PRESTATAIRE)"],
          ]
        ),
        separator(),

        h1("5. PRESTATIONS — /api/prestations"),
        makeTable(
          ["Méthode", "Endpoint", "Rôle", "Description"],
          [
            ["GET", "/api/prestations", "PRESTATAIRE", "Mes prestations"],
            ["GET", "/api/prestations/client", "CLIENT", "Mes prestations (côté client)"],
            ["GET", "/api/prestations/:id", "PRESTATAIRE", "Détail prestation"],
            ["POST", "/api/prestations/:id/etat-des-lieux", "PRESTATAIRE", "Créer état des lieux"],
            ["PATCH", "/api/prestations/:id/etat-des-lieux/valider", "CLIENT", "Valider/refuser état des lieux"],
            ["PATCH", "/api/prestations/:id/confirmer-conformite", "PRESTATAIRE", "Confirmer conformité objet"],
            ["PATCH", "/api/prestations/:id/terminer", "PRESTATAIRE", "Marquer prestation terminée"],
            ["PATCH", "/api/prestations/:id/valider", "CLIENT", "Valider la prestation"],
            ["PATCH", "/api/prestations/:id/contester", "CLIENT", "Contester la prestation"],
            ["POST", "/api/prestations/:id/review", "CLIENT", "Laisser un avis"],
          ]
        ),
        separator(),

        h1("6. MESSAGES — /api/messages"),
        makeTable(
          ["Méthode", "Endpoint", "Description"],
          [
            ["GET", "/api/messages/unread-count", "Nombre de messages non lus"],
            ["GET", "/api/messages/unread-by-prestation", "Non lus par prestation"],
            ["GET", "/api/messages/:prestationId", "Tous les messages d'une prestation"],
            ["POST", "/api/messages/:prestationId", "Envoyer un message"],
          ]
        ),
        separator(),

        h1("7. PAIEMENT — /api/payment"),
        makeTable(
          ["Méthode", "Endpoint", "Description"],
          [
            ["POST", "/api/payment/create-intent", "Créer un PaymentIntent Stripe — retourne clientSecret"],
            ["POST", "/api/payment/confirm", "Confirmer le paiement après Stripe Elements"],
          ]
        ),
        separator(),

        h1("8. SIGNALEMENTS — /api/signalements"),
        makeTable(
          ["Méthode", "Endpoint", "Description"],
          [
            ["POST", "/api/signalements", "Créer un signalement (CLIENT)"],
          ]
        ),
        separator(),

        h1("9. PRESTATAIRES PUBLICS — /api/prestataires"),
        makeTable(
          ["Méthode", "Endpoint", "Description"],
          [
            ["GET", "/api/prestataires", "Liste publique des prestataires (filtres: ville, category, page)"],
            ["GET", "/api/prestataires/:id", "Profil public d'un prestataire"],
          ]
        ),
        separator(),

        h1("10. ADMIN — /api/admin"),
        makeTable(
          ["Méthode", "Endpoint", "Description"],
          [
            ["GET", "/api/admin/dashboard", "KPIs globaux"],
            ["GET", "/api/admin/users?page=1&search=", "Liste des utilisateurs"],
            ["PATCH", "/api/admin/users/:id/suspend", "Suspendre un utilisateur"],
            ["PATCH", "/api/admin/users/:id/reactivate", "Réactiver un utilisateur"],
            ["GET", "/api/admin/prestations?page=1&status=", "Liste des prestations"],
            ["GET", "/api/admin/prestations/:id", "Détail complet d'une prestation"],
            ["GET", "/api/admin/signalements?page=1", "Liste des signalements"],
            ["PATCH", "/api/admin/signalements/:id/resolve", "Résoudre un signalement"],
            ["GET", "/api/admin/paiements?page=1", "Liste des paiements"],
            ["POST", "/api/admin/jobs/auto-validate", "Lancer l'auto-validation manuellement"],
          ]
        ),
        separator(),

        h1("11. Codes HTTP de retour"),
        makeTable(
          ["Code", "Signification"],
          [
            ["200", "Succès"],
            ["201", "Créé avec succès"],
            ["400", "Données invalides / règle de gestion violée"],
            ["401", "Non authentifié (token manquant ou expiré)"],
            ["403", "Accès refusé (mauvais rôle ou pas le propriétaire)"],
            ["404", "Ressource non trouvée"],
            ["409", "Conflit (doublon, état incompatible)"],
            ["429", "Trop de tentatives (OTP brute force)"],
            ["500", "Erreur serveur interne"],
          ]
        ),
        separator(),

        h1("12. Ordre de test recommandé"),
        makeTable(
          ["Étape", "Appel", "Action"],
          [
            ["1", "POST /api/auth/register/client", "Créer un compte client → stocker accessToken"],
            ["2", "POST /api/auth/register/prestataire", "Créer un compte prestataire → stocker accessToken"],
            ["3", "POST /api/demandes", "Client crée une demande → stocker demande_id"],
            ["4", "POST /api/demandes/:id/devis", "Prestataire envoie un devis → stocker devis_id"],
            ["5", "PATCH /api/devis/:id/accept", "Client accepte le devis → prestation créée (prestation_id)"],
            ["6", "POST /api/payment/create-intent", "Client obtient le clientSecret Stripe"],
            ["7", "POST /api/payment/confirm", "Client confirme → prestation EN_COURS"],
            ["8", "PATCH /api/prestations/:id/terminer", "Prestataire marque terminée → A_VALIDER"],
            ["9", "PATCH /api/prestations/:id/valider", "Client valide → TERMINEE"],
            ["10", "POST /api/prestations/:id/review", "Client laisse un avis"],
          ]
        ),
      ],
    }],
  });
}

// ─── Génération ───────────────────────────────────────────────────────────────

async function generate() {
  const docs = [
    { name: "01-spec-general.docx",       builder: buildSpecGeneral },
    { name: "02-spec-client.docx",         builder: buildSpecClient },
    { name: "03-spec-prestataire.docx",    builder: buildSpecPrestataire },
    { name: "04-spec-admin.docx",          builder: buildSpecAdmin },
    { name: "05-spec-api-postman.docx",    builder: buildSpecApi },
  ];

  for (const { name, builder } of docs) {
    const doc = builder();
    const buffer = await Packer.toBuffer(doc);
    const outPath = path.join(__dirname, "word", name);
    if (!fs.existsSync(path.join(__dirname, "word"))) {
      fs.mkdirSync(path.join(__dirname, "word"));
    }
    fs.writeFileSync(outPath, buffer);
    console.log(`✅ ${name}`);
  }
  console.log("\n📁 Fichiers générés dans docs/word/");
}

generate().catch(console.error);
