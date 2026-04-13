import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { devisService, EnvoyerDevisPayload } from "@/services/devis.service";

const DISPONIBLES_KEY = ["demandes-disponibles"];
const DEVIS_KEY = (id: string) => ["devis", id];

export const useDemandesDisponibles = () => {
  return useQuery({
    queryKey: DISPONIBLES_KEY,
    queryFn: () =>
      devisService.getDemandesDisponibles().then((r) => r.data.data),
    staleTime: 0,
  });
};

export const useDemandeDetail = (id: string) => {
  return useQuery({
    queryKey: ["demande-detail", id],
    queryFn: () => devisService.getDemandeDetail(id).then((r) => r.data.data),
    enabled: !!id,
  });
};

export const useEnvoyerDevis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      demandeId,
      data,
    }: {
      demandeId: string;
      data: EnvoyerDevisPayload;
    }) => devisService.envoyerDevis(demandeId, data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISPONIBLES_KEY });
    },
  });
};

export const useDevisDemande = (demandeId: string) => {
  return useQuery({
    queryKey: DEVIS_KEY(demandeId),
    queryFn: () =>
      devisService.getDevisDemande(demandeId).then((r) => r.data.data),
    enabled: !!demandeId,
    staleTime: 0,
  });
};

export const useAccepterDevis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (devisId: string) =>
      devisService.accepterDevis(devisId).then((r) => r.data),
    onSuccess: (_, __, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["devis"] });
      queryClient.invalidateQueries({ queryKey: ["demandes"] });
    },
  });
};

export const useRefuserDevis = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (devisId: string) =>
      devisService.refuserDevis(devisId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devis"] });
    },
  });
};
