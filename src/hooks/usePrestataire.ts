import { useQuery } from "@tanstack/react-query";
import { prestataireService } from "@/services/prestataire.service";

export const usePublicPrestataire = (id: string) => {
  return useQuery({
    queryKey: ["prestataire", id],
    queryFn: () => prestataireService.getProfil(id).then((r) => r.data.data),
    enabled: !!id,
    staleTime: 60_000,
  });
};

export const useListPrestataires = (filters?: { city?: string; categoryId?: string; disponibilite?: string; nom?: string }) => {
  return useQuery({
    queryKey: ["prestataires", filters],
    queryFn: () => prestataireService.list(filters).then((r) => r.data.data),
    staleTime: 60_000,
  });
};
