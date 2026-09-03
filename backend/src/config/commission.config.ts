export const PRESTATAIRE_SHARE_RATE = 0.85;
export const PLATFORM_COMMISSION_RATE = 0.15;

export const splitMontant = (montant: number) => ({
  montantPrestataire: Math.round(montant * PRESTATAIRE_SHARE_RATE * 100) / 100,
  commissionTasky: Math.round(montant * PLATFORM_COMMISSION_RATE * 100) / 100,
});
