import { prisma } from "../../lib/prisma";
import { getStripe } from "../../config/stripe.config";
import { sendSystemMessage } from "../messages/message.service";
import { splitMontant } from "../../config/commission.config";

// Point d'accroche unique du transfert — appelé depuis validerPrestation() et
// runAutoValidation(), jamais directement. Ne lève jamais d'exception : un échec
// de transfert ne doit jamais bloquer le passage de la prestation à TERMINEE.
export const createTransferForPrestation = async (prestationId: string): Promise<void> => {
  try {
    const existing = await prisma.transfer.findUnique({ where: { prestationId } });
    if (existing?.status === "SUCCEEDED") return;

    const prestation = await prisma.prestation.findUnique({
      where: { id: prestationId },
      select: {
        id: true,
        montantFinal: true,
        montant: true,
        stripeChargeId: true,
        prestataireId: true,
        prestataire: {
          select: { stripeAccountId: true, stripePayoutsEnabled: true },
        },
      },
    });
    if (!prestation) return;

    const montant = prestation.montantFinal ?? prestation.montant;
    const { montantPrestataire } = splitMontant(montant);

    if (!prestation.prestataire.stripeAccountId || !prestation.prestataire.stripePayoutsEnabled) {
      await prisma.transfer.upsert({
        where: { prestationId },
        update: { status: "SKIPPED" },
        create: {
          prestationId,
          prestataireId: prestation.prestataireId,
          amount: montantPrestataire,
          status: "SKIPPED",
        },
      });
      await sendSystemMessage(
        prestationId,
        "Le versement de votre paiement est en attente : finalisez votre configuration de paiement dans vos paramètres pour le recevoir.",
      ).catch((e) => console.warn("[transfer] system message:", e?.message));
      return;
    }

    const stripe = getStripe();
    try {
      const transfer = await stripe.transfers.create(
        {
          amount: Math.round(montantPrestataire * 100),
          currency: "eur",
          destination: prestation.prestataire.stripeAccountId,
          transfer_group: `prestation_${prestationId}`,
          ...(prestation.stripeChargeId && { source_transaction: prestation.stripeChargeId }),
        },
        { idempotencyKey: `transfer_${prestationId}` },
      );

      await prisma.transfer.upsert({
        where: { prestationId },
        update: {
          status: "SUCCEEDED",
          stripeTransferId: transfer.id,
          completedAt: new Date(),
        },
        create: {
          prestationId,
          prestataireId: prestation.prestataireId,
          amount: montantPrestataire,
          status: "SUCCEEDED",
          stripeTransferId: transfer.id,
          completedAt: new Date(),
        },
      });
    } catch (err: any) {
      console.error("[transfer] stripe.transfers.create failed:", err);
      await prisma.transfer.upsert({
        where: { prestationId },
        update: { status: "FAILED", failureReason: err?.message ?? "Erreur inconnue" },
        create: {
          prestationId,
          prestataireId: prestation.prestataireId,
          amount: montantPrestataire,
          status: "FAILED",
          failureReason: err?.message ?? "Erreur inconnue",
        },
      });
    }
  } catch (err: any) {
    console.error("[transfer] createTransferForPrestation failed:", err);
  }
};
