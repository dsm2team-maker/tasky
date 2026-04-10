"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth-store";
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
} from "@/hooks/useProfile";
import { PhoneModal, EmailModal } from "@/components/shared/OtpModals";
import HeaderClient from "@/components/headers/HeaderClient";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProfilePhotoUpload } from "@/components/shared/ProfilePhotoUpload";
import { CityInput } from "@/components/shared/CityInput";
import { colors } from "@/config/colors";
import { spacing, typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";

// ─── Schéma ───────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(50, "Maximum 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ '-]+$/, "Caractères invalides"),
  lastName: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(50, "Maximum 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ '-]+$/, "Caractères invalides"),
  city: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ClientProfilePage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Hydratation + auth
  useEffect(() => setIsHydrated(true), []);
  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push(routes.auth.login);
  }, [isHydrated, isAuthenticated, router]);

  // Params URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("email_updated") === "true") {
      setSuccessMessage("Email mis à jour. Déconnexion en cours...");
      setTimeout(() => {
        logout();
        router.push(routes.auth.login);
      }, 2000);
    }
    if (params.get("email_error") === "expired")
      setSuccessMessage("Le lien a expiré. Recommencez depuis votre profil.");
    if (params.get("email_error") === "taken")
      setSuccessMessage("Cet email est déjà utilisé.");
  }, []);

  // ── Données profil ────────────────────────────────────────────────────────────
  const { data: profile, isLoading } = useProfile();

  // ── Formulaire profil ─────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (profile)
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        city: profile.city || "",
      });
  }, [profile, reset]);

  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfile.mutate(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        city: data.city || null,
      },
      {
        onSuccess: () => {
          setSuccessMessage("Profil mis à jour !");
          setIsEditing(false);
        },
        onError: (err: any) =>
          setSuccessMessage(err.response?.data?.message || "Erreur"),
      },
    );
  };

  const onPhotoChange = (photoData: string | null) => {
    setLocalPhoto(photoData);
    if (photoData) {
      uploadAvatar.mutate(photoData, {
        onSuccess: () => setSuccessMessage("Photo mise à jour !"),
        onError: () => setSuccessMessage("Erreur lors de l'upload"),
      });
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────────────
  if (!isHydrated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.primary.border}`}
        />
      </div>
    );

  if (!isAuthenticated) return null;

  if (isLoading)
    return (
      <div className={`min-h-screen ${colors.background.gray}`}>
        <HeaderClient />
        <div className="flex items-center justify-center py-20">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.primary.border}`}
          />
        </div>
      </div>
    );

  // ─── Rendu ────────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderClient />
      <main className={`${spacing.container} py-8`}>
        {/* Bannière succès */}
        {successMessage && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${colors.success.bg} border ${colors.success.borderLight}`}
          >
            <span>✅</span>
            <p
              className={`text-sm font-medium ${colors.success.textDark} flex-1`}
            >
              {successMessage}
            </p>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* Bannière identité */}
        <div
          className={`${colors.primary.gradient} rounded-2xl p-8 mb-8 text-white`}
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 flex-shrink-0 bg-white/20">
              {localPhoto || profile?.avatar ? (
                <img
                  src={localPhoto || profile?.avatar || ""}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  👤
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {profile?.firstName} {profile?.lastName}
              </h1>
              <p className="text-pink-100 text-sm mt-1">
                {profile?.city && `📍 ${profile.city} · `}
                Membre depuis{" "}
                {new Date(profile?.createdAt || "").toLocaleDateString(
                  "fr-FR",
                  { month: "long", year: "numeric" },
                )}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-white/20">
                  {profile?.emailVerified
                    ? "✓ Email vérifié"
                    : "⚠️ Email non vérifié"}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-white/20">
                  👤 Client
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche */}
          <div className="lg:col-span-1 space-y-6">
            {/* Photo */}
            <div
              className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
            >
              <h2
                className={`${typography.h5.base} ${colors.text.primary} mb-4`}
              >
                Photo de profil
              </h2>
              <ProfilePhotoUpload
                photo={localPhoto || profile?.avatar || null}
                onPhotoChange={onPhotoChange}
                onError={(msg) => setSuccessMessage(msg)}
              />
              <p className={`mt-2 text-xs text-center ${colors.text.tertiary}`}>
                Format JPG uniquement · Max 5 Mo
              </p>
            </div>

            {/* Infos sensibles */}
            <div
              className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
            >
              <h2
                className={`${typography.h5.base} ${colors.text.primary} mb-4`}
              >
                Informations sensibles
              </h2>
              <div className="space-y-4">
                {/* Email */}
                <div
                  className={`p-4 rounded-xl ${colors.background.gray} border ${colors.border.light}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold ${colors.text.tertiary} uppercase tracking-wide`}
                    >
                      Email
                    </span>
                    <span
                      className={`text-xs font-medium ${profile?.emailVerified ? colors.success.text : colors.warning.text}`}
                    >
                      {profile?.emailVerified ? "✓ Vérifié" : "⚠️ Non vérifié"}
                    </span>
                  </div>
                  <p
                    className={`text-sm font-medium ${colors.text.primary} mb-3 break-all`}
                  >
                    {profile?.email}
                  </p>
                  <Button
                    variant="premium"
                    size="sm"
                    fullWidth
                    onClick={() => setShowEmailModal(true)}
                  >
                    Changer l'email
                  </Button>
                </div>

                {/* Téléphone */}
                <div
                  className={`p-4 rounded-xl ${colors.background.gray} border ${colors.border.light}`}
                >
                  <span
                    className={`text-xs font-semibold ${colors.text.tertiary} uppercase tracking-wide block mb-1`}
                  >
                    Téléphone
                  </span>
                  <p
                    className={`text-sm font-medium ${colors.text.primary} mb-3`}
                  >
                    {profile?.phoneMasked || "Non renseigné"}
                  </p>
                  <Button
                    variant="premium"
                    size="sm"
                    fullWidth
                    onClick={() => setShowPhoneModal(true)}
                  >
                    Changer le téléphone
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="lg:col-span-2">
            <div
              className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`${typography.h5.base} ${colors.text.primary}`}>
                  Informations personnelles
                </h2>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Modifier
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      reset();
                    }}
                  >
                    Annuler
                  </Button>
                )}
              </div>

              <form
                onSubmit={handleSubmit(onSubmitProfile)}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Prénom"
                    placeholder="Jean"
                    disabled={!isEditing}
                    error={errors.firstName?.message}
                    {...register("firstName")}
                  />
                  <Input
                    label="Nom"
                    placeholder="Dupont"
                    disabled={!isEditing}
                    error={errors.lastName?.message}
                    {...register("lastName")}
                  />
                </div>

                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <CityInput
                      label="Ville"
                      value={field.value || ""}
                      onChange={field.onChange}
                      error={errors.city?.message}
                      disabled={!isEditing}
                      placeholder="Ex: Paris ou 75001"
                    />
                  )}
                />

                {isEditing && (
                  <div className="flex items-center justify-between pt-2">
                    {isDirty && (
                      <p className={`text-xs ${colors.warning.text}`}>
                        ⚠️ Modifications non sauvegardées
                      </p>
                    )}
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={updateProfile.isPending}
                      className="ml-auto"
                    >
                      Sauvegarder
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>

      <PhoneModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
      />
      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
    </div>
  );
}
