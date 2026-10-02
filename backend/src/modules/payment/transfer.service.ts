import { prisma } from "../../lib/prisma";
import { getStripe } from "../../config/stripe.config";
import { sendSystemMessageToUser } from "../messages/message.service";
import { splitMontant } from "../../config/commission.config";
import { notifyTransferCompleted, notifyTransferFailed } from "../../services/notifications.service";

// Un transfert FAILED dont le failureReason commence par ce préfixe est bloqué par un
// litige bancaire (chargeback) : il n'est jamais rejoué automatiquement, seul un admin
// peut décider. Choix sans migration de schéma (pas de nouveau statut d'enum).
export const DISPUTE_BLOCK_PREFIX = "DISPUTE:";

// Fenêtre pendant laquelle un transfert FAILED est retenté automatiquement (cron horaire).
const FAILED_RETRY_WINDOW_MS = 72 * 3600 * 1000;
// Délai avant de considérer qu'une prestation TERMINEE sans Transfer a été "perdue"
// (process tué entre la transition et le transfert) — évite la course avec validerPrestation.
const MISSING_TRANSFER_GRACE_MS = 15 * 60 * 1000;
// On ne rattrape que les prestations récentes : les plus anciennes peuvent dater
// d'avant la migration Stripe Connect (versements manuels) → risque de double paiement.
const MISSING_TRANSFER_MAX_AGE_MS = 7 * 24 * 3600 * 1000;

const isDisputeBlocked = (t: { status: string; failureReason: string | null } | null) =>
  t?.status === "FAILED" && !!t.failureReason?.startsWith(DISPUTE_BLOCK_PREFIX);

// Point d'accroche unique du transfert — appelé depuis validerPrestation(),
// runAutoValidation() et la réconciliation. Ne lève jamais d'exception : un échec
// de transfert ne doit jamais bloquer le passage de la prestation à TERMINEE.
export const createTransferForPrestation = async (prestationId: string): Promise<void> => {
  try {
    const existing = await prisma.transfer.findUnique({ where: { prestationId } });
    if (existing?.status === "SUCCEEDED") return;
    if (isDisputeBlocked(existing)) return;

    const prestation = await prisma.prestation.findUnique({
      where: { id: prestationId },
      select: {
        id: true,
        status: true,
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
    if (!prestation || prestation.status !== "TERMINEE") return;

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
      // Message uniquement au premier SKIP (la réconciliation ne doit pas spammer)
      if (existing?.status !== "SKIPPED") {
        await sendSystemMessageToUser(
          prestation.prestataire.userId,
          "Le versement de votre paiement est en attente : finalisez votre configuration de paiement dans vos paramètres pour le recevoir.",
          prestationId,
        ).catch((e) => console.warn("[transfer] system message:", e?.message));
      }
      return;
    }

    const stripe = getStripe();
    const transferGroup = `prestation_${prestationId}`;

    // Garde-fou anti double versement : si un transfert existe déjà côté Stripe
    // (ex. transfert créé mais écriture BDD échouée), on le réconcilie au lieu d'en recréer un.
    const already = await stripe.transfers.list({ transfer_group: transferGroup, limit: 1 });
    const alreadyTransfer = already.data.find((t: { reversed: boolean }) => !t.reversed);
    if (alreadyTransfer) {
      await prisma.transfer.upsert({
        where: { prestationId },
        update: { status: "SUCCEEDED", stripeTransferId: alreadyTransfer.id, completedAt: new Date(), failureReason: null },
        create: {
          prestationId,
          prestataireId: prestation.prestataireId,
          amount: montantPrestataire,
          status: "SUCCEEDED",
          stripeTransferId: alreadyTransfer.id,
          completedAt: new Date(),
        },
      });
      return;
    }

    // 1re tentative : clé stable. Retentatives : clé par tranche horaire, sinon Stripe
    // renverrait pendant 24 h l'erreur mise en cache pour la clé d'origine.
    const idempotencyKey = existing
      ? `transfer_${prestationId}_r${Math.floor(Date.now() / 3600000)}`
      : `transfer_${prestationId}`;

    try {
      const transfer = await stripe.transfers.create(
        {
          amount: Math.round(montantPrestataire * 100),
          currency: "eur",
          destination: prestation.prestataire.stripeAccountId,
          transfer_group: transferGroup,
          ...(prestation.stripeChargeId && { source_transaction: prestation.stripeChargeId }),
        },
        { idempotencyKey },
      );

      await prisma.transfer.upsert({
        where: { prestationId },
        update: {
          status: "SUCCEEDED",
          stripeTransferId: transfer.id,
          completedAt: new Date(),
          failureReason: null,
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

      // Alertes uniquement au premier échec : les retentatives horaires restent silencieuses
      if (existing?.status !== "FAILED") {
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
    }
  } catch (err: any) {
    console.error("[transfer] createTransferForPrestation failed:", err);
  }
};

// Rejoue les transferts en souffrance (SEC-011) :
//  - SKIPPED dont le prestataire a désormais ses virements activés ;
//  - FAILED (hors litige) depuis moins de 72 h ;
//  - TERMINEE récentes sans aucun Transfer (process interrompu après la transition).
export const reconcilePendingTransfers = async (opts: { prestataireId?: string } = {}): Promise<number> => {
  const now = Date.now();
  const candidates = await prisma.prestation.findMany({
    where: {
      status: "TERMINEE",
      ...(opts.prestataireId && { prestataireId: opts.prestataireId }),
      OR: [
        {
          transfer: { is: { status: "SKIPPED" } },
          prestataire: { stripePayoutsEnabled: true, stripeAccountId: { not: null } },
        },
        {
          transfer: {
            is: {
              status: "FAILED",
              createdAt: { gte: new Date(now - FAILED_RETRY_WINDOW_MS) },
              OR: [
                { failureReason: null },
                { NOT: { failureReason: { startsWith: DISPUTE_BLOCK_PREFIX } } },
              ],
            },
          },
        },
        {
          transfer: { is: null },
          stripeChargeId: { not: null },
          validatedAt: {
            gte: new Date(now - MISSING_TRANSFER_MAX_AGE_MS),
            lte: new Date(now - MISSING_TRANSFER_GRACE_MS),
          },
        },
      ],
    },
    select: { id: true },
    take: 50,
  });

  for (const p of candidates) {
    await createTransferForPrestation(p.id);
  }
  return candidates.length;
};

// Litige bancaire (charge.dispute.created) : bloque le versement s'il n'a pas eu lieu,
// et alerte les admins dans tous les cas. Aucun reversal automatique : un litige peut
// être gagné, la décision de reprendre les fonds au prestataire reste humaine.
export const blockTransferForDispute = async (chargeId: string, disputeReason: string): Promise<void> => {
  const prestation = await prisma.prestation.findFirst({
    where: { stripeChargeId: chargeId },
    select: {
      id: true,
      montant: true,
      montantFinal: true,
      prestataireId: true,
      transfer: true,
      prestataire: { select: { user: { select: { firstName: true, lastName: true } } } },
      demande: { select: { reference: true, titre: true } },
    },
  });
  if (!prestation) {
    console.warn(`[dispute] aucune prestation pour la charge ${chargeId}`);
    return;
  }

  const { montantPrestataire } = splitMontant(prestation.montantFinal ?? prestation.montant);
  const alreadyPaid = prestation.transfer?.status === "SUCCEEDED";

  if (!alreadyPaid) {
    const failureReason = `${DISPUTE_BLOCK_PREFIX} litige bancaire ouvert (${disputeReason}) — versement bloqué`;
    await prisma.transfer.upsert({
      where: { prestationId: prestation.id },
      update: { status: "FAILED", failureReason },
      create: {
        prestationId: prestation.id,
        prestataireId: prestation.prestataireId,
        amount: montantPrestataire,
        status: "FAILED",
        failureReason,
      },
    });
  }

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true } });
  notifyTransferFailed(
    admins.map((a) => a.email),
    prestation.demande.reference,
    prestation.demande.titre,
    `${prestation.prestataire.user.firstName} ${prestation.prestataire.user.lastName}`,
    montantPrestataire,
    alreadyPaid
      ? `LITIGE BANCAIRE (${disputeReason}) — le prestataire a DÉJÀ été payé : décider d'un éventuel reversal dans Stripe`
      : `LITIGE BANCAIRE (${disputeReason}) — versement au prestataire bloqué en attendant la résolution`,
  );
};
