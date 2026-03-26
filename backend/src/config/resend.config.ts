import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY manquante dans .env");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const isProd = process.env.NODE_ENV === "production";

export const emailConfig = {
  from: {
    noreply: isProd
      ? "Tasky <no-reply@mail.tasky.fr>"
      : "Tasky <noreply@dsmteam.fr>",
    notifications: isProd
      ? "Tasky <notifications@mail.tasky.fr>"
      : "Tasky <noreply@dsmteam.fr>",
    support: isProd
      ? "Tasky Support <support@mail.tasky.fr>"
      : "Tasky <noreply@dsmteam.fr>",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};

export default resend;
