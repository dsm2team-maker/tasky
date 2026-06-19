import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis.config";
import { resend, emailConfig } from "../config/resend.config";
import { EmailJobData } from "../queues/email.queue";
import { verifyEmailTemplate } from "../emails/verify-email.template";
import { resetPasswordTemplate } from "../emails/reset-password.template";
import { newMessageTemplate } from "../emails/new-message.template";
import { phoneChangeOtpTemplate } from "../emails/phone-change-otp.template";
import { emailChangeAlertTemplate } from "../emails/email-change-alert.template";
import { devisRefuseTemplate } from "../emails/devis-refuse.template";
import { deleteAccountOtpTemplate } from "../emails/delete-account-otp.template";
import { quoteReceivedTemplate } from "../emails/quote-received.template";
import { orderConfirmedTemplate } from "../emails/order-confirmed.template";
import { orderCompletedTemplate } from "../emails/order-completed.template";
import { prisma } from "../lib/prisma";

const processEmailJob = async (job: Job<EmailJobData>) => {
  const { type, to } = job.data;
  const payload = job.data.payload as any;
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
      subject =
        payload.messageCount > 1
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

    case "phone-change-otp":
      subject = payload.isAlert
        ? "Alerte sécurité — Téléphone modifié — Tasky"
        : "Votre code de vérification — Tasky";
      html = phoneChangeOtpTemplate({
        firstName: payload.firstName,
        otp: payload.otp,
        newPhone: payload.newPhone,
        isAlert: payload.isAlert,
      });
      break;

    case "email-change-alert":
      subject = "Alerte sécurité — Email modifié — Tasky";
      html = emailChangeAlertTemplate({
        firstName: payload.firstName,
        newEmail: payload.newEmail,
      });
      break;

    case "devis-refuse":
      subject = `Votre devis pour ${payload.demandeReference} n'a pas été retenu — Tasky`;
      html = devisRefuseTemplate({
        firstName: payload.firstName,
        demandeReference: payload.demandeReference,
        demandeTitre: payload.demandeTitre,
        demandesUrl: payload.demandesUrl,
      });
      break;

    case "delete-account-otp":
      subject = "Suppression de compte — Code de confirmation — Tasky";
      html = deleteAccountOtpTemplate({
        firstName: payload.firstName,
        otp: payload.otp,
      });
      break;

    case "quote-received":
      subject = `Nouveau devis reçu — ${payload.demandeReference} — Tasky`;
      html = quoteReceivedTemplate({
        firstName: payload.firstName,
        demandeReference: payload.demandeReference,
        demandeTitre: payload.demandeTitre,
        prestataireNom: payload.prestataireNom,
        montant: payload.montant,
        devisUrl: payload.devisUrl,
      });
      break;

    case "order-confirmed":
      subject = `Prestation confirmée — ${payload.demandeReference} — Tasky`;
      html = orderConfirmedTemplate({
        firstName: payload.firstName,
        demandeReference: payload.demandeReference,
        demandeTitre: payload.demandeTitre,
        montant: payload.montant,
        role: payload.role,
        prestationUrl: payload.prestationUrl,
      });
      break;

    case "order-completed":
      subject = `Prestation terminée — ${payload.demandeReference} — Tasky`;
      html = orderCompletedTemplate({
        firstName: payload.firstName,
        demandeReference: payload.demandeReference,
        demandeTitre: payload.demandeTitre,
        montant: payload.montant,
        role: payload.role,
        isAutoValidated: payload.isAutoValidated ?? false,
        prestationUrl: payload.prestationUrl,
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
  await prisma.emailLog
    .create({
      data: {
        to,
        type,
        status: "sent",
        resendId: data?.id,
        userId: job.data.userId,
      },
    })
    .catch(() => {}); // Ne pas bloquer si le log échoue

  console.log(`✅ Email envoyé: ${type} → ${to} (id: ${data?.id})`);
};

// Créer le worker
export const emailWorker = new Worker<EmailJobData>(
  "email-queue",
  processEmailJob,
  {
    connection: redisConnection,
    concurrency: 5,
    drainDelay: 5000,
  },
);

emailWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} terminé: ${job.data.type}`);
});

emailWorker.on("failed", (job, error) => {
  console.error(`❌ Job ${job?.id} échoué: ${error.message}`);
});

export default emailWorker;
