import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Classes roses (primary)
    // Roses
    "bg-pink-500",
    "bg-pink-600",
    "bg-pink-700",
    "from-pink-500",
    "from-pink-600",
    "from-pink-700",
    "via-pink-500",
    "via-pink-600", // ← AJOUTE ÇA
    "via-pink-700", // ← ET ÇA aussi au cas où
    "to-pink-600",
    "to-pink-700",
    "to-pink-800",
    "hover:from-pink-600",
    "hover:from-pink-700",
    "hover:to-pink-700",
    "hover:to-pink-800",
    "text-pink-600",

    // Classes vertes (secondary)
    "bg-emerald-500",
    "bg-emerald-600",
    "bg-emerald-700",
    "bg-emerald-600",
    "from-emerald-500",
    "from-emerald-600",
    "to-emerald-500",
    "to-emerald-600",
    "via-emerald-500",
    "via-emerald-600", // ← AJOUTE ÇA
    "via-emerald-700", // ← ET ÇA aussi au cas où
    "to-teal-600",
    "to-teal-700",
    "hover:from-emerald-600",
    "hover:to-teal-700",

    // Classes purple/indigo (premium)
    "bg-purple-600",
    "bg-purple-50",
    "bg-indigo-500",
    "from-indigo-500",
    "from-indigo-600",
    "to-purple-600",
    "to-purple-700",
    "hover:from-indigo-600",
    "hover:to-purple-700",
    "text-purple-600",
    "text-purple-500",
    "text-purple-700",
    "border-purple-600",
    "border-purple-200",
    "text-purple-600",
    "hover:text-purple-600",

    // Utiles partout
    "text-white",
    "bg-white",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      animation: {
        spin: "spin 1s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
