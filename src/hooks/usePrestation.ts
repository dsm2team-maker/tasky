import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  prestationService,
  CreerEtatDesLieuxPayload,
} from "@/services/prestation.service";

const PRESTATIONS_KEY = ["prestations"];
const PRESTATIONS_CLIENT_KEY = ["prestations-client"];

// ─── Prestataire ──────────────────────────────────────────────────────────────

export const useMesPrestations = () => {
  return useQuery({
    queryKey: PRESTATIONS_KEY,
    queryFn: () =>
      prestationService.getMesPrestations().then((r) => r.data.data),
    staleTime: 0,
  });
};

export const usePrestationDetail = (id: string) => {
  return useQuery({
    queryKey: [...PRESTATIONS_KEY, id],
    queryFn: () =>
      prestationService.getPrestationDetail(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 0,
  });
};

export const useCreerEtatDesLieux = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: CreerEtatDesLieuxPayload;
    }) =>
      prestationService.creerEtatDesLieux(id, data).then((r) => r.data.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRESTATIONS_KEY }),
  });
};

export const useMarquerTermine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      prestationService.marquerTermine(id).then((r) => r.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRESTATIONS_KEY }),
  });
};

// ─── Client ───────────────────────────────────────────────────────────────────

export const useMesPrestationsClient = () => {
  return useQuery({
    queryKey: PRESTATIONS_CLIENT_KEY,
    queryFn: () =>
      prestationService.getMesPrestationsClient().then((r) => r.data.data),
    staleTime: 0,
  });
};

export const useValiderPrestation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      prestationService.validerPrestation(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRESTATIONS_CLIENT_KEY });
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
    },
  });
};

export const useContesterPrestation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      prestationService.contesterPrestation(id).then((r) => r.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRESTATIONS_CLIENT_KEY }),
  });
};

export const useValiderEtatDesLieux = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accepte }: { id: string; accepte: boolean }) =>
      prestationService.validerEtatDesLieux(id, accepte).then((r) => r.data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRESTATIONS_CLIENT_KEY }),
  });
};
