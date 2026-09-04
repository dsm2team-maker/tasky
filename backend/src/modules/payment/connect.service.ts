import { prisma } from "../../lib/prisma";
import { getStripe } from "../../config/stripe.config";

const getPrestataireByUserId = async (userId: string) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { userId },
    select: { id: true, stripeAccountId: true, user: { select: { email: true } } },
  });
  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");
  return prestataire;
};

// Crée le compte Connect s'il n'existe pas déjà (idempotent)
export const getOrCreateConnectAccount = async (userId: string): Promise<string> => {
  const prestataire = await getPrestataireByUserId(userId);
  if (prestataire.stripeAccountId) return prestataire.stripeAccountId;

  const stripe = getStripe();
  const account = await stripe.accounts.create({
    country: "FR",
    email: prestataire.user.email,
    controller: {
      fees: { payer: "application" },
      losses: { payments: "stripe" },
      stripe_dashboard: { type: "none" },
    },
  });

  await prisma.prestataire.update({
    where: { id: prestataire.id },
    data: { stripeAccountId: account.id, stripeOnboardingStatus: "IN_PROGRESS" },
  });

  return account.id;
};

// Session courte durée pour monter le composant d'onboarding embarqué — à refetch à chaque montage
export const createAccountSession = async (userId: string): Promise<string> => {
  const accountId = await getOrCreateConnectAccount(userId);

  const stripe = getStripe();
  const accountSession = await stripe.accountSessions.create({
    account: accountId,
    components: {
      account_onboarding: { enabled: true },
    },
  });

  return accountSession.client_secret;
};

// Lecture pure en base — tenue à jour par le webhook Connect (account.updated)
export const getConnectStatus = async (userId: string) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { userId },
    select: {
      stripeAccountId: true,
      stripeOnboardingStatus: true,
      stripeChargesEnabled: true,
      stripePayoutsEnabled: true,
      stripeDetailsSubmitted: true,
    },
  });
  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");
  return prestataire;
};

// Appelé par le webhook Connect sur account.updated
export const syncConnectAccountStatus = async (account: {
  id: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
}) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { stripeAccountId: account.id },
    select: { id: true, stripeOnboardingStatus: true },
  });
  if (!prestataire) return;

  const status =
    account.payouts_enabled && account.details_submitted
      ? "COMPLETE"
      : account.details_submitted
        ? "RESTRICTED"
        : "IN_PROGRESS";

  await prisma.prestataire.update({
    where: { id: prestataire.id },
    data: {
      stripeChargesEnabled: account.charges_enabled,
      stripePayoutsEnabled: account.payouts_enabled,
      stripeDetailsSubmitted: account.details_submitted,
      stripeOnboardingStatus: status,
    },
  });
};
