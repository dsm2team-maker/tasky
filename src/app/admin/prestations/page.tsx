"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import Link from "next/link";

const statusLabel: Record<string, { label: string; color: string }> = {
  EN_ATTENTE_INSPECTION: { label: "Inspection", color: "bg-orange-900 text-orange-300" },
  EN_ATTENTE_PAIEMENT: { label: "Paiement", color: "bg-yellow-900 text-yellow-300" },
  EN_COURS: { label: "En cours", color: "bg-blue-900 text-blue-300" },
  A_VALIDER: { label: "À valider", color: "bg-purple-900 text-purple-300" },
  TERMINEE: { label: "Terminée", color: "bg-emerald-900 text-emerald-300" },
  ANNULEE: { label: "Annulée", color: "bg-gray-700 text-gray-400" },
};

export default function AdminPrestationsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-prestations", page, status],
    queryFn: () => adminService.getPrestations(page, status).then((r) => r.data.data),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🛠️ Prestations</h1>
          <p className="text-gray-400 text-sm mt-1">{data?.total ?? 0} prestations au total</p>
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
        >
          <option value="">Tous les statuts</option>
          <option value="EN_ATTENTE_INSPECTION">Inspection</option>
          <option value="EN_ATTENTE_PAIEMENT">Paiement</option>
          <option value="EN_COURS">En cours</option>
          <option value="A_VALIDER">À valider</option>
          <option value="TERMINEE">Terminées</option>
          <option value="ANNULEE">Annulées</option>
        </select>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
              <th className="text-left px-4 py-3">Référence</th>
              <th className="text-left px-4 py-3">Prestation</th>
              <th className="text-left px-4 py-3">Client</th>
              <th className="text-left px-4 py-3">Prestataire</th>
              <th className="text-left px-4 py-3">Statut</th>
              <th className="text-left px-4 py-3">Montant</th>
              <th className="text-right px-4 py-3">Détail</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-500">Chargement…</td></tr>
            ) : data?.prestations.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-500">Aucune prestation</td></tr>
            ) : data?.prestations.map((p: any) => {
              const s = statusLabel[p.status] ?? { label: p.status, color: "bg-gray-700 text-gray-400" };
              return (
                <tr key={p.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-gray-300">
                      TSK-{String(p.demande.reference).padStart(6, "0")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white truncate max-w-[180px]">{p.demande.titre}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">
                    {p.demande.client.user.firstName} {p.demande.client.user.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">
                    {p.prestataire.user.firstName} {p.prestataire.user.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${s.color}`}>{s.label}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-xs">
                    {(p.montantFinal ?? p.montant).toFixed(2)} €
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/prestations/${p.id}`}>
                      <span className="text-xs text-blue-400 hover:text-blue-300 border border-blue-800 px-3 py-1 rounded-lg transition-colors cursor-pointer">
                        Voir →
                      </span>
                    </Link>
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
