import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis.config";
import { resend, emailConfig } from "../config/resend.config";
import { EmailJobData } from "../queues/email.queue";
import { verifyEmailTemplate } from "../emails/verify-email.template";
import { resetPasswordTemplate } from "../emails/reset-password.template";
import { newMessageTemplate } from "../emails/new-message.template";
import { prisma } from "../lib/prisma";

const processEmailJob = async (job: Job<EmailJobData>) => {
  const { type, to, payload } = job.data;
  console.log(`📧 Traitement job: ${type} → ${to}`);

  let subject = "";
  let html = "";

  switch (type) {
    case "verify-email":
      subject = "Confirmez votre email — Tasky";
      html = verifyEmailTemplate({
        firstName: payload.firstName,
        verificationUrl: payload.verificationUrl,
        variant: payload.variant,
      });
      break;

    case "reset-password":
      subject = "Réinitialisation de votre mot de passe — Tasky";
      html = resetPasswordTemplate({
        firstName: payload.firstName,
        resetUrl: payload.resetUrl,
      });
      break;

    case "new-message":
      subject = payload.messageCount > 1
        ? `${payload.messageCount} nouveaux messages sur Tasky`
        : `Nouveau message de ${payload.senderName} — Tasky`;
      html = newMessageTemplate({
        firstName: payload.firstName,
        senderName: payload.senderName,
        messageCount: payload.messageCount,
        conversationUrl: payload.conversationUrl,
        variant: payload.variant,
      });
      break;

    default:
      console.warn(`⚠️ Type de job inconnu: ${type}`);
      return;
  }

  // Envoi via Resend
  const { data, error } = await resend.emails.send({
    from: emailConfig.from.noreply,
    to,
    subject,
    html,
  });

  if (error) {
    console.error(`❌ Erreur Resend:`, error);
    throw new Error(`Resend error: ${error.message}`);
  }

  // Log en base
  await prisma.emailLog.create({
    data: {
      to,
      type,
      status: "sent",
      resendId: data?.id,
      userId: job.data.userId,
    },
  }).catch(() => {}); // Ne pas bloquer si le log échoue

  console.log(`✅ Email envoyé: ${type} → ${to} (id: ${data?.id})`);
};

// Créer le worker
export const emailWorker = new Worker<EmailJobData>(
  "email-queue",
  processEmailJob,
  {
    connection: redisConnection,
    concurrency: 5, // 5 emails en parallèle max
  }
);

emailWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} terminé: ${job.data.type}`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`❌ Job ${job?.id} échoué: ${error.message}`);
});

export default emailWorker;
