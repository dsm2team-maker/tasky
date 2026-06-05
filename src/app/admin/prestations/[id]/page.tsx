"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import Link from "next/link";
import { useParams } from "next/navigation";

const statusLabel: Record<string, { label: string; color: string }> = {
  EN_ATTENTE_INSPECTION: { label: "Inspection", color: "bg-orange-900 text-orange-300" },
  EN_ATTENTE_PAIEMENT: { label: "Paiement", color: "bg-yellow-900 text-yellow-300" },
  EN_COURS: { label: "En cours", color: "bg-blue-900 text-blue-300" },
  A_VALIDER: { label: "À valider", color: "bg-purple-900 text-purple-300" },
  TERMINEE: { label: "Terminée", color: "bg-emerald-900 text-emerald-300" },
  ANNULEE: { label: "Annulée", color: "bg-gray-700 text-gray-400" },
};

const devisStatus: Record<string, { label: string; color: string }> = {
  ENVOYE:  { label: "Envoyé",   color: "bg-gray-700 text-gray-400" },
  ACCEPTE: { label: "Accepté",  color: "bg-emerald-900 text-emerald-300" },
  REFUSE:  { label: "Refusé",   color: "bg-red-900 text-red-300" },
  EXPIRE:  { label: "Expiré",   color: "bg-gray-700 text-gray-500" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-1.5 border-b border-gray-700/40 last:border-0">
      <span className="text-xs text-gray-400 flex-shrink-0 w-40">{label}</span>
      <span className="text-xs text-white text-right">{value}</span>
    </div>
  );
}

export default function AdminPrestationDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: p, isLoading } = useQuery({
    queryKey: ["admin-prestation", id],
    queryFn: () => adminService.getPrestationDetail(id).then((r) => r.data.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500" />
      </div>
    );
  }

  if (!p) {
    return <div className="text-center py-20 text-gray-500">Prestation introuvable.</div>;
  }

  const s = statusLabel[p.status] ?? { label: p.status, color: "bg-gray-700 text-gray-400" };
  const montant = p.montantFinal ?? p.montant;
  const commission = montant * 0.15;
  const netPrestataire = montant - commission;

  const systemMessages = (p.messages ?? []).filter((m: any) => m.isSystem);
  const userMessages = (p.messages ?? []).filter((m: any) => !m.isSystem);
  const clientUserId: string = p.demande.client.user.id;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/prestations" className="text-xs text-gray-400 hover:text-white transition-colors">
            ← Retour aux prestations
          </Link>
          <h1 className="text-2xl font-bold text-white mt-1">
            TSK-{String(p.demande.reference).padStart(6, "0")} —{" "}
            <span className="text-gray-300">{p.demande.titre}</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${s.color}`}>{s.label}</span>
            {p.autoValidateAt && p.status !== "TERMINEE" && (
              <span className="text-xs text-purple-400 bg-purple-900/40 px-2 py-1 rounded-full">
                Auto-validation {new Date(p.autoValidateAt).toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Parties */}
        <Section title="Parties">
          <Row label="Client" value={`${p.demande.client.user.firstName} ${p.demande.client.user.lastName}`} />
          <Row label="Email client" value={p.demande.client.user.email} />
          <Row label="Prestataire" value={`${p.prestataire.user.firstName} ${p.prestataire.user.lastName}`} />
          <Row label="Email prestataire" value={p.prestataire.user.email} />
          {p.prestataire.iban && (
            <Row label="IBAN prestataire" value={<span className="font-mono">{p.prestataire.iban}</span>} />
          )}
        </Section>

        {/* Finance */}
        <Section title="Finance">
          <Row label="Montant final" value={`${montant.toFixed(2)} €`} />
          <Row label="Commission Tasky (15%)" value={`${commission.toFixed(2)} €`} />
          <Row
            label="Net prestataire"
            value={<span className="text-emerald-300 font-semibold">{netPrestataire.toFixed(2)} €</span>}
          />
          <Row
            label="Paiement Stripe"
            value={
              p.stripePaymentIntentId ? (
                <span className="font-mono text-xs text-gray-300">{p.stripePaymentIntentId}</span>
              ) : (
                <span className="text-gray-500">—</span>
              )
            }
          />
        </Section>

        {/* Demande */}
        <Section title="Détail de la demande">
          <Row label="Catégorie" value={p.demande.category?.nom ?? "—"} />
          <Row label="Description" value={<span className="text-gray-300 max-w-xs text-right">{p.demande.description ?? "—"}</span>} />
<Row label="Délai" value={p.demande.delaiJours ? `${p.demande.delaiJours} jour(s)` : "—"} />
          <Row label="Créée le" value={new Date(p.demande.createdAt).toLocaleDateString("fr-FR")} />
          <Row label="Prestation créée le" value={new Date(p.createdAt).toLocaleDateString("fr-FR")} />
        </Section>

        {/* Devis */}
        <Section title="Devis proposés">
          {p.demande.devis?.length === 0 ? (
            <p className="text-xs text-gray-500">Aucun devis.</p>
          ) : (
            <div className="space-y-2">
              {p.demande.devis?.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between bg-gray-700/40 rounded-lg px-3 py-2">
                  <div>
                    <div className="text-xs font-medium text-white">
                      {d.prestataire.user.firstName} {d.prestataire.user.lastName}
                    </div>
                    <div className="text-xs text-gray-400">{(d.montant ?? 0).toFixed(2)} €</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${(devisStatus[d.status] ?? devisStatus.ENVOYE).color}`}>
                    {(devisStatus[d.status] ?? { label: d.status }).label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Etat des lieux */}
      {p.etatDesLieux && (
        <Section title="État des lieux">
          <div className="grid grid-cols-2 gap-4">
            {p.etatDesLieux.photosAvant?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Avant</p>
                <div className="flex flex-wrap gap-2">
                  {p.etatDesLieux.photosAvant.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-700 hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {p.etatDesLieux.photosApres?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Après</p>
                <div className="flex flex-wrap gap-2">
                  {p.etatDesLieux.photosApres.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-700 hover:opacity-80 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          {p.etatDesLieux.commentaire && (
            <p className="text-xs text-gray-300 mt-3 bg-gray-700/40 rounded-lg p-3">{p.etatDesLieux.commentaire}</p>
          )}
        </Section>
      )}

      {/* Review */}
      {p.review && (
        <Section title="Avis client">
          <Row label="Note" value={`${"⭐".repeat(p.review.note)} (${p.review.note}/5)`} />
          {p.review.commentaire && (
            <div className="mt-2 bg-gray-700/40 rounded-lg p-3 text-xs text-gray-300">{p.review.commentaire}</div>
          )}
        </Section>
      )}

      {/* Messages Tasky-Infos */}
      {systemMessages.length > 0 && (
        <Section title="Messages Tasky-Infos">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {systemMessages.map((m: any) => (
              <div key={m.id} className="bg-yellow-900/20 border border-yellow-800/40 rounded-lg p-3">
                <p className="text-xs text-yellow-200 whitespace-pre-wrap">{m.contenu}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(m.createdAt).toLocaleString("fr-FR")}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Conversation */}
      {userMessages.length > 0 && (
        <Section title={`Conversation (${userMessages.length} messages)`}>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {userMessages.map((m: any) => (
              <div key={m.id} className="flex gap-2 items-start">
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${m.auteurId === clientUserId ? "bg-blue-700" : "bg-emerald-700"}`}>
                  {m.auteurId === clientUserId ? "C" : "P"}
                </div>
                <div>
                  <p className="text-xs text-gray-300">{m.contenu}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{new Date(m.createdAt).toLocaleString("fr-FR")}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
