"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import Link from "next/link";

function KpiCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className={`bg-gray-800 rounded-2xl p-5 border ${color}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-gray-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminService.getDashboard().then((r) => r.data.data),
    refetchInterval: 30_000,
  });

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500" />
    </div>
  );

  const s = data;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">📊 Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Vue globale de la plateforme Tasky</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard icon="👥" label="Utilisateurs actifs" value={s?.totalUsers ?? 0} sub={`${s?.totalClients ?? 0} clients · ${s?.totalPrestataires ?? 0} prestataires`} color="border-blue-800" />
        <KpiCard icon="⚡" label="Prestations actives" value={s?.prestationsActives ?? 0} sub={`${s?.prestationsTerminees ?? 0} terminées`} color="border-emerald-800" />
        <KpiCard icon="💶" label="CA total" value={`${(s?.caTotal ?? 0).toFixed(0)} €`} sub={`Commission : ${(s?.commissionTotal ?? 0).toFixed(0)} €`} color="border-yellow-800" />
        <KpiCard icon="⚠️" label="Litiges ouverts" value={s?.signalentsOuverts ?? 0} sub="Signalements en attente" color={(s?.signalentsOuverts ?? 0) > 0 ? "border-red-600" : "border-gray-700"} />
      </div>

      {/* Raccourcis */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/admin/users", icon: "👥", label: "Gérer les utilisateurs" },
          { href: "/admin/prestations", icon: "🛠️", label: "Voir les prestations" },
          { href: "/admin/signalements", icon: "⚠️", label: "Traiter les signalements" },
          { href: "/admin/paiements", icon: "💳", label: "Suivi paiements" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 cursor-pointer transition-colors text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-sm text-gray-300 font-medium">{item.label}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
