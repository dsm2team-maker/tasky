import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY manquante dans .env");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const isProd = process.env.NODE_ENV === "production";

export const emailConfig = {
  from: {
    // En dev : domaine Resend par défaut (déjà vérifié)
    // En prod : domaine Tasky (à configurer sur resend.com/domains)
    noreply: isProd
      ? "Tasky <no-reply@mail.tasky.fr>"
      : "Tasky <onboarding@resend.dev>",
    notifications: isProd
      ? "Tasky <notifications@mail.tasky.fr>"
      : "Tasky <onboarding@resend.dev>",
    support: isProd
      ? "Tasky Support <support@mail.tasky.fr>"
      : "Tasky <onboarding@resend.dev>",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};

export default resend;
