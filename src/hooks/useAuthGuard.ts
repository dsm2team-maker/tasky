/**
 * 🔐 TASKY — Hook useAuthGuard
 * Protège les pages authentifiées :
 * - Redirige vers /auth/login si non connecté
 * - Redirige vers /auth/verify-email si email non vérifié
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { routes } from "@/config/routes";

interface UseAuthGuardOptions {
  requireEmailVerified?: boolean; // défaut: true
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { requireEmailVerified = true } = options;
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // Pas connecté → login
    if (!isAuthenticated) {
      router.push(routes.auth.login);
      return;
    }

    // Connecté mais email non vérifié → verify-email
    if (requireEmailVerified && user && !user.emailVerified) {
      router.push(routes.auth.verifyEmail);
      return;
    }
  }, [isHydrated, isAuthenticated, user, requireEmailVerified, router]);

  return {
    isHydrated,
    isAuthenticated,
    user,
    isReady:
      isHydrated &&
      isAuthenticated &&
      (!requireEmailVerified || !!user?.emailVerified),
  };
};
