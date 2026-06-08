"use client";

import { colors } from "@/config/colors";

interface Props {
  emailVerified: boolean;
  hasBio: boolean;
  hasCompetences: boolean;
  hasPointDepot: boolean;
  hasIban: boolean;
  onActionBio: () => void;
  onActionCompetences: () => void;
  onActionPointDepot: () => void;
  onActionIban: () => void;
}

export const ProfileProgress: React.FC<Props> = ({
  emailVerified, hasBio, hasCompetences, hasPointDepot, hasIban,
  onActionBio, onActionCompetences, onActionPointDepot, onActionIban,
}) => {
  const steps = [
    { label: "Email vérifié",        done: emailVerified,   icon: "✉️", action: null },
    { label: "Bio complétée",         done: hasBio,          icon: "✍️", action: onActionBio },
    { label: "Compétences ajoutées",  done: hasCompetences,  icon: "🛠️", action: onActionCompetences },
    { label: "Point de dépôt défini", done: hasPointDepot,   icon: "📍", action: onActionPointDepot },
    { label: "IBAN renseigné",        done: hasIban,         icon: "🏦", action: onActionIban },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  if (doneCount === 5) return null;

  return (
    <div className="mb-6 p-5 rounded-2xl border-2 border-amber-300 bg-amber-50">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-amber-800">⚠️ Activez votre profil — {doneCount}/5</h3>
          <p className="text-sm text-amber-700 mt-0.5">Vous ne recevrez pas de demandes tant que votre profil n'est pas complet</p>
        </div>
        <span className={`text-2xl font-bold ${doneCount === 5 ? "text-green-600" : "text-amber-700"}`}>{doneCount}/5</span>
      </div>
      <div className="flex gap-1 mb-4">
        {steps.map((step, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full transition-all ${step.done ? "bg-emerald-500" : "bg-amber-200"}`} />
        ))}
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className={`text-sm font-medium ${step.done ? "text-emerald-700 font-semibold" : "text-amber-800"}`}>
              {step.done ? "✅" : "⬜"} {step.icon} {i + 1}. {step.label}
            </span>
            {!step.done && step.action && (
              <button onClick={step.action} className={`text-xs font-semibold ${colors.secondary.text} hover:underline`}>
                Compléter →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
