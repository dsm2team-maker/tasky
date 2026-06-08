import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { prestationService, CreerEtatDesLieuxPayload } from "@/services/prestation.service";
import { queryKeys } from "@/config/query-keys";

// ─── Prestataire ──────────────────────────────────────────────────────────────

export const useMesPrestations = () =>
  useQuery({
    queryKey: queryKeys.prestations,
    queryFn: () => prestationService.getMesPrestations().then((r) => r.data.data),
    staleTime: 0,
  });

export const usePrestationDetail = (id: string) =>
  useQuery({
    queryKey: queryKeys.prestation(id),
    queryFn: () => prestationService.getPrestationDetail(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 0,
  });

export const useCreerEtatDesLieux = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreerEtatDesLieuxPayload }) =>
      prestationService.creerEtatDesLieux(id, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prestations });
    },
  });
};

export const useMarquerTermine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => prestationService.marquerTermine(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prestations });
    },
  });
};

export const useConfirmerConformite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => prestationService.confirmerConformite(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prestations });
    },
  });
};

export const usePasserEnCours = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => prestationService.passerEnCours(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prestationsClient });
      queryClient.invalidateQueries({ queryKey: queryKeys.demandes });
    },
  });
};

// ─── Client ───────────────────────────────────────────────────────────────────

export const useMesPrestationsClient = () =>
  useQuery({
    queryKey: queryKeys.prestationsClient,
    queryFn: () => prestationService.getMesPrestationsClient().then((r) => r.data.data),
    staleTime: 0,
  });

export const useValiderPrestation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => prestationService.validerPrestation(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prestationsClient });
      queryClient.invalidateQueries({ queryKey: queryKeys.demandes });
    },
  });
};

export const useContesterPrestation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motif }: { id: string; motif: string }) =>
      prestationService.contesterPrestation(id, motif).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prestationsClient });
    },
  });
};

export const useValiderEtatDesLieux = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accepte }: { id: string; accepte: boolean }) =>
      prestationService.validerEtatDesLieux(id, accepte).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prestationsClient });
      queryClient.invalidateQueries({ queryKey: queryKeys.demandes });
    },
  });
};

export const useCreerReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { rating: number; comment?: string } }) =>
      prestationService.creerReview(id, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prestationsClient });
    },
  });
};
