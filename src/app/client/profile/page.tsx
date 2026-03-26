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
  useRequestPhoneChange,
  useVerifyPhoneOtp,
  useRequestEmailChange,
  useVerifyEmailOtp,
} from "@/hooks/useProfile";
import { usePhoneInput } from "@/hooks/usePhoneInput";
import { phoneSchema } from "@/lib/schemas";
import HeaderClient from "@/components/headers/HeaderClient";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/ui/Modal";
import { ProfilePhotoUpload } from "@/components/shared/ProfilePhotoUpload";
import { CityInput } from "@/components/shared/CityInput";
import { colors } from "@/config/colors";
import { spacing, typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";

// ─── Schemas ──────────────────────────────────────────────────────────────────

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

const newPhoneSchema = z.object({ newPhone: phoneSchema });
const newEmailSchema = z.object({
  newEmail: z.string().email("Format d'email invalide").toLowerCase(),
});
const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "6 chiffres requis")
    .regex(/^\d{6}$/, "Chiffres uniquement"),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type NewPhoneFormData = z.infer<typeof newPhoneSchema>;
type NewEmailFormData = z.infer<typeof newEmailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

// ─── Utilitaires ──────────────────────────────────────────────────────────────

const maskEmail = (email: string): string => {
  const [local, domain] = email.split("@");
  if (!domain || local.length <= 2) return email;
  return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
};

// ─── Timer ────────────────────────────────────────────────────────────────────

const OtpTimer: React.FC<{ seconds: number; onExpire: () => void }> = ({
  seconds,
  onExpire,
}) => {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <span
      className={`font-mono font-semibold ${remaining < 60 ? colors.error.text : colors.text.secondary}`}
    >
      {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ClientProfilePage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);

  // États modals
  const [phoneStep, setPhoneStep] = useState<
    null | "request" | "otp" | "success"
  >(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [newPhoneValue, setNewPhoneValue] = useState("");
  const [phoneOtpExpired, setPhoneOtpExpired] = useState(false);
  const [phoneCooldown, setPhoneCooldown] = useState(0);

  const [emailStep, setEmailStep] = useState<
    null | "request" | "otp" | "success"
  >(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [newEmailValue, setNewEmailValue] = useState("");
  const [emailOtpExpired, setEmailOtpExpired] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);

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

  // Cooldowns
  useEffect(() => {
    if (phoneCooldown <= 0) return;
    const t = setTimeout(() => setPhoneCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phoneCooldown]);

  useEffect(() => {
    if (emailCooldown <= 0) return;
    const t = setTimeout(() => setEmailCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [emailCooldown]);

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

  // ── Téléphone ─────────────────────────────────────────────────────────────────
  const phoneForm = useForm<NewPhoneFormData>({
    resolver: zodResolver(newPhoneSchema),
  });
  const phoneOtpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });
  const requestPhoneChange = useRequestPhoneChange();
  const verifyPhoneOtpMutation = useVerifyPhoneOtp();
  const { displayValue: phoneDisplay, handleChange: handlePhoneChange } =
    usePhoneInput((val) => phoneForm.setValue("newPhone", val));

  const onRequestPhone = (data: NewPhoneFormData) => {
    setPhoneError(null);
    requestPhoneChange.mutate(data.newPhone, {
      onSuccess: () => {
        setNewPhoneValue(data.newPhone);
        setPhoneStep("otp");
        setPhoneOtpExpired(false);
        setPhoneCooldown(120);
        phoneForm.reset();
      },
      onError: (err: any) =>
        setPhoneError(err.response?.data?.message || "Erreur"),
    });
  };

  const onVerifyPhone = (data: OtpFormData) => {
    setPhoneError(null);
    verifyPhoneOtpMutation.mutate(data.otp, {
      onSuccess: () => {
        setPhoneStep("success");
        phoneOtpForm.reset();
      },
      onError: (err: any) =>
        setPhoneError(err.response?.data?.message || "Code incorrect"),
    });
  };

  const onResendPhone = () => {
    if (phoneCooldown > 0) return;
    requestPhoneChange.mutate(newPhoneValue, {
      onSuccess: () => {
        setPhoneOtpExpired(false);
        setPhoneCooldown(120);
      },
      onError: (err: any) =>
        setPhoneError(err.response?.data?.message || "Erreur"),
    });
  };

  const closePhoneModal = () => {
    setPhoneStep(null);
    setPhoneError(null);
    phoneForm.reset();
    phoneOtpForm.reset();
  };

  // ── Email ─────────────────────────────────────────────────────────────────────
  const emailForm = useForm<NewEmailFormData>({
    resolver: zodResolver(newEmailSchema),
  });
  const emailOtpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });
  const requestEmailChange = useRequestEmailChange();
  const verifyEmailOtpMutation = useVerifyEmailOtp();

  const onRequestEmail = (data: NewEmailFormData) => {
    setEmailError(null);
    requestEmailChange.mutate(data.newEmail, {
      onSuccess: () => {
        setNewEmailValue(data.newEmail);
        setEmailStep("otp");
        setEmailOtpExpired(false);
        setEmailCooldown(120);
        emailForm.reset();
      },
      onError: (err: any) =>
        setEmailError(err.response?.data?.message || "Erreur"),
    });
  };

  const onVerifyEmail = (data: OtpFormData) => {
    setEmailError(null);
    verifyEmailOtpMutation.mutate(data.otp, {
      onSuccess: () => {
        setEmailStep("success");
        emailOtpForm.reset();
      },
      onError: (err: any) =>
        setEmailError(err.response?.data?.message || "Code incorrect"),
    });
  };

  const onResendEmail = () => {
    if (emailCooldown > 0) return;
    requestEmailChange.mutate(newEmailValue, {
      onSuccess: () => {
        setEmailOtpExpired(false);
        setEmailCooldown(120);
      },
      onError: (err: any) =>
        setEmailError(err.response?.data?.message || "Erreur"),
    });
  };

  const closeEmailModal = () => {
    setEmailStep(null);
    setEmailError(null);
    emailForm.reset();
    emailOtpForm.reset();
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
                    onClick={() => {
                      setEmailError(null);
                      setEmailStep("request");
                    }}
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
                    onClick={() => {
                      setPhoneError(null);
                      setPhoneStep("request");
                    }}
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

      {/* ════ MODAL TÉLÉPHONE ════ */}
      <Modal
        isOpen={phoneStep !== null}
        onClose={closePhoneModal}
        title={
          phoneStep === "request"
            ? "Changer de téléphone"
            : phoneStep === "otp"
              ? "Code de vérification"
              : "Téléphone mis à jour !"
        }
        icon={phoneStep === "success" ? "✅" : "📱"}
        headerVariant="premium"
      >
        {phoneStep === "request" && (
          <form
            onSubmit={phoneForm.handleSubmit(onRequestPhone)}
            className="space-y-4"
          >
            <p className={`text-sm ${colors.text.secondary}`}>
              🔒 Un code de vérification sera envoyé par <strong>SMS</strong>{" "}
              sur votre nouveau numéro.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nouveau numéro
              </label>
              <Input
                type="tel"
                placeholder="06 12 34 56 78"
                value={phoneDisplay}
                onChange={handlePhoneChange}
                error={phoneForm.formState.errors.newPhone?.message}
              />
            </div>
            {phoneError && (
              <p className={`text-sm ${colors.error.text}`}>{phoneError}</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={closePhoneModal}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={requestPhoneChange.isPending}
              >
                Envoyer le code
              </Button>
            </div>
          </form>
        )}

        {phoneStep === "otp" && (
          <form
            onSubmit={phoneOtpForm.handleSubmit(onVerifyPhone)}
            className="space-y-4"
          >
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${colors.success.bg}`}
            >
              <span>✅</span>
              <p className={`text-sm ${colors.success.textDark}`}>
                Code envoyé au{" "}
                <strong>
                  {newPhoneValue.replace(/(\d{2})(?=\d)/g, "$1 ").trim()}
                </strong>
              </p>
            </div>
            <Input
              label="Code de vérification (6 chiffres)"
              type="text"
              placeholder="_ _ _ _ _ _"
              maxLength={6}
              error={phoneOtpForm.formState.errors.otp?.message}
              {...phoneOtpForm.register("otp")}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={colors.text.secondary}>
                ⏱️ Valable :{" "}
                {!phoneOtpExpired ? (
                  <OtpTimer
                    seconds={600}
                    onExpire={() => setPhoneOtpExpired(true)}
                  />
                ) : (
                  <span className={colors.error.text}>Expiré</span>
                )}
              </span>
              <button
                type="button"
                onClick={onResendPhone}
                disabled={phoneCooldown > 0}
                className={`font-medium ${phoneCooldown > 0 ? colors.text.muted : colors.premium.text} disabled:cursor-not-allowed`}
              >
                🔄{" "}
                {phoneCooldown > 0
                  ? `Renvoyer (${phoneCooldown}s)`
                  : "Renvoyer"}
              </button>
            </div>
            {phoneError && (
              <p className={`text-sm ${colors.error.text}`}>{phoneError}</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => {
                  setPhoneStep("request");
                  phoneOtpForm.reset();
                }}
              >
                Retour
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={verifyPhoneOtpMutation.isPending}
              >
                Vérifier
              </Button>
            </div>
          </form>
        )}

        {phoneStep === "success" && (
          <div className="space-y-5 py-2">
            <p
              className={`text-sm ${colors.text.secondary} text-center leading-relaxed`}
            >
              Votre numéro de téléphone a bien été mis à jour.
              <br />
              Veuillez vous reconnecter pour finaliser la modification.
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setPhoneStep(null);
                logout();
                router.push(routes.auth.login);
              }}
            >
              Se reconnecter
            </Button>
          </div>
        )}
      </Modal>

      {/* ════ MODAL EMAIL ════ */}
      <Modal
        isOpen={emailStep !== null}
        onClose={closeEmailModal}
        title={
          emailStep === "request"
            ? "Changer d'adresse email"
            : emailStep === "otp"
              ? "Code de vérification"
              : "Email mis à jour !"
        }
        icon={emailStep === "success" ? "✅" : "📧"}
        headerVariant="premium"
      >
        {emailStep === "request" && (
          <form
            onSubmit={emailForm.handleSubmit(onRequestEmail)}
            className="space-y-4"
          >
            <p className={`text-sm ${colors.text.secondary}`}>
              🔒 Un code de vérification sera envoyé sur votre{" "}
              <strong>nouvelle adresse email</strong>.
            </p>
            <Input
              label="Nouvelle adresse email"
              type="email"
              placeholder="nouveau@email.com"
              error={emailForm.formState.errors.newEmail?.message}
              {...emailForm.register("newEmail")}
            />
            {emailError && (
              <p className={`text-sm ${colors.error.text}`}>{emailError}</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={closeEmailModal}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={requestEmailChange.isPending}
              >
                Envoyer le code SMS
              </Button>
            </div>
          </form>
        )}

        {emailStep === "otp" && (
          <form
            onSubmit={emailOtpForm.handleSubmit(onVerifyEmail)}
            className="space-y-4"
          >
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${colors.success.bg}`}
            >
              <span>✅</span>
              <p className={`text-sm ${colors.success.textDark}`}>
                Code envoyé sur <strong>{maskEmail(newEmailValue)}</strong>
              </p>
            </div>
            <Input
              label="Code de vérification (6 chiffres)"
              type="text"
              placeholder="_ _ _ _ _ _"
              maxLength={6}
              error={emailOtpForm.formState.errors.otp?.message}
              {...emailOtpForm.register("otp")}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={colors.text.secondary}>
                ⏱️ Valable :{" "}
                {!emailOtpExpired ? (
                  <OtpTimer
                    seconds={600}
                    onExpire={() => setEmailOtpExpired(true)}
                  />
                ) : (
                  <span className={colors.error.text}>Expiré</span>
                )}
              </span>
              <button
                type="button"
                onClick={onResendEmail}
                disabled={emailCooldown > 0}
                className={`font-medium ${emailCooldown > 0 ? colors.text.muted : colors.premium.text} disabled:cursor-not-allowed`}
              >
                🔄{" "}
                {emailCooldown > 0
                  ? `Renvoyer (${emailCooldown}s)`
                  : "Renvoyer"}
              </button>
            </div>
            {emailError && (
              <p className={`text-sm ${colors.error.text}`}>{emailError}</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => {
                  setEmailStep("request");
                  emailOtpForm.reset();
                }}
              >
                Retour
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={verifyEmailOtpMutation.isPending}
              >
                Vérifier
              </Button>
            </div>
          </form>
        )}

        {emailStep === "success" && (
          <div className="space-y-5 py-2">
            <p
              className={`text-sm ${colors.text.secondary} text-center leading-relaxed`}
            >
              Votre adresse email a bien été mise à jour.
              <br />
              Veuillez vous reconnecter avec votre nouvelle adresse email.
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setEmailStep(null);
                logout();
                router.push(routes.auth.login);
              }}
            >
              Se reconnecter
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
