import { apiClient } from "@/lib/api-client";

export const adminService = {
  getDashboard: () => apiClient.get("/api/admin/dashboard"),
  getUsers: (page = 1, search = "") =>
    apiClient.get(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`),
  suspendUser: (id: string) => apiClient.patch(`/api/admin/users/${id}/suspend`, {}),
  reactivateUser: (id: string) => apiClient.patch(`/api/admin/users/${id}/reactivate`, {}),
  getPrestations: (page = 1, status = "") =>
    apiClient.get(`/api/admin/prestations?page=${page}&status=${status}`),
  getPrestationDetail: (id: string) => apiClient.get(`/api/admin/prestations/${id}`),
  getSignalements: (page = 1) => apiClient.get(`/api/admin/signalements?page=${page}`),
  resolveSignalement: (id: string, note: string) =>
    apiClient.patch(`/api/admin/signalements/${id}/resolve`, { note }),
  getPaiements: (page = 1) => apiClient.get(`/api/admin/paiements?page=${page}`),
};
