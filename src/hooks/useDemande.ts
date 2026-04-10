import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  demandeService,
  CreateDemandePayload,
} from "@/services/demande.service";

const DEMANDES_QUERY_KEY = ["demandes"];

export const useMyDemandes = () => {
  return useQuery({
    queryKey: DEMANDES_QUERY_KEY,
    queryFn: () => demandeService.getMyDemandes().then((r) => r.data.data),
    staleTime: 0,
  });
};

export const useDemande = (id: string) => {
  return useQuery({
    queryKey: [...DEMANDES_QUERY_KEY, id],
    queryFn: () => demandeService.getDemande(id).then((r) => r.data.data),
    enabled: !!id,
  });
};

export const useCreateDemande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDemandePayload) =>
      demandeService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEMANDES_QUERY_KEY });
    },
  });
};

export const useDeleteDemande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => demandeService.delete(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEMANDES_QUERY_KEY });
    },
  });
};
