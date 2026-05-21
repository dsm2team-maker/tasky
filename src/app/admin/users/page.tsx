"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search],
    queryFn: () => adminService.getUsers(page, search).then((r) => r.data.data),
  });

  const suspend = useMutation({
    mutationFn: (id: string) => adminService.suspendUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const reactivate = useMutation({
    mutationFn: (id: string) => adminService.reactivateUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const roleColor: Record<string, string> = {
    CLIENT: "bg-blue-900 text-blue-300",
    PRESTATAIRE: "bg-emerald-900 text-emerald-300",
    ADMIN: "bg-red-900 text-red-300",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">👥 Utilisateurs</h1>
          <p className="text-gray-400 text-sm mt-1">{data?.total ?? 0} utilisateurs au total</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Rechercher nom, email…"
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 w-64"
          />
          <button type="submit" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl text-sm transition-colors">
            Rechercher
          </button>
        </form>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
              <th className="text-left px-4 py-3">Utilisateur</th>
              <th className="text-left px-4 py-3">Rôle</th>
              <th className="text-left px-4 py-3">Statut</th>
              <th className="text-left px-4 py-3">Inscription</th>
              <th className="text-left px-4 py-3">Activité</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">Chargement…</td></tr>
            ) : data?.users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">Aucun utilisateur trouvé</td></tr>
            ) : data?.users.map((u: any) => (
              <tr key={u.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{u.firstName} {u.lastName}</div>
                  <div className="text-xs text-gray-400">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${roleColor[u.role] ?? "bg-gray-700 text-gray-300"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.deletedAt ? (
                    <span className="text-xs text-gray-500">🗑️ Supprimé</span>
                  ) : u.isActive ? (
                    <span className="text-xs text-emerald-400">● Actif</span>
                  ) : (
                    <span className="text-xs text-red-400">● Suspendu</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {u.role === "CLIENT" && `${u.client?._count?.demandes ?? 0} demande(s)`}
                  {u.role === "PRESTATAIRE" && `${u.prestataire?._count?.prestations ?? 0} prestation(s) · ⭐ ${u.prestataire?.rating?.toFixed(1) ?? "—"}`}
                </td>
                <td className="px-4 py-3 text-right">
                  {!u.deletedAt && u.role !== "ADMIN" && (
                    u.isActive ? (
                      <button
                        onClick={() => suspend.mutate(u.id)}
                        disabled={suspend.isPending}
                        className="text-xs text-red-400 hover:text-red-300 border border-red-800 px-3 py-1 rounded-lg transition-colors"
                      >
                        Suspendre
                      </button>
                    ) : (
                      <button
                        onClick={() => reactivate.mutate(u.id)}
                        disabled={reactivate.isPending}
                        className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-800 px-3 py-1 rounded-lg transition-colors"
                      >
                        Réactiver
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: data.pages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? "bg-white text-gray-900" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
