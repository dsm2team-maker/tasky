import { apiClient } from "@/lib/api-client";

export const adminService = {
  getDashboard: () => apiClient.get("/api/admin/dashboard"),
  getUsers: (page = 1, filters: { nom?: string; prenom?: string; email?: string } = {}) => {
    const params = new URLSearchParams({ page: String(page) });
    if (filters.nom) params.set("nom", filters.nom);
    if (filters.prenom) params.set("prenom", filters.prenom);
    if (filters.email) params.set("email", filters.email);
    return apiClient.get(`/api/admin/users?${params.toString()}`);
  },
  suspendUser: (id: string) => apiClient.patch(`/api/admin/users/${id}/suspend`, {}),
  reactivateUser: (id: string) => apiClient.patch(`/api/admin/users/${id}/reactivate`, {}),
  getPrestations: (
    page = 1,
    status = "",
    filters: { reference?: string; client?: string; prestataire?: string } = {},
  ) => {
    const params = new URLSearchParams({ page: String(page), status });
    if (filters.reference) params.set("reference", filters.reference);
    if (filters.client) params.set("client", filters.client);
    if (filters.prestataire) params.set("prestataire", filters.prestataire);
    return apiClient.get(`/api/admin/prestations?${params.toString()}`);
  },
  getPrestationDetail: (id: string) => apiClient.get(`/api/admin/prestations/${id}`),
  getSignalements: (page = 1) => apiClient.get(`/api/admin/signalements?page=${page}`),
  resolveSignalement: (id: string, note: string) =>
    apiClient.patch(`/api/admin/signalements/${id}/resolve`, { note }),
  getPaiements: (page = 1) => apiClient.get(`/api/admin/paiements?page=${page}`),
  runAutoValidate: () => apiClient.post("/api/admin/jobs/auto-validate", {}),
};
