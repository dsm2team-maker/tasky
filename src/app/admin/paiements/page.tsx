"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";

const statusColor: Record<string, string> = {
  EN_COURS: "bg-blue-900 text-blue-300",
  A_VALIDER: "bg-purple-900 text-purple-300",
  TERMINEE: "bg-emerald-900 text-emerald-300",
  ANNULEE: "bg-gray-700 text-gray-400",
};

const statusLabel: Record<string, string> = {
  EN_COURS: "En cours",
  A_VALIDER: "À valider",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
};

export default function AdminPaiementsPage() {
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-paiements", page],
    queryFn: () => adminService.getPaiements(page).then((r) => r.data.data),
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const totalMontant = data?.paiements.reduce((s: number, p: any) => s + (p.montantFinal ?? p.montant), 0) ?? 0;
  const totalCommission = totalMontant * 0.15;
  const totalNet = totalMontant - totalCommission;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">💳 Paiements</h1>
          <p className="text-gray-400 text-sm mt-1">{data?.total ?? 0} paiements enregistrés</p>
        </div>
      </div>

      {/* Résumé financier de la page */}
      {data && data.paiements.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-white">{totalMontant.toFixed(0)} €</div>
            <div className="text-xs text-gray-400 mt-1">Volume brut (page)</div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-yellow-800 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-300">{totalCommission.toFixed(0)} €</div>
            <div className="text-xs text-gray-400 mt-1">Commission Tasky 15%</div>
          </div>
          <div className="bg-gray-800 rounded-xl border border-emerald-800 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-300">{totalNet.toFixed(0)} €</div>
            <div className="text-xs text-gray-400 mt-1">Net à reverser prestataires</div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
              <th className="text-left px-4 py-3">Référence</th>
              <th className="text-left px-4 py-3">Client</th>
              <th className="text-left px-4 py-3">Prestataire</th>
              <th className="text-left px-4 py-3">IBAN</th>
              <th className="text-left px-4 py-3">Montant</th>
              <th className="text-left px-4 py-3">Commission</th>
              <th className="text-left px-4 py-3">Net presta</th>
              <th className="text-left px-4 py-3">Statut</th>
              <th className="text-left px-4 py-3">Stripe PI</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="text-center py-12 text-gray-500">Chargement…</td></tr>
            ) : data?.paiements.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12 text-gray-500">Aucun paiement</td></tr>
            ) : data?.paiements.map((p: any) => {
              const montant = p.montantFinal ?? p.montant;
              const commission = montant * 0.15;
              const net = montant - commission;
              const sc = statusColor[p.status] ?? "bg-gray-700 text-gray-400";
              const piId: string = p.stripePaymentIntentId ?? "";
              const piShort = piId.length > 18 ? piId.slice(0, 8) + "…" + piId.slice(-6) : piId;

              return (
                <tr key={p.id} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-gray-300">
                      TSK-{String(p.demande.reference).padStart(6, "0")}
                    </span>
                    <div className="text-xs text-gray-500 truncate max-w-[120px]">{p.demande.titre}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300">
                    <div>{p.demande.client.user.firstName} {p.demande.client.user.lastName}</div>
                    <div className="text-gray-500">{p.demande.client.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300">
                    <div>{p.prestataire.user.firstName} {p.prestataire.user.lastName}</div>
                    <div className="text-gray-500">{p.prestataire.user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {p.prestataire.iban ? (
                      <button
                        onClick={() => copyToClipboard(p.prestataire.iban, p.id)}
                        className="text-xs font-mono text-gray-300 hover:text-white transition-colors group flex items-center gap-1"
                        title={p.prestataire.iban}
                      >
                        <span>{p.prestataire.iban.slice(0, 10)}…</span>
                        <span className="text-gray-500 group-hover:text-gray-300 text-xs">
                          {copiedId === p.id ? "✓" : "⎘"}
                        </span>
                      </button>
                    ) : (
                      <span className="text-xs text-red-400">Non renseigné</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white text-xs font-semibold">{montant.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-yellow-300 text-xs">{commission.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-emerald-300 text-xs font-semibold">{net.toFixed(2)} €</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${sc}`}>
                      {statusLabel[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {piId ? (
                      <button
                        onClick={() => copyToClipboard(piId, piId)}
                        className="text-xs font-mono text-gray-400 hover:text-white transition-colors"
                        title={piId}
                      >
                        {piShort}
                        <span className="ml-1 text-gray-600">{copiedId === piId ? "✓" : "⎘"}</span>
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
