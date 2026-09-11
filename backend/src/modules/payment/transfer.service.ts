import { prisma } from "../../lib/prisma";
import { getStripe } from "../../config/stripe.config";
import { sendSystemMessageToUser } from "../messages/message.service";
import { splitMontant } from "../../config/commission.config";
import { notifyTransferCompleted, notifyTransferFailed } from "../../services/notifications.service";

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
        demandeId: true,
        prestataire: {
          select: {
            userId: true,
            stripeAccountId: true,
            stripePayoutsEnabled: true,
            user: { select: { email: true, firstName: true, lastName: true } },
          },
        },
        demande: { select: { reference: true, titre: true } },
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
      await sendSystemMessageToUser(
        prestation.prestataire.userId,
        "Le versement de votre paiement est en attente : finalisez votre configuration de paiement dans vos paramètres pour le recevoir.",
        prestationId,
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

      notifyTransferCompleted(
        prestation.prestataire.user.email,
        prestation.prestataire.user.firstName,
        prestation.demande.reference,
        prestation.demande.titre,
        montantPrestataire,
      );
    } catch (err: any) {
      console.error("[transfer] stripe.transfers.create failed:", err);
      const failureReason = err?.message ?? "Erreur inconnue";
      await prisma.transfer.upsert({
        where: { prestationId },
        update: { status: "FAILED", failureReason },
        create: {
          prestationId,
          prestataireId: prestation.prestataireId,
          amount: montantPrestataire,
          status: "FAILED",
          failureReason,
        },
      });

      await sendSystemMessageToUser(
        prestation.prestataire.userId,
        "⚠️ Votre virement a rencontré un problème technique. Notre équipe a été prévenue et s'en occupe.",
        prestationId,
      ).catch((e) => console.warn("[transfer] system message:", e?.message));

      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { email: true },
      });
      notifyTransferFailed(
        admins.map((a) => a.email),
        prestation.demande.reference,
        prestation.demande.titre,
        `${prestation.prestataire.user.firstName} ${prestation.prestataire.user.lastName}`,
        montantPrestataire,
        failureReason,
      );
    }
  } catch (err: any) {
    console.error("[transfer] createTransferForPrestation failed:", err);
  }
};
