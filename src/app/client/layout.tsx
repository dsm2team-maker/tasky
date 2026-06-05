"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    if (user?.role === "ADMIN") { router.push("/admin/dashboard"); return; }
    if (user?.role === "PRESTATAIRE") { router.push("/prestataire/dashboard"); return; }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated || !isAuthenticated || user?.role !== "CLIENT") return null;

  return <>{children}</>;
}
