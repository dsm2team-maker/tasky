import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.config";

// Types de jobs email
export type EmailJobType =
  | "verify-email"
  | "reset-password"
  | "quote-received"
  | "order-confirmed"
  | "order-completed"
  | "phone-change-otp" // OTP changement téléphone → envoyé par email
  | "email-change-otp" // OTP changement email → envoyé sur la nouvelle adresse
  | "email-change-alert" // Alerte sécurité → envoyé sur l'ancienne adresse
  | "devis-refuse" // Notification prestataire — devis non retenu
  | "devis-accepte" // Notification prestataire — devis accepté
  | "delete-account-otp" // OTP suppression de compte
  | "signalement-created" // Notification admin — nouveau signalement
  | "signalement-resolved" // Notification client — signalement traité
  | "prestation-contested" // Notification prestataire — prestation contestée
  | "account-status" // Notification utilisateur — suspension/réactivation
  | "connect-onboarding-complete" // Notification prestataire — Stripe Connect activé
  | "transfer-completed"; // Notification prestataire — virement envoyé

// ─── Payloads typés par type d'email ─────────────────────────────────────────

interface VerifyEmailPayload      { firstName: string; verificationUrl: string; variant: string }
interface ResetPasswordPayload    { firstName: string; resetUrl: string }
interface QuoteReceivedPayload    { firstName: string; demandeReference: string; demandeTitre: string; prestataireNom: string; montant: number; devisUrl: string }
interface OrderConfirmedPayload   { firstName: string; demandeReference: string; demandeTitre: string; montant: number; role: "client" | "prestataire"; prestationUrl: string }
interface OrderCompletedPayload   { firstName: string; demandeReference: string; demandeTitre: string; montant: number; role: "client" | "prestataire"; isAutoValidated: boolean; prestationUrl: string }
interface PhoneChangeOtpPayload   { firstName: string; otp: string; newPhone: string; isAlert: boolean }
interface EmailChangeOtpPayload   { firstName: string; otp: string; newEmail: string }
interface EmailChangeAlertPayload { firstName: string; newEmail: string }
interface DevisRefusePayload      { firstName: string; demandeReference: string; demandeTitre: string; demandesUrl: string }
interface DevisAcceptePayload     { firstName: string; demandeReference: string; demandeTitre: string; prestationUrl: string }
interface DeleteAccountOtpPayload { firstName: string; otp: string }
interface SignalementCreatedPayload  { demandeReference: string; demandeTitre: string; auteurNom: string; message: string; signalementUrl: string }
interface SignalementResolvedPayload { firstName: string; demandeReference: string; demandeTitre: string; note?: string; demandeUrl: string }
interface PrestationContestedPayload { firstName: string; demandeReference: string; demandeTitre: string; motif: string; prestationUrl: string }
interface AccountStatusPayload    { firstName: string; suspended: boolean; reason?: string; supportUrl: string }
interface ConnectOnboardingCompletePayload { firstName: string; earningsUrl: string }
interface TransferCompletedPayload { firstName: string; demandeReference: string; demandeTitre: string; montant: number; earningsUrl: string }

type EmailPayloadMap = {
  "verify-email":       VerifyEmailPayload;
  "reset-password":     ResetPasswordPayload;
  "quote-received":     QuoteReceivedPayload;
  "order-confirmed":    OrderConfirmedPayload;
  "order-completed":    OrderCompletedPayload;
  "phone-change-otp":   PhoneChangeOtpPayload;
  "email-change-otp":   EmailChangeOtpPayload;
  "email-change-alert": EmailChangeAlertPayload;
  "devis-refuse":       DevisRefusePayload;
  "devis-accepte":      DevisAcceptePayload;
  "delete-account-otp": DeleteAccountOtpPayload;
  "signalement-created":          SignalementCreatedPayload;
  "signalement-resolved":         SignalementResolvedPayload;
  "prestation-contested":         PrestationContestedPayload;
  "account-status":               AccountStatusPayload;
  "connect-onboarding-complete":  ConnectOnboardingCompletePayload;
  "transfer-completed":           TransferCompletedPayload;
};

export type EmailJobData<T extends EmailJobType = EmailJobType> = {
  type: T;
  to: string;
  userId?: string;
  payload: EmailPayloadMap[T];
};

// Priorités
export const EMAIL_PRIORITY = {
  CRITICAL: 1, // Vérification email, reset password
  NORMAL: 5, // Nouveau message, devis
  LOW: 10, // Résumés, rappels
};

// La queue email
export const emailQueue = new Queue<EmailJobData>("email-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: 100, // Garder les 100 derniers jobs réussis
    removeOnFail: 50, // Garder les 50 derniers jobs échoués
  },
});

// Helpers pour ajouter des jobs
export const addEmailJob = async (
  data: EmailJobData,
  priority: number = EMAIL_PRIORITY.NORMAL,
  delay?: number,
) => {
  await emailQueue.add(data.type, data, {
    priority,
    delay,
  });
  console.log(`📧 Job email ajouté: ${data.type} → ${data.to}`);
};

export default emailQueue;
