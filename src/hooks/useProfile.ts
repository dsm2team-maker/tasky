/**
 * 🪝 TASKY — Hook useProfile
 * Gestion du profil utilisateur avec TanStack Query
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, UpdateProfilePayload } from "@/services/user.service";
import { useAuthStore } from "@/stores/auth-store";

// ─── Clés de cache ────────────────────────────────────────────────────────────
export const PROFILE_QUERY_KEY = ["profile"];

// ─── Hook principal ───────────────────────────────────────────────────────────
export const useProfile = () => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => userService.getProfile().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000, // 5 min
  });
};

// ─── Mutation mise à jour profil ──────────────────────────────────────────────
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) =>
      userService.updateProfile(data).then((r) => r.data.data),
    onSuccess: (data) => {
      // Mettre à jour le cache TanStack Query
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      // Mettre à jour le store Zustand pour le header
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
