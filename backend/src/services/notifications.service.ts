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

export const notifyNewMessage = (
  to: string,
  firstName: string,
  senderName: string,
  messageCount: number,
  prestationId: string,
  variant: "client" | "prestataire",
) =>
  safe(() => addEmailJob({
    type: "new-message",
    to,
    payload: {
      firstName,
      senderName,
      messageCount,
      conversationUrl: `${FRONTEND_URL}/${variant}/requests/${prestationId}`,
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
