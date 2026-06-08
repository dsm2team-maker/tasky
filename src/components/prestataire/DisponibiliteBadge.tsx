"use client";

const CONFIG = {
  ACTIF:  { icon: "🟢", label: "Disponible", bg: "bg-green-100",  text: "text-green-700",  border: "border-green-300" },
  OCCUPE: { icon: "🟡", label: "Occupé",     bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
  ABSENT: { icon: "🔴", label: "Absent",     bg: "bg-red-100",    text: "text-red-700",    border: "border-red-300" },
} as const;

export const DisponibiliteBadge: React.FC<{ disponibilite: keyof typeof CONFIG }> = ({ disponibilite }) => {
  const c = CONFIG[disponibilite];
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${c.bg} ${c.text} border ${c.border}`}>
      {c.icon} {c.label}
    </span>
  );
};
