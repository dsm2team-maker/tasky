import { Request, Response } from "express";
import { getStripe } from "../config/stripe.config";
import env from "../config/env.config";
import { prisma } from "../lib/prisma";

// POST /api/payment/create-intent
export async function createPaymentIntentHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const { prestationId } = req.body;

    if (!prestationId) {
      return res.status(400).json({ success: false, message: "prestationId requis" });
    }

    const prestation = await prisma.prestation.findUnique({
      where: { id: prestationId },
      include: {
        demande: {
          include: {
            client: { include: { user: true } },
          },
        },
        prestataire: { include: { user: true } },
      },
    });

    if (!prestation) {
      return res.status(404).json({ success: false, message: "Prestation introuvable" });
    }

    if (prestation.demande.client.userId !== userId) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    if (prestation.status !== "EN_ATTENTE_PAIEMENT") {
      return res.status(400).json({ success: false, message: "Cette prestation n'est pas en attente de paiement" });
    }

    const montant = prestation.montantFinal ?? prestation.montant;
    const montantCentimes = Math.round(montant * 100);
    const client = prestation.demande.client.user;
    const prestataire = prestation.prestataire.user;

    const stripe = getStripe();

    // Réutiliser le PaymentIntent existant si déjà créé
    if (prestation.stripePaymentIntentId) {
      const existing = await stripe.paymentIntents.retrieve(prestation.stripePaymentIntentId);
      if (existing.status !== "succeeded" && existing.status !== "canceled") {
        return res.json({ success: true, clientSecret: existing.client_secret, montant });
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: montantCentimes,
      currency: "eur",
      payment_method_types: ["card"],
      description: `Tasky — ${prestation.demande.titre}`,
      receipt_email: client.email,
      metadata: {
        prestationId,
        demandeId: prestation.demandeId,
        demandeTitre: prestation.demande.titre,
        clientNom: `${client.firstName} ${client.lastName}`,
        clientEmail: client.email,
        prestataireNom: `${prestataire.firstName} ${prestataire.lastName}`,
        prestataireEmail: prestataire.email,
        prestataireIban: prestation.prestataire.iban ?? "non renseigné",
        montantPrestataire: (montant * 0.85).toFixed(2),
        commissionTasky: (montant * 0.15).toFixed(2),
      },
    });

    await prisma.prestation.update({
      where: { id: prestationId },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      montant,
    });
  } catch (err: any) {
    console.error("[payment/create-intent]", err);
    if (err.message === "STRIPE_SECRET_KEY is not configured") {
      return res.status(503).json({ success: false, message: "Paiement non configuré" });
    }
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

// POST /api/payment/confirm — appelé par le frontend après stripe.confirmPayment réussi
export async function confirmPaymentHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const { prestationId, paymentIntentId } = req.body;

    if (!prestationId || !paymentIntentId) {
      return res.status(400).json({ success: false, message: "Paramètres manquants" });
    }

    const prestation = await prisma.prestation.findUnique({
      where: { id: prestationId },
      include: { demande: { include: { client: true } } },
    });

    if (!prestation || prestation.demande.client.userId !== userId) {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    // Vérifier auprès de Stripe que le paiement est bien réussi
    const stripe = getStripe();
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (pi.status !== "succeeded") {
      return res.status(400).json({ success: false, message: "Paiement non confirmé par Stripe" });
    }

    if (prestation.status === "EN_COURS") {
      return res.json({ success: true, message: "Déjà en cours" });
    }

    await prisma.$transaction([
      prisma.prestation.update({
        where: { id: prestationId },
        data: { status: "EN_COURS" },
      }),
      prisma.demande.update({
        where: { id: prestation.demandeId },
        data: { status: "EN_COURS" },
      }),
      prisma.message.create({
        data: {
          prestationId,
          contenu: "✅ Paiement reçu. La prestation est maintenant en cours.",
          isSystem: true,
        },
      }),
    ]);

    return res.json({ success: true });
  } catch (err: any) {
    console.error("[payment/confirm]", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
}

// POST /api/payment/webhook — doit recevoir le body brut (express.raw)
export async function stripeWebhookHandler(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  if (!env.stripeWebhookSecret) {
    return res.status(503).json({ success: false, message: "Webhook non configuré" });
  }

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, env.stripeWebhookSecret);
  } catch (err: any) {
    console.error("[webhook] signature invalide:", err.message);
    return res.status(400).json({ success: false, message: `Webhook error: ${err.message}` });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as any;
    const prestationId = pi.metadata?.prestationId;

    if (prestationId) {
      await prisma.prestation.update({
        where: { id: prestationId },
        data: { status: "EN_COURS" },
      });

      await prisma.demande.updateMany({
        where: { prestation: { id: prestationId } },
        data: { status: "EN_COURS" },
      });

      await prisma.message.create({
        data: {
          prestationId,
          contenu: "✅ Paiement reçu. La prestation est maintenant en cours.",
          isSystem: true,
        },
      });
    }
  }

  return res.json({ received: true });
}
