import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { demandeService, CreateDemandePayload } from "@/services/demande.service";
import { queryKeys } from "@/config/query-keys";

export const useMyDemandes = () =>
  useQuery({
    queryKey: queryKeys.demandes,
    queryFn: () => demandeService.getMyDemandes().then((r) => r.data.data),
    staleTime: 0,
  });

export const useDemande = (id: string) =>
  useQuery({
    queryKey: queryKeys.demande(id),
    queryFn: () => demandeService.getDemande(id).then((r) => r.data.data),
    enabled: !!id,
  });

export const useCreateDemande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDemandePayload) =>
      demandeService.create(data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.demandes });
    },
  });
};

export const useDeleteDemande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => demandeService.delete(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.demandes });
    },
  });
};
