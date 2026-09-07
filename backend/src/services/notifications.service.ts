import { addEmailJob, EMAIL_PRIORITY } from "../queues/email.queue";

const FRONTEND_URL = process.env.FRONTEND_URL || "https://tasky.fr";

const safe = (fn: () => Promise<void>) => fn().catch((e) => console.warn("[notifications]", e?.message));

// ─── Formatters ───────────────────────────────────────────────────────────────

const ref = (reference: number) => `TSK-${String(reference).padStart(6, "0")}`;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const notifyVerifyEmail = (to: string, firstName: string, verificationUrl: string, variant: string) =>
  safe(() => addEmailJob({ type: "verify-email", to, payload: { firstName, verificationUrl, variant } }, EMAIL_PRIORITY.CRITICAL));

export const notifyResetPassword = (to: string, firstName: string, resetUrl: string) =>
  safe(() => addEmailJob({ type: "reset-password", to, payload: { firstName, resetUrl } }, EMAIL_PRIORITY.CRITICAL));

export const notifyEmailChangeAlert = (to: string, firstName: string, newEmail: string) =>
  safe(() => addEmailJob({ type: "email-change-alert", to, payload: { firstName, newEmail } }, EMAIL_PRIORITY.CRITICAL));

export const notifyPhoneChangeOtp = (to: string, firstName: string, otp: string, newPhone: string, isAlert = false) =>
  safe(() => addEmailJob({ type: "phone-change-otp", to, payload: { firstName, otp, newPhone, isAlert } }, EMAIL_PRIORITY.CRITICAL));

export const notifyDeleteAccountOtp = (to: string, firstName: string, otp: string) =>
  safe(() => addEmailJob({ type: "delete-account-otp", to, payload: { firstName, otp } }, EMAIL_PRIORITY.CRITICAL));

// ─── Devis ────────────────────────────────────────────────────────────────────

export const notifyQuoteReceived = (
  clientEmail: string,
  clientFirstName: string,
  demandeReference: number,
  demandeTitre: string,
  prestataireNom: string,
  montant: number,
  demandeId: string,
) =>
  safe(() => addEmailJob({
    type: "quote-received",
    to: clientEmail,
    payload: {
      firstName: clientFirstName,
      demandeReference: ref(demandeReference),
      demandeTitre,
      prestataireNom,
      montant,
      devisUrl: `${FRONTEND_URL}/client/requests/${demandeId}`,
    },
  }));

export const notifyDevisRefuse = (
  prestataireEmail: string,
  prestataireFirstName: string,
  demandeReference: number,
  demandeTitre: string,
) =>
  safe(() => addEmailJob({
    type: "devis-refuse",
    to: prestataireEmail,
    payload: {
      firstName: prestataireFirstName,
      demandeReference: ref(demandeReference),
      demandeTitre,
      demandesUrl: `${FRONTEND_URL}/prestataire/requests`,
    },
  }));

// ─── Messages ─────────────────────────────────────────────────────────────────

// Chat lié à une prestation en cours — URL différente selon le rôle
// (le client navigue par demande, le prestataire par prestation)
export const notifyNewMessagePrestation = (
  to: string,
  firstName: string,
  senderName: string,
  messageCount: number,
  variant: "client" | "prestataire",
  demandeId: string,
  prestationId: string,
) =>
  safe(() => addEmailJob({
    type: "new-message",
    to,
    payload: {
      firstName,
      senderName,
      messageCount,
      conversationUrl:
        variant === "client"
          ? `${FRONTEND_URL}/client/requests/${demandeId}`
          : `${FRONTEND_URL}/prestataire/services/${prestationId}`,
      variant,
    },
  }));

// Conversation directe (avant toute demande) — même route côté client et prestataire
export const notifyNewMessageConversation = (
  to: string,
  firstName: string,
  senderName: string,
  messageCount: number,
  variant: "client" | "prestataire",
  conversationId: string,
) =>
  safe(() => addEmailJob({
    type: "new-message",
    to,
    payload: {
      firstName,
      senderName,
      messageCount,
      conversationUrl: `${FRONTEND_URL}/${variant}/messages/${conversationId}`,
      variant,
    },
  }));

// ─── Commandes ────────────────────────────────────────────────────────────────

export const notifyOrderConfirmed = (params: {
  clientEmail: string;    clientFirstName: string;
  prestataireEmail: string; prestataireFirstName: string;
  demandeReference: number; demandeTitre: string;
  montant: number; demandeId: string;
}) => {
  const common = { demandeReference: ref(params.demandeReference), demandeTitre: params.demandeTitre, montant: params.montant };
  safe(() => addEmailJob({ type: "order-confirmed", to: params.clientEmail, payload: {
    ...common, firstName: params.clientFirstName, role: "client",
    prestationUrl: `${FRONTEND_URL}/client/requests/${params.demandeId}`,
  }}));
  safe(() => addEmailJob({ type: "order-confirmed", to: params.prestataireEmail, payload: {
    ...common, firstName: params.prestataireFirstName, role: "prestataire",
    prestationUrl: `${FRONTEND_URL}/prestataire/requests`,
  }}));
};

export const notifyOrderCompleted = (params: {
  clientEmail: string;    clientFirstName: string;
  prestataireEmail: string; prestataireFirstName: string;
  demandeReference: number; demandeTitre: string;
  montant: number; demandeId: string; isAutoValidated?: boolean;
}) => {
  const common = {
    demandeReference: ref(params.demandeReference), demandeTitre: params.demandeTitre,
    montant: params.montant, isAutoValidated: params.isAutoValidated ?? false,
  };
  safe(() => addEmailJob({ type: "order-completed", to: params.clientEmail, payload: {
    ...common, firstName: params.clientFirstName, role: "client",
    prestationUrl: `${FRONTEND_URL}/client/requests/${params.demandeId}`,
  }}));
  safe(() => addEmailJob({ type: "order-completed", to: params.prestataireEmail, payload: {
    ...common, firstName: params.prestataireFirstName, role: "prestataire",
    prestationUrl: `${FRONTEND_URL}/prestataire/requests`,
  }}));
};

// ─── Demandes ─────────────────────────────────────────────────────────────────

export const notifyDemandeCreated = (
  clientEmail: string,
  clientFirstName: string,
  demandeReference: number,
  demandeTitre: string,
  demandeId: string,
) =>
  safe(() => addEmailJob({
    type: "demande-created",
    to: clientEmail,
    payload: {
      firstName: clientFirstName,
      demandeReference: ref(demandeReference),
      demandeTitre,
      demandeUrl: `${FRONTEND_URL}/client/requests/${demandeId}`,
    },
  }));

// ─── Signalements ─────────────────────────────────────────────────────────────

export const notifySignalementCreated = (
  adminEmails: string[],
  demandeReference: number,
  demandeTitre: string,
  auteurNom: string,
  message: string,
) => {
  for (const to of adminEmails) {
    safe(() => addEmailJob({
      type: "signalement-created",
      to,
      payload: {
        demandeReference: ref(demandeReference),
        demandeTitre,
        auteurNom,
        message,
        signalementUrl: `${FRONTEND_URL}/admin/signalements`,
      },
    }, EMAIL_PRIORITY.CRITICAL));
  }
};

export const notifySignalementResolved = (
  clientEmail: string,
  clientFirstName: string,
  demandeReference: number,
  demandeTitre: string,
  demandeId: string,
  note?: string,
) =>
  safe(() => addEmailJob({
    type: "signalement-resolved",
    to: clientEmail,
    payload: {
      firstName: clientFirstName,
      demandeReference: ref(demandeReference),
      demandeTitre,
      note,
      demandeUrl: `${FRONTEND_URL}/client/requests/${demandeId}`,
    },
  }));

// ─── Prestations ──────────────────────────────────────────────────────────────

export const notifyPrestationContested = (
  prestataireEmail: string,
  prestataireFirstName: string,
  demandeReference: number,
  demandeTitre: string,
  motif: string,
) =>
  safe(() => addEmailJob({
    type: "prestation-contested",
    to: prestataireEmail,
    payload: {
      firstName: prestataireFirstName,
      demandeReference: ref(demandeReference),
      demandeTitre,
      motif,
      prestationUrl: `${FRONTEND_URL}/prestataire/requests`,
    },
  }, EMAIL_PRIORITY.CRITICAL));

// ─── Comptes ──────────────────────────────────────────────────────────────────

export const notifyAccountStatus = (
  to: string,
  firstName: string,
  suspended: boolean,
  reason?: string,
) =>
  safe(() => addEmailJob({
    type: "account-status",
    to,
    payload: { firstName, suspended, reason, supportUrl: `${FRONTEND_URL}/contact` },
  }, EMAIL_PRIORITY.CRITICAL));

// ─── Paiements ────────────────────────────────────────────────────────────────

export const notifyConnectOnboardingComplete = (prestataireEmail: string, prestataireFirstName: string) =>
  safe(() => addEmailJob({
    type: "connect-onboarding-complete",
    to: prestataireEmail,
    payload: { firstName: prestataireFirstName, earningsUrl: `${FRONTEND_URL}/prestataire/earnings` },
  }));

export const notifyTransferCompleted = (
  prestataireEmail: string,
  prestataireFirstName: string,
  demandeReference: number,
  demandeTitre: string,
  montant: number,
) =>
  safe(() => addEmailJob({
    type: "transfer-completed",
    to: prestataireEmail,
    payload: {
      firstName: prestataireFirstName,
      demandeReference: ref(demandeReference),
      demandeTitre,
      montant,
      earningsUrl: `${FRONTEND_URL}/prestataire/earnings`,
    },
  }));
