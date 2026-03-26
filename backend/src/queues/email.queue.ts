import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.config";

// Types de jobs email
export type EmailJobType =
  | "verify-email"
  | "reset-password"
  | "new-message"
  | "quote-received"
  | "order-confirmed"
  | "order-completed"
  | "phone-change-otp" // OTP changement téléphone → envoyé par email
  | "email-change-alert"; // Alerte sécurité → envoyé sur l'ancienne adresse

export interface EmailJobData {
  type: EmailJobType;
  to: string;
  userId?: string;
  payload: Record<string, any>;
}

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
