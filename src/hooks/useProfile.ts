/**
 * 🪝 TASKY — Hook useProfile
 * Gestion du profil utilisateur avec TanStack Query
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  userService,
  UpdateProfilePayload,
  UpdatePrestatairePayload,
  CompetenceInput,
} from "@/services/user.service";
import { useAuthStore } from "@/stores/auth-store";
import axios from "axios";

// ─── Clés de cache ────────────────────────────────────────────────────────────
export const PROFILE_QUERY_KEY = ["profile"];
export const COMPETENCES_QUERY_KEY = ["prestataire", "competences"];
export const STATS_QUERY_KEY = ["prestataire", "stats"];

// ─── Hook principal ───────────────────────────────────────────────────────────
export const useProfile = () => {
  const logout = useAuthStore((state) => state.logout);

  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      try {
        const r = await userService.getProfile();
        return r.data.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          logout();
          throw error;
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404)
        return false;
      return failureCount < 3;
    },
  });
};

// ─── Mutation mise à jour profil commun ──────────────────────────────────────
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) =>
      userService.updateProfile(data).then((r) => r.data.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      updateUser({
        firstName: data.firstName,
        lastName: data.lastName,
        city: data.city,
      });
    },
  });
};

// ─── Mutation upload avatar ───────────────────────────────────────────────────
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (imageData: string) =>
      userService.uploadAvatar(imageData).then((r) => r.data.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      updateUser({ avatar: data.avatarUrl });
    },
  });
};

// ─── Mutation changement téléphone ───────────────────────────────────────────
export const useRequestPhoneChange = () => {
  return useMutation({
    mutationFn: (newPhone: string) =>
      userService.requestPhoneChange(newPhone).then((r) => r.data),
  });
};

export const useVerifyPhoneOtp = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (otp: string) =>
      userService.verifyPhoneOtp(otp).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
};

// ─── Mutation changement email ────────────────────────────────────────────────
export const useRequestEmailChange = () => {
  return useMutation({
    mutationFn: (newEmail: string) =>
      userService.requestEmailChange(newEmail).then((r) => r.data),
  });
};

export const useVerifyEmailOtp = () => {
  return useMutation({
    mutationFn: (otp: string) =>
      userService.verifyEmailOtp(otp).then((r) => r.data),
  });
};

// ─── Mutation mise à jour profil prestataire ─────────────────────────────────
export const useUpdatePrestataireProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePrestatairePayload) =>
      userService.updatePrestataireProfile(data).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
};

// ─── Query compétences prestataire ───────────────────────────────────────────
export const usePrestataireCompetences = () => {
  return useQuery({
    queryKey: COMPETENCES_QUERY_KEY,
    queryFn: () =>
      userService.getPrestataireCompetences().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });
};

// ─── Mutation mise à jour compétences ────────────────────────────────────────
export const useUpdatePrestataireCompetences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (competences: CompetenceInput[]) =>
      userService
        .updatePrestataireCompetences(competences)
        .then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COMPETENCES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
};

// ─── Query stats prestataire ─────────────────────────────────────────────────
export const usePrestataireStats = () => {
  return useQuery({
    queryKey: STATS_QUERY_KEY,
    queryFn: () => userService.getPrestataireStats().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });
};
