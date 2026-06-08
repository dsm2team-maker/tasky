import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { devisService, EnvoyerDevisPayload } from "@/services/devis.service";
import { queryKeys } from "@/config/query-keys";

export const useMesDevisRefuses = () =>
  useQuery({
    queryKey: queryKeys.devisRefuses,
    queryFn: () => devisService.getMesDevisRefuses().then((r) => r.data.data),
    staleTime: 30_000,
  });

export const useDismisserDevis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (devisId: string) => devisService.dismisserDevis(devisId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devisRefuses });
    },
  });
};

export const useMesStatsDevis = () =>
  useQuery({
    queryKey: queryKeys.devisStats,
    queryFn: () => devisService.getMesStats().then((r) => r.data.data),
    staleTime: 60_000,
  });

export const useDemandesDisponibles = () =>
  useQuery({
    queryKey: queryKeys.devisDisponibles,
    queryFn: () => devisService.getDemandesDisponibles().then((r) => r.data.data),
    staleTime: 0,
  });

export const useDemandeDetail = (id: string) =>
  useQuery({
    queryKey: queryKeys.demandeDetail(id),
    queryFn: () => devisService.getDemandeDetail(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useEnvoyerDevis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ demandeId, data }: { demandeId: string; data: EnvoyerDevisPayload }) =>
      devisService.envoyerDevis(demandeId, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.devisDisponibles });
    },
  });
};

export const useDevisDemande = (demandeId: string) =>
  useQuery({
    queryKey: queryKeys.devis(demandeId),
    queryFn: () => devisService.getDevisDemande(demandeId).then((r) => r.data.data),
    enabled: !!demandeId,
    staleTime: 0,
  });

export const useAccepterDevis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (devisId: string) => devisService.accepterDevis(devisId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.demandes });
      queryClient.invalidateQueries({ queryKey: queryKeys.prestationsClient });
    },
  });
};

export const useRefuserDevis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (devisId: string) => devisService.refuserDevis(devisId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.demandes });
    },
  });
};
