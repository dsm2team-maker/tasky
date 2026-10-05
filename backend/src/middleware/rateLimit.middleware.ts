import rateLimit, { Options } from "express-rate-limit";
import { AuthRequest } from "./auth.middleware";

// Limiteurs dédiés (SEC-015). Store mémoire : valable tant que l'API tourne sur une seule
// instance Railway. Si on passe en multi-instance, brancher un store Redis (rate-limit-redis)
// sinon chaque instance a son propre compteur. Nécessite app.set("trust proxy") (index.ts).
// Seuils volontairement larges : ils visent les scripts, pas un utilisateur normal
// (y compris derrière une IP partagée de bureau ou d'opérateur mobile).

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const make = (windowMs: number, max: number, message: string, keyGenerator?: Options["keyGenerator"]) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    ...(keyGenerator ? { keyGenerator } : {}),
  });

const normEmail = (v: unknown) => String(v ?? "").trim().toLowerCase();
const byUser = (req: any) => (req as AuthRequest).user?.userId ?? req.ip;

// ── Endpoints publics qui envoient un email (quota Resend + réputation de mail.tasky.fr) ──
export const emailSendIpLimiter = make(HOUR, 20, "Trop de demandes, réessayez dans une heure.");
export const emailSendTargetLimiter = make(
  HOUR,
  5,
  "Trop de demandes pour cette adresse, réessayez dans une heure.",
  (req) => `${req.ip}:${normEmail(req.body?.email)}`,
);

// ── Inscription ──
export const registerLimiter = make(HOUR, 10, "Trop d'inscriptions depuis cette connexion, réessayez dans une heure.");

// ── Consommation de tokens / OTP publics (verify-email, reset-password, recover-email) ──
export const tokenConsumeLimiter = make(15 * MINUTE, 30, "Trop de tentatives, réessayez dans 15 minutes.");

// ── Refresh de session (appelé automatiquement par le front) ──
export const refreshLimiter = make(15 * MINUTE, 120, "Trop de requêtes, réessayez dans quelques minutes.");

// ── Vérification de disponibilité email/téléphone (formulaire d'inscription, debouncé) ──
export const availabilityLimiter = make(15 * MINUTE, 150, "Trop de vérifications, réessayez dans quelques minutes.");

// ── Endpoints authentifiés : clé = utilisateur (placer APRÈS authMiddleware) ──
export const otpSendLimiter = make(HOUR, 5, "Trop de codes demandés, réessayez dans une heure.", byUser);
export const otpVerifyLimiter = make(15 * MINUTE, 20, "Trop de tentatives, réessayez dans 15 minutes.", byUser);
export const messageLimiter = make(MINUTE, 30, "Vous envoyez trop de messages, patientez une minute.", byUser);
export const uploadLimiter = make(DAY, 30, "Limite d'envois de photos atteinte pour aujourd'hui.", byUser);
export const contactLimiter = make(HOUR, 5, "Trop de messages envoyés au support, réessayez dans une heure.", byUser);
export const signalementLimiter = make(HOUR, 10, "Trop de signalements, réessayez dans une heure.", byUser);
