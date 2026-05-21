"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "📊 Dashboard" },
  { href: "/admin/users", label: "👥 Utilisateurs" },
  { href: "/admin/prestations", label: "🛠️ Prestations" },
  { href: "/admin/signalements", label: "⚠️ Signalements" },
  { href: "/admin/paiements", label: "💳 Paiements" },
];

export default function AdminHeader() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 h-14">
        <span className="font-bold text-lg tracking-tight text-white flex-shrink-0">
          🔒 Tasky <span className="text-red-400">Admin</span>
        </span>

        <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-white/20 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-white transition-colors flex-shrink-0"
        >
          Déconnexion →
        </button>
      </div>
    </header>
  );
}
