import { Response } from "express";

// ─── Map globale code → [httpStatus, message FR] ────────────────────────────
const ERROR_MAP: Record<string, [number, string]> = {
  // Auth / Utilisateurs
  USER_NOT_FOUND:            [404, "Aucun compte trouvé avec cet email"],
  EMAIL_NOT_VERIFIED:        [403, "Veuillez vérifier votre email avant de vous connecter"],
  ACCOUNT_INACTIVE:          [403, "Votre compte a été désactivé. Contactez le support"],
  ACCOUNT_ALREADY_INACTIVE:  [409, "Ce compte est déjà désactivé"],
  WRONG_PASSWORD:            [401, "Mot de passe incorrect"],
  SAME_EMAIL:                [409, "C'est déjà votre adresse email actuelle"],
  SAME_PHONE:                [409, "C'est déjà votre numéro actuel"],
  EMAIL_ALREADY_USED:        [409, "Cette adresse email est déjà utilisée"],
  PHONE_ALREADY_USED:        [409, "Ce numéro est déjà associé à un autre compte"],
  NO_PHONE:                  [400, "Aucun numéro de téléphone enregistré"],
  HAS_ACTIVE_PRESTATIONS:    [409, "Impossible — vous avez des prestations actives en cours"],

  // OTP
  OTP_EXPIRED_OR_NOT_FOUND:  [400, "Code expiré ou introuvable. Renvoyez un nouveau code"],
  OTP_MAX_ATTEMPTS:          [429, "Trop de tentatives. Attendez avant de réessayer"],
  OTP_INVALID:               [400, "Code incorrect"],

  // Prestataire
  PRESTATAIRE_NOT_FOUND:     [404, "Prestataire introuvable"],
  PRESTATAIRE_INACTIF:       [403, "Ce prestataire n'est pas encore actif sur la plateforme"],
  INVALID_CATEGORY:          [400, "Catégorie invalide"],

  // Client
  CLIENT_NOT_FOUND:          [404, "Client introuvable"],

  // Demandes
  DEMANDE_NOT_FOUND:         [404, "Demande introuvable"],
  DEMANDE_NON_DISPONIBLE:    [409, "Cette demande n'est plus disponible"],
  DEMANDE_EN_COURS:          [409, "Impossible — cette demande est déjà en cours"],
  CATEGORY_NOT_FOUND:        [404, "Catégorie introuvable"],

  // Devis
  DEVIS_NOT_FOUND:           [404, "Devis introuvable"],
  DEVIS_DEJA_ENVOYE:         [409, "Vous avez déjà envoyé un devis pour cette demande"],
  DEVIS_NON_DISPONIBLE:      [409, "Ce devis n'est plus disponible"],
  DEVIS_NON_REFUSE:          [409, "Ce devis n'est pas dans un état refusé"],

  // Prestations
  PRESTATION_NOT_FOUND:                  [404, "Prestation introuvable"],
  PRESTATION_NOT_EN_COURS:               [400, "La prestation n'est pas en cours"],
  PRESTATION_NOT_A_VALIDER:              [400, "La prestation n'est pas à valider"],
  PRESTATION_NOT_TERMINEE:               [400, "La prestation n'est pas encore terminée"],
  PRESTATION_NOT_EN_ATTENTE_INSPECTION:  [400, "La prestation n'est pas en attente d'inspection"],
  PRESTATION_NOT_EN_ATTENTE_PAIEMENT:    [400, "La prestation n'est pas en attente de paiement"],
  ETAT_DES_LIEUX_NOT_FOUND:              [404, "État des lieux introuvable"],
  ETAT_DES_LIEUX_REQUIRED:               [400, "L'état des lieux est requis avant de marquer comme terminé"],
  ETAT_DES_LIEUX_NOT_VALIDATED:          [400, "L'état des lieux doit être validé par le client"],
  ETAT_DES_LIEUX_ALREADY_EXISTS:         [409, "Un état des lieux existe déjà"],
  ETAT_DES_LIEUX_ALREADY_PROCESSED:      [400, "L'état des lieux a déjà été traité"],
  NOT_MODIFICATION:                      [400, "L'état des lieux n'est disponible que pour les modifications"],
  REVIEW_ALREADY_EXISTS:                 [409, "Un avis existe déjà pour cette prestation"],
  RATING_INVALID:                        [400, "La note doit être entre 1 et 5"],
  MOTIF_TROP_COURT:                      [400, "Le motif doit faire au moins 10 caractères"],

  // Messages
  CONTENU_VIDE:              [400, "Le message ne peut pas être vide"],
  CONTENU_TROP_LONG:         [400, "Le message est trop long (max 2000 caractères)"],
  CONTACT_INFO_DETECTED:     [400, "Les coordonnées personnelles ne sont pas autorisées dans les messages"],

  // Signalements
  SIGNALEMENT_NOT_FOUND:     [404, "Signalement introuvable"],
  SIGNALEMENT_EXISTANT:      [409, "Un signalement est déjà en cours pour cette demande"],
  STATUT_INVALIDE:           [400, "Impossible de signaler une demande dans ce statut"],
  MESSAGE_TROP_COURT:        [400, "Le message doit faire au moins 10 caractères"],

  // Commun
  FORBIDDEN:                 [403, "Accès refusé"],
  NOT_FOUND:                 [404, "Ressource introuvable"],
};

// ─── Helper principal ────────────────────────────────────────────────────────

export const handleError = (error: unknown, res: Response): void => {
  if (!(error instanceof Error)) {
    res.status(500).json({ success: false, message: "Erreur serveur inattendue" });
    return;
  }

  // Codes OTP avec suffixe (ex: "OTP_INVALID:2")
  const baseCode = error.message.split(":")[0];

  const mapped = ERROR_MAP[error.message] ?? ERROR_MAP[baseCode];

  if (mapped) {
    const [status, message] = mapped;
    res.status(status).json({ success: false, message, code: baseCode });
    return;
  }

  // Erreur non mappée → 500
  console.error("[handleError] Erreur non mappée:", error.message, error.stack);
  res.status(500).json({ success: false, message: "Erreur serveur" });
};

// ─── Helper OTP (code avec tentatives restantes) ──────────────────────────────

export const handleOtpError = (error: Error, res: Response): boolean => {
  if (error.message === "OTP_EXPIRED_OR_NOT_FOUND") {
    res.status(400).json({ success: false, message: ERROR_MAP.OTP_EXPIRED_OR_NOT_FOUND[1], code: "OTP_EXPIRED_OR_NOT_FOUND" });
    return true;
  }
  if (error.message === "OTP_MAX_ATTEMPTS") {
    res.status(429).json({ success: false, message: ERROR_MAP.OTP_MAX_ATTEMPTS[1], code: "OTP_MAX_ATTEMPTS" });
    return true;
  }
  if (error.message?.startsWith("OTP_INVALID:")) {
    const remaining = error.message.split(":")[1];
    res.status(400).json({ success: false, message: `Code incorrect. ${remaining} tentative(s) restante(s)`, code: "OTP_INVALID" });
    return true;
  }
  return false;
};

// ─── Helper validation OTP format ────────────────────────────────────────────

export const validateOtpFormat = (otp: unknown): otp is string => {
  return typeof otp === "string" && /^\d{6}$/.test(otp);
};
