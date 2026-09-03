import { Request, Response } from "express";
import { getStripe } from "../config/stripe.config";
import env from "../config/env.config";
import {
  getOrCreateConnectAccount,
  createAccountSession,
  getConnectStatus,
  syncConnectAccountStatus,
} from "../modules/payment/connect.service";

// POST /api/connect/account
export async function createAccountHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const stripeAccountId = await getOrCreateConnectAccount(userId);
    return res.json({ success: true, stripeAccountId });
  } catch (err: any) {
    console.error("[connect/account]", err);
    if (err.message === "PRESTATAIRE_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Prestataire introuvable" });
    }
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

// POST /api/connect/account-session
export async function createAccountSessionHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const clientSecret = await createAccountSession(userId);
    return res.json({ success: true, clientSecret });
  } catch (err: any) {
    console.error("[connect/account-session]", err);
    if (err.message === "PRESTATAIRE_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Prestataire introuvable" });
    }
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

// GET /api/connect/status
export async function getConnectStatusHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const status = await getConnectStatus(userId);
    return res.json({ success: true, data: status });
  } catch (err: any) {
    console.error("[connect/status]", err);
    if (err.message === "PRESTATAIRE_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Prestataire introuvable" });
    }
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

// POST /api/payment/webhook/connect — doit recevoir le body brut (express.raw)
export async function stripeConnectWebhookHandler(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  if (!env.stripeConnectWebhookSecret) {
    return res.status(503).json({ success: false, message: "Webhook Connect non configuré" });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, env.stripeConnectWebhookSecret);
  } catch (err: any) {
    console.error("[connect webhook] signature invalide:", err.message);
    return res.status(400).json({ success: false, message: `Webhook error: ${err.message}` });
  }

  if (event.type === "account.updated") {
    const account = event.data.object as any;
    await syncConnectAccountStatus({
      id: account.id,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    });
  }

  return res.json({ received: true });
}
