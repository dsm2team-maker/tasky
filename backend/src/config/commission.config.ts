export const PRESTATAIRE_SHARE_RATE = 0.85;
export const PLATFORM_COMMISSION_RATE = 0.15;

// Calcul en centimes : la commission est le reste, pour que part prestataire + commission
// = montant payé exactement (arrondir les deux parts séparément créait un écart d'1 centime).
export const splitMontant = (montant: number) => {
  const totalCentimes = Math.round(montant * 100);
  const prestataireCentimes = Math.round(totalCentimes * PRESTATAIRE_SHARE_RATE);
  return {
    montantPrestataire: prestataireCentimes / 100,
    commissionTasky: (totalCentimes - prestataireCentimes) / 100,
  };
};
