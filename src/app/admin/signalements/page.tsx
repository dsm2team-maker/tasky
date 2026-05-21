"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

const statutColor: Record<string, string> = {
  EN_ATTENTE: "bg-red-900 text-red-300",
  EN_COURS: "bg-yellow-900 text-yellow-300",
  RESOLU: "bg-emerald-900 text-emerald-300",
};

export default function AdminSignalementsPage() {
  const [page, setPage] = useState(1);
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-signalements", page],
    queryFn: () => adminService.getSignalements(page).then((r) => r.data.data),
  });

  const resolve = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => adminService.resolveSignalement(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-signalements"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      setResolveId(null);
      setNote("");
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">⚠️ Signalements</h1>
          <p className="text-gray-400 text-sm mt-1">{data?.total ?? 0} signalements au total</p>
        </div>
      </div>

      {/* Modal résolution */}
      {resolveId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-white mb-1">Résoudre le signalement</h2>
            <p className="text-xs text-gray-400 mb-4">Ajoutez une note de résolution (optionnel).</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Explication de la résolution, actions prises…"
              rows={4}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setResolveId(null); setNote(""); }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-xl text-sm transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => resolve.mutate({ id: resolveId, note })}
                disabled={resolve.isPending}
                className="flex-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                {resolve.isPending ? "En cours…" : "Marquer résolu"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
              <th className="text-left px-4 py-3">Référence</th>
              <th className="text-left px-4 py-3">Demande</th>
              <th className="text-left px-4 py-3">Client</th>
              <th className="text-left px-4 py-3">Motif</th>
              <th className="text-left px-4 py-3">Statut</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-500">Chargement…</td></tr>
            ) : data?.signalements.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-500">Aucun signalement</td></tr>
            ) : data?.signalements.map((s: any) => {
              const sc = statutColor[s.statut] ?? "bg-gray-700 text-gray-400";
              return (
                <tr key={s.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-gray-300">
                      TSK-{String(s.demande?.reference ?? 0).padStart(6, "0")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white truncate max-w-[160px]">{s.demande?.titre ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">
                    {s.demande?.client?.user?.firstName} {s.demande?.client?.user?.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-300 max-w-[200px] truncate" title={s.message}>{s.message ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${sc}`}>
                      {s.statut === "EN_ATTENTE" ? "En attente" : s.statut === "EN_COURS" ? "En cours" : "Résolu"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(s.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.statut !== "RESOLU" ? (
                      <button
                        onClick={() => { setResolveId(s.id); setNote(""); }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-800 px-3 py-1 rounded-lg transition-colors"
                      >
                        Résoudre
                      </button>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && data.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: data.pages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? "bg-white text-gray-900" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
