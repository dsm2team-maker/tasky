"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import categoriesData from "@/data/categories.json";
import type { Categorie, SousCategorie } from "@/types/categories.types";
import { INSCRIPTION_LIMITS } from "@/config/inscription-limits";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useAuthStore } from "@/stores/auth-store";
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
  useRequestPhoneChange,
  useVerifyPhoneOtp,
  useRequestEmailChange,
  useVerifyEmailOtp,
  useUpdatePrestataireProfile,
  usePrestataireCompetences,
  useUpdatePrestataireCompetences,
  usePrestataireStats,
} from "@/hooks/useProfile";
import { usePhoneInput } from "@/hooks/usePhoneInput";
import { phoneSchema } from "@/lib/schemas";
import HeaderPrestataire from "@/components/headers/HeaderPrestataire";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/ui/Modal";
import { ProfilePhotoUpload } from "@/components/shared/ProfilePhotoUpload";
import { CityInput } from "@/components/shared/CityInput";
import { colors } from "@/config/colors";
import { spacing, typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import type { CompetenceInput } from "@/services/user.service";

// ─── Constantes ───────────────────────────────────────────────────────────────
const BIO_MIN = 100;
const BIO_MAX = 500;
const {
  MAX_CATEGORIES,
  MAX_SOUS_CATEGORIES_PAR_CATEGORIE,
  MAX_COMPETENCES_PAR_SOUS_CATEGORIE,
} = INSCRIPTION_LIMITS;

// ─── Types sélection compétences ─────────────────────────────────────────────
interface Selection {
  [categorieId: string]: { [sousCategorieId: string]: string[] };
}

const nbSousCat = (sel: Selection, catId: string) =>
  Object.keys(sel[catId] || {}).length;
const nbComp = (sel: Selection, catId: string, scId: string) =>
  sel[catId]?.[scId]?.length || 0;

// ─── Schemas ──────────────────────────────────────────────────────────────────
const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(50)
    .regex(/^[a-zA-ZÀ-ÿ '-]+$/, "Caractères invalides"),
  lastName: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(50)
    .regex(/^[a-zA-ZÀ-ÿ '-]+$/, "Caractères invalides"),
  city: z.string().optional(),
});
const newPhoneSchema = z.object({ newPhone: phoneSchema });
const newEmailSchema = z.object({
  newEmail: z.string().email("Format invalide").toLowerCase(),
});
const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "6 chiffres requis")
    .regex(/^\d{6}$/),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type NewPhoneFormData = z.infer<typeof newPhoneSchema>;
type NewEmailFormData = z.infer<typeof newEmailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

const maskEmail = (email: string): string => {
  const [local, domain] = email.split("@");
  if (!domain || local.length <= 2) return email;
  return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
};

// ─── Timer OTP ────────────────────────────────────────────────────────────────
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

// ─── Barre de progression 4/4 ────────────────────────────────────────────────
const ProfileProgress: React.FC<{
  emailVerified: boolean;
  hasBio: boolean;
  hasCompetences: boolean;
  hasPointDepot: boolean;
  onActionBio: () => void;
  onActionCompetences: () => void;
  onActionPointDepot: () => void;
}> = ({
  emailVerified,
  hasBio,
  hasCompetences,
  hasPointDepot,
  onActionBio,
  onActionCompetences,
  onActionPointDepot,
}) => {
  const steps = [
    { label: "Email vérifié", done: emailVerified, icon: "✉️", action: null },
    { label: "Bio complétée", done: hasBio, icon: "✍️", action: onActionBio },
    {
      label: "Compétences ajoutées",
      done: hasCompetences,
      icon: "🛠️",
      action: onActionCompetences,
    },
    {
      label: "Point de dépôt défini",
      done: hasPointDepot,
      icon: "📍",
      action: onActionPointDepot,
    },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === 4;

  if (allDone) return null;

  return (
    <div className="mb-6 p-5 rounded-2xl border-2 border-amber-300 bg-amber-50">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-amber-800">
            ⚠️ Activez votre profil — {doneCount}/4
          </h3>
          <p className="text-sm text-amber-700 mt-0.5">
            Vous ne recevrez pas de demandes tant que votre profil n'est pas
            complet
          </p>
        </div>
        <span
          className={`text-2xl font-bold ${doneCount === 4 ? "text-green-600" : "text-amber-700"}`}
        >
          {doneCount}/4
        </span>
      </div>
      <div className="flex gap-1 mb-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-all ${step.done ? "bg-emerald-500" : "bg-amber-200"}`}
          />
        ))}
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center justify-between">
            <span
              className={`text-sm font-medium ${step.done ? "text-emerald-700 font-semibold" : "text-amber-800"}`}
            >
              {step.done ? "✅" : "⬜"} {step.icon} {i + 1}. {step.label}
            </span>
            {!step.done && step.action && (
              <button
                onClick={step.action}
                className={`text-xs font-semibold ${colors.secondary.text} hover:underline`}
              >
                Compléter →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Badge disponibilité ──────────────────────────────────────────────────────
const DisponibiliteBadge: React.FC<{
  disponibilite: "ACTIF" | "OCCUPE" | "ABSENT";
}> = ({ disponibilite }) => {
  const config = {
    ACTIF: {
      icon: "🟢",
      label: "Disponible",
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-300",
    },
    OCCUPE: {
      icon: "🟡",
      label: "Occupé",
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      border: "border-yellow-300",
    },
    ABSENT: {
      icon: "🔴",
      label: "Absent",
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-300",
    },
  };
  const c = config[disponibilite];
  return (
    <span
      className={`text-xs px-2 py-1 rounded-full font-semibold ${c.bg} ${c.text} border ${c.border}`}
    >
      {c.icon} {c.label}
    </span>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────
export default function PrestataireProfilePage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { isHydrated, isReady } = useAuthGuard({ requireEmailVerified: false });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioValue, setBioValue] = useState("");
  const [bioError, setBioError] = useState<string | null>(null);
  const [isEditingPointDepot, setIsEditingPointDepot] = useState(false);
  const [pointDepotError, setPointDepotError] = useState<string | null>(null);
  const [localAdresse, setLocalAdresse] = useState("");
  const [localCodePostal, setLocalCodePostal] = useState("");
  const [localVille, setLocalVille] = useState("");
  const [localComplement, setLocalComplement] = useState("");

  const [showCompetences, setShowCompetences] = useState(false);
  const [selection, setSelection] = useState<Selection>({});
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [openSc, setOpenSc] = useState<string | null>(null);
  const [openComp, setOpenComp] = useState<string | null>(null);
  const [competenceError, setCompetenceError] = useState<string | null>(null);

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

  const categories = categoriesData.categories as Categorie[];

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

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: competences, isLoading: competencesLoading } =
    usePrestataireCompetences();
  const { data: stats } = usePrestataireStats();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        city: profile.city || "",
      });
      if (profile.prestataire?.bio) setBioValue(profile.prestataire.bio);
    }
  }, [profile, reset]);

  useEffect(() => {
    if (isEditingPointDepot && profile?.prestataire) {
      setLocalAdresse(profile.prestataire.pointDepotAdresse || "");
      setLocalCodePostal(profile.prestataire.pointDepotCodePostal || "");
      setLocalVille(profile.prestataire.pointDepotVille || "");
      setLocalComplement(profile.prestataire.pointDepotInstructions || "");
    }
  }, [isEditingPointDepot, profile]);

  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const updatePrestataireProfile = useUpdatePrestataireProfile();
  const updateCompetences = useUpdatePrestataireCompetences();

  // ── Barre de progression 4/4 ─────────────────────────────────────────────
  const hasBio = (profile?.prestataire?.bio?.length ?? 0) >= BIO_MIN;
  const hasCompetences = (competences?.length ?? 0) > 0;
  const hasPointDepot = !!profile?.prestataire?.pointDepotAdresse;
  const emailVerified = !!profile?.emailVerified;
  const profileComplete =
    emailVerified && hasBio && hasCompetences && hasPointDepot;

  useEffect(() => {
    if (competences && showCompetences) {
      const restored: Selection = {};
      for (const comp of competences) {
        if (!restored[comp.categoryId]) restored[comp.categoryId] = {};
        if (comp.subCategoryId) {
          if (!restored[comp.categoryId][comp.subCategoryId]) {
            restored[comp.categoryId][comp.subCategoryId] = [];
          }
          if (comp.interventionId) {
            restored[comp.categoryId][comp.subCategoryId].push(
              comp.interventionId,
            );
          }
        }
      }
      setSelection(restored);
    }
  }, [competences, showCompetences]);

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
          setIsEditingInfo(false);
        },
        onError: (err: any) =>
          setSuccessMessage(err.response?.data?.message || "Erreur"),
      },
    );
  };

  const onSubmitBio = () => {
    setBioError(null);
    if (bioValue.trim().length < BIO_MIN) {
      setBioError(`Minimum ${BIO_MIN} caractères`);
      return;
    }
    updatePrestataireProfile.mutate(
      { bio: bioValue.trim() },
      {
        onSuccess: () => {
          setSuccessMessage("Bio mise à jour !");
          setIsEditingBio(false);
        },
        onError: (err: any) =>
          setBioError(err.response?.data?.message || "Erreur"),
      },
    );
  };

  const onSavePointDepot = () => {
    if (!localAdresse.trim() || !localCodePostal.trim() || !localVille.trim()) {
      setPointDepotError("Adresse, code postal et ville sont obligatoires");
      return;
    }
    updatePrestataireProfile.mutate(
      {
        pointDepotAdresse: localAdresse.trim(),
        pointDepotCodePostal: localCodePostal.trim(),
        pointDepotVille: localVille.trim(),
        pointDepotInstructions: localComplement.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSuccessMessage("Point de dépôt mis à jour !");
          setIsEditingPointDepot(false);
          setPointDepotError(null);
        },
        onError: (err: any) =>
          setPointDepotError(err.response?.data?.message || "Erreur"),
      },
    );
  };

  const onChangeDisponibilite = (value: "ACTIF" | "OCCUPE" | "ABSENT") => {
    if (!profileComplete) return;
    updatePrestataireProfile.mutate(
      { disponibilite: value },
      { onSuccess: () => setSuccessMessage(`Statut mis à jour !`) },
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

  // ── Compétences ──────────────────────────────────────────────────────────
  const selectedCatIds = Object.keys(selection);

  const toggleCat = (catId: string) => {
    if (openCat === catId) {
      setOpenCat(null);
      setOpenSc(null);
      return;
    }
    if (!selection[catId] && selectedCatIds.length >= MAX_CATEGORIES) {
      setCompetenceError(`Maximum ${MAX_CATEGORIES} catégories`);
      return;
    }
    setCompetenceError(null);
    setOpenCat(catId);
    setOpenSc(null);
  };

  const toggleSc = (catId: string, scId: string) => {
    if (openSc === scId) {
      setOpenSc(null);
      return;
    }
    if (
      !selection[catId]?.[scId] &&
      nbSousCat(selection, catId) >= MAX_SOUS_CATEGORIES_PAR_CATEGORIE
    ) {
      setCompetenceError(
        `Maximum ${MAX_SOUS_CATEGORIES_PAR_CATEGORIE} sous-catégories`,
      );
      return;
    }
    setCompetenceError(null);
    setOpenSc(scId);
  };

  const toggleComp = (catId: string, scId: string, prestId: string) => {
    setCompetenceError(null);
    setSelection((prev) => {
      const cat = prev[catId] || {};
      const sc = cat[scId] || [];
      const isOn = sc.includes(prestId);
      if (!isOn && sc.length >= MAX_COMPETENCES_PAR_SOUS_CATEGORIE) {
        setCompetenceError(
          `Maximum ${MAX_COMPETENCES_PAR_SOUS_CATEGORIE} compétences`,
        );
        return prev;
      }
      const newSc = isOn ? sc.filter((id) => id !== prestId) : [...sc, prestId];
      const newCat = { ...cat, [scId]: newSc };
      if (newSc.length === 0) delete newCat[scId];
      const next = { ...prev, [catId]: newCat };
      if (Object.keys(newCat).length === 0) delete next[catId];
      return next;
    });
  };

  const isOn = (catId: string, scId: string, prestId: string) =>
    selection[catId]?.[scId]?.includes(prestId) || false;

  const resume = useMemo(
    () =>
      categories.flatMap((cat) =>
        (cat.sousCategories as SousCategorie[]).flatMap((sc) =>
          (selection[cat.id]?.[sc.id] || []).map((pId) => ({
            catId: cat.id,
            catNom: cat.nom,
            catIcon: cat.icon,
            scId: sc.id,
            scNom: sc.nom,
            prestId: pId,
            prestNom: sc.prestations.find((p) => p.id === pId)?.nom || pId,
          })),
        ),
      ),
    [selection, categories],
  );

  const onSaveCompetences = () => {
    if (selectedCatIds.length === 0) {
      setCompetenceError("Sélectionnez au moins une catégorie");
      return;
    }
    const competencesInput: CompetenceInput[] = [];
    for (const catId of selectedCatIds) {
      const subCats = selection[catId] || {};
      if (Object.keys(subCats).length === 0) {
        competencesInput.push({ categoryId: catId });
      } else {
        for (const [scId, interventions] of Object.entries(subCats)) {
          if (interventions.length === 0) {
            competencesInput.push({ categoryId: catId, subCategoryId: scId });
          } else {
            for (const interventionId of interventions) {
              competencesInput.push({
                categoryId: catId,
                subCategoryId: scId,
                interventionId,
              });
            }
          }
        }
      }
    }
    updateCompetences.mutate(competencesInput, {
      onSuccess: () => {
        setSuccessMessage("Compétences mises à jour !");
        setShowCompetences(false);
      },
      onError: (err: any) =>
        setCompetenceError(err.response?.data?.message || "Erreur"),
    });
  };

  // ── Téléphone ────────────────────────────────────────────────────────────
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

  // ── Email ────────────────────────────────────────────────────────────────
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

  // ── Loading ──────────────────────────────────────────────────────────────
  if (!isHydrated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.secondary.border}`}
        />
      </div>
    );

  if (!isReady) return null;

  if (profileLoading)
    return (
      <div className={`min-h-screen ${colors.background.gray}`}>
        <HeaderPrestataire />
        <div className="flex items-center justify-center py-20">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.secondary.border}`}
          />
        </div>
      </div>
    );

  const bioLength = bioValue.length;
  const bioOk = bioLength >= BIO_MIN && bioLength <= BIO_MAX;

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderPrestataire />

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

        {/* Barre de progression 4/4 */}
        <ProfileProgress
          emailVerified={emailVerified}
          hasBio={hasBio}
          hasCompetences={hasCompetences}
          hasPointDepot={hasPointDepot}
          onActionBio={() => setIsEditingBio(true)}
          onActionCompetences={() => {
            setShowCompetences(true);
            setCompetenceError(null);
          }}
          onActionPointDepot={() => setIsEditingPointDepot(true)}
        />

        {/* Bannière identité */}
        <div
          className={`${colors.secondary.gradient} rounded-2xl p-8 mb-8 text-white`}
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
                  🛠️
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">
                {profile?.firstName} {profile?.lastName}
              </h1>
              <p className="text-emerald-100 text-sm mt-1">
                {profile?.city && `📍 ${profile.city} · `}
                Membre depuis{" "}
                {new Date(profile?.createdAt || "").toLocaleDateString(
                  "fr-FR",
                  { month: "long", year: "numeric" },
                )}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-white/20">
                  🛠️ Prestataire
                </span>
                {profile?.emailVerified && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-white/20">
                    ✉️ Email vérifié
                  </span>
                )}
                {profile?.prestataire?.disponibilite && (
                  <DisponibiliteBadge
                    disponibilite={profile.prestataire.disponibilite}
                  />
                )}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-center">
              <div>
                <div className="text-2xl font-bold">
                  {stats?.rating ? stats.rating.toFixed(1) : "—"}
                </div>
                <div className="text-xs text-emerald-100">⭐ Note</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <div className="text-2xl font-bold">
                  {stats?.nbPrestations ?? "—"}
                </div>
                <div className="text-xs text-emerald-100">Prestations</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <div className="text-2xl font-bold">
                  {stats?.reviewCount ?? "—"}
                </div>
                <div className="text-xs text-emerald-100">Avis</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Colonne gauche ── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Photo */}
            <div
              className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
            >
              <h2
                className={`${typography.h5?.base || "text-base font-semibold"} ${colors.text.primary} mb-4`}
              >
                Photo de profil
              </h2>
              <ProfilePhotoUpload
                photo={localPhoto || profile?.avatar || null}
                onPhotoChange={onPhotoChange}
                onError={(msg) => setSuccessMessage(msg)}
              />
              <p className={`mt-2 text-xs text-center ${colors.text.tertiary}`}>
                Format JPG, PNG ou WEBP · Max 5 Mo
              </p>
            </div>

            {/* Je suis */}
            <div
              className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
            >
              <h2
                className={`${typography.h5?.base || "text-base font-semibold"} ${colors.text.primary} mb-1`}
              >
                Je suis :
              </h2>

              {/* Message si profil incomplet */}
              {!profileComplete && (
                <p className={`text-xs ${colors.warning.text} mb-3`}>
                  ⚠️ Complétez votre profil (4/4) pour modifier votre statut
                </p>
              )}

              <div
                className={`space-y-2 ${!profileComplete ? "opacity-50 pointer-events-none" : ""}`}
              >
                {(["ACTIF", "OCCUPE", "ABSENT"] as const).map((statut) => {
                  const config = {
                    ACTIF: {
                      icon: "🟢",
                      label: "Disponible",
                      desc: "Je reçois des demandes",
                    },
                    OCCUPE: {
                      icon: "🟡",
                      label: "Occupé",
                      desc: "Je peux encore recevoir des demandes",
                    },
                    ABSENT: {
                      icon: "🔴",
                      label: "Absent",
                      desc: "Je ne reçois plus de demandes",
                    },
                  };
                  const c = config[statut];
                  const isSelected =
                    profile?.prestataire?.disponibilite === statut;
                  return (
                    <button
                      key={statut}
                      onClick={() => onChangeDisponibilite(statut)}
                      disabled={!profileComplete}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? statut === "ACTIF"
                            ? "border-green-400 bg-green-50"
                            : statut === "OCCUPE"
                              ? "border-yellow-400 bg-yellow-50"
                              : "border-red-400 bg-red-50"
                          : `${colors.border.light} hover:border-gray-300 bg-white`
                      }`}
                    >
                      <span className="text-xl">{c.icon}</span>
                      <div>
                        <p
                          className={`text-sm font-semibold ${colors.text.primary}`}
                        >
                          {c.label}
                        </p>
                        <p className={`text-xs ${colors.text.tertiary}`}>
                          {c.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="ml-auto text-xs font-bold text-gray-500">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Informations sensibles */}
            <div
              className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
            >
              <h2
                className={`${typography.h5?.base || "text-base font-semibold"} ${colors.text.primary} mb-4`}
              >
                Informations sensibles
              </h2>
              <div className="space-y-4">
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
                  {!profile?.emailVerified && (
                    <p className={`text-xs ${colors.warning.text} mb-2`}>
                      ⚠️ Vérifiez votre email pour activer votre compte
                    </p>
                  )}
                  <Button
                    variant="secondary"
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
                    variant="secondary"
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

          {/* ── Colonne droite ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <div
              className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2
                  className={`${typography.h5?.base || "text-base font-semibold"} ${colors.text.primary}`}
                >
                  Informations personnelles
                </h2>
                {!isEditingInfo ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingInfo(true)}
                  >
                    ✏️ Modifier
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingInfo(false);
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
                    placeholder="Marie"
                    disabled={!isEditingInfo}
                    error={errors.firstName?.message}
                    {...register("firstName")}
                  />
                  <Input
                    label="Nom"
                    placeholder="Martin"
                    disabled={!isEditingInfo}
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
                      disabled={!isEditingInfo}
                      placeholder="Ex: Lyon ou 69001"
                    />
                  )}
                />
                {isEditingInfo && (
                  <div className="flex items-center justify-between pt-2">
                    {isDirty && (
                      <p className={`text-xs ${colors.warning.text}`}>
                        ⚠️ Modifications non sauvegardées
                      </p>
                    )}
                    <Button
                      type="submit"
                      variant="secondary"
                      isLoading={updateProfile.isPending}
                      className="ml-auto"
                    >
                      Sauvegarder
                    </Button>
                  </div>
                )}
              </form>
            </div>

            {/* Bio */}
            <div
              className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className={`${typography.h5?.base || "text-base font-semibold"} ${colors.text.primary}`}
                >
                  Présentation
                </h2>
                {!isEditingBio ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingBio(true)}
                  >
                    ✏️ Modifier
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingBio(false);
                      setBioError(null);
                      if (profile?.prestataire?.bio)
                        setBioValue(profile.prestataire.bio);
                    }}
                  >
                    Annuler
                  </Button>
                )}
              </div>
              {!isEditingBio ? (
                profile?.prestataire?.bio ? (
                  <p
                    className={`text-sm ${colors.text.secondary} leading-relaxed break-words`}
                  >
                    {profile.prestataire.bio}
                  </p>
                ) : (
                  <p className={`text-sm ${colors.text.tertiary} italic`}>
                    Aucune présentation. Ajoutez une bio pour inspirer confiance
                    aux clients !
                  </p>
                )
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs ${colors.text.tertiary}`}>
                      Min {BIO_MIN} · Max {BIO_MAX} caractères
                    </p>
                    <span
                      className={`text-xs font-medium ${bioLength > BIO_MAX ? colors.error.text : bioOk ? colors.secondary.text : colors.text.tertiary}`}
                    >
                      {bioLength}/{BIO_MAX}
                    </span>
                  </div>
                  <textarea
                    value={bioValue}
                    onChange={(e) => {
                      setBioValue(e.target.value);
                      setBioError(null);
                    }}
                    placeholder="Parlez-nous de vous et de votre expérience..."
                    rows={5}
                    maxLength={BIO_MAX}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 transition-all ${bioOk ? `${colors.secondary.borderLight} focus:ring-emerald-300` : `${colors.border.default} focus:ring-gray-300`} text-gray-800 placeholder-gray-400`}
                  />
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${bioLength > BIO_MAX ? "bg-red-400" : bioOk ? "bg-emerald-400" : "bg-gray-300"}`}
                      style={{
                        width: `${Math.min((bioLength / BIO_MAX) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  {!bioOk && bioLength < BIO_MIN && (
                    <p className={`text-xs font-medium ${colors.premium.text}`}>
                      Encore {BIO_MIN - bioLength} caractères minimum
                    </p>
                  )}
                  {bioError && (
                    <p className={`text-sm ${colors.error.text}`}>{bioError}</p>
                  )}
                  <Button
                    variant="secondary"
                    onClick={onSubmitBio}
                    isLoading={updatePrestataireProfile.isPending}
                    disabled={!bioOk}
                    className="ml-auto block"
                  >
                    Sauvegarder la bio
                  </Button>
                </div>
              )}
            </div>

            {/* Point de dépôt */}
            <div
              className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className={`${typography.h5?.base || "text-base font-semibold"} ${colors.text.primary}`}
                >
                  📍 Point de dépôt / retrait
                </h2>
                {!isEditingPointDepot ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingPointDepot(true)}
                  >
                    ✏️ Modifier
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingPointDepot(false);
                      setPointDepotError(null);
                    }}
                  >
                    Annuler
                  </Button>
                )}
              </div>
              {!isEditingPointDepot ? (
                profile?.prestataire?.pointDepotAdresse ? (
                  <div
                    className={`p-4 rounded-xl ${colors.secondary.bg} border ${colors.secondary.borderLight}`}
                  >
                    <p
                      className={`text-sm font-medium ${colors.secondary.textDark}`}
                    >
                      📍 {profile.prestataire.pointDepotAdresse}
                      {profile.prestataire.pointDepotCodePostal &&
                        ` ${profile.prestataire.pointDepotCodePostal}`}
                      {profile.prestataire.pointDepotVille &&
                        ` ${profile.prestataire.pointDepotVille}`}
                    </p>
                    {profile.prestataire.pointDepotInstructions && (
                      <p className={`text-xs ${colors.text.secondary} mt-1`}>
                        🏪 {profile.prestataire.pointDepotInstructions}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className={`text-sm ${colors.text.tertiary} italic`}>
                    Aucun point de dépôt défini. Ajoutez une adresse pour que
                    les clients sachent où déposer leurs objets.
                  </p>
                )
              ) : (
                <div className="space-y-3">
                  <Input
                    label="Numéro et nom de rue *"
                    placeholder="32 rue Guy Môquet"
                    value={localAdresse}
                    onChange={(e) => setLocalAdresse(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <CityInput
                      label="Ville *"
                      value={localVille}
                      onChange={setLocalVille}
                      onCitySelect={(city: string, postalCode: string) => {
                        setLocalVille(city);
                        setLocalCodePostal(postalCode);
                      }}
                      placeholder="Ex: Malakoff ou 92240"
                    />
                    <Input
                      label="Code postal"
                      placeholder="92240"
                      value={localCodePostal}
                      readOnly
                      className="bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <Input
                    label="Complément d'adresse (optionnel)"
                    placeholder="Centre commercial, épicerie, laverie..."
                    value={localComplement}
                    onChange={(e) => setLocalComplement(e.target.value)}
                  />
                  {pointDepotError && (
                    <p className={`text-sm ${colors.error.text}`}>
                      {pointDepotError}
                    </p>
                  )}
                  <div className="flex gap-3 pt-1">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsEditingPointDepot(false);
                        setPointDepotError(null);
                      }}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={onSavePointDepot}
                      isLoading={updatePrestataireProfile.isPending}
                      className="flex-1"
                    >
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Compétences */}
            <div
              className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className={`${typography.h5?.base || "text-base font-semibold"} ${colors.text.primary}`}
                >
                  Compétences
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCompetences(true);
                    setCompetenceError(null);
                  }}
                >
                  ✏️ Modifier
                </Button>
              </div>
              {competencesLoading ? (
                <div className="flex justify-center py-4">
                  <div
                    className={`animate-spin rounded-full h-6 w-6 border-t-2 ${colors.secondary.border}`}
                  />
                </div>
              ) : competences && competences.length > 0 ? (
                <div className="space-y-2">
                  {[...new Set(competences.map((c: any) => c.categoryId))].map(
                    (catId: any) => {
                      const catComps = competences.filter(
                        (c: any) => c.categoryId === catId,
                      );
                      const cat = catComps[0]?.category;
                      const isOpen = openComp === catId;
                      return (
                        <div
                          key={catId}
                          className={`rounded-xl border-2 overflow-hidden ${isOpen ? colors.secondary.borderLight : colors.border.light}`}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenComp(isOpen ? null : catId)}
                            className={`w-full flex items-center justify-between px-4 py-3 ${colors.secondary.bg} hover:opacity-90 transition`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{cat?.icon}</span>
                              <span
                                className={`text-sm font-semibold ${colors.secondary.textDark}`}
                              >
                                {cat?.nom}
                              </span>
                              <span
                                className={`text-xs ${colors.text.tertiary}`}
                              >
                                ({catComps.length} compétence
                                {catComps.length > 1 ? "s" : ""})
                              </span>
                            </div>
                            <svg
                              className={`w-4 h-4 ${colors.secondary.text} transition-transform ${isOpen ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          {isOpen && (
                            <div
                              className={`border-t ${colors.secondary.borderLight} p-3 space-y-2`}
                            >
                              {catComps.map((comp: any) => (
                                <div
                                  key={comp.id}
                                  className="flex items-center gap-2 flex-wrap"
                                >
                                  {comp.subCategory && (
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full ${colors.neutral.bg} ${colors.neutral.text} border border-blue-200`}
                                    >
                                      ◆ {comp.subCategory.nom}
                                    </span>
                                  )}
                                  {comp.intervention && (
                                    <span
                                      className={`text-xs px-2 py-1 ${colors.premium.bg} ${colors.premium.text} border border-purple-200 rounded-full`}
                                    >
                                      ● {comp.intervention.nom}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                <p
                  className={`text-sm ${colors.text.tertiary} text-center py-4`}
                >
                  Aucune compétence renseignée
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ════ MODAL COMPÉTENCES ════ */}
      <Modal
        isOpen={showCompetences}
        onClose={() => setShowCompetences(false)}
        title="Modifier mes compétences"
        icon="🛠️"
        headerVariant="secondary"
        maxWidth="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div
            className={`${colors.background.light} rounded-xl p-3 text-left space-y-1 text-sm border ${colors.border.light}`}
          >
            <p className={`font-semibold ${colors.text.primary} mb-1`}>
              Sélectionnez vos services :
            </p>
            <p className="flex items-center gap-2">
              <span className="text-emerald-500">✦</span>
              <span className={colors.text.secondary}>
                Jusqu'à{" "}
                <strong className={colors.secondary.text}>
                  {MAX_CATEGORIES} catégories
                </strong>
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-blue-500">◆</span>
              <span className={colors.text.secondary}>
                Jusqu'à{" "}
                <strong className={colors.neutral.text}>
                  {MAX_SOUS_CATEGORIES_PAR_CATEGORIE} sous-catégories
                </strong>{" "}
                par catégorie
              </span>
            </p>
            <p className="flex items-center gap-2">
              <span className="text-purple-500">●</span>
              <span className={colors.text.secondary}>
                Jusqu'à{" "}
                <strong className={colors.premium.text}>
                  {MAX_COMPETENCES_PAR_SOUS_CATEGORIE} compétences
                </strong>{" "}
                par sous-catégorie
              </span>
            </p>
          </div>

          {selectedCatIds.length > 0 && (
            <div className="space-y-1">
              <p
                className={`text-xs font-semibold ${colors.text.tertiary} uppercase tracking-wide text-center`}
              >
                {selectedCatIds.length}/{MAX_CATEGORIES} catégories
              </p>
              {selectedCatIds.map((catId) => {
                const cat = categories.find((c) => c.id === catId)!;
                const scCount = nbSousCat(selection, catId);
                const compCount = Object.values(selection[catId] || {}).flat()
                  .length;
                return (
                  <div
                    key={catId}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-xl border ${colors.secondary.borderLight} ${colors.secondary.bg}`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span
                        className={`text-sm font-semibold ${colors.secondary.textDark}`}
                      >
                        {cat.nom}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${colors.neutral.bg} ${colors.neutral.text} font-medium border border-blue-200`}
                      >
                        ◆ {scCount}/{MAX_SOUS_CATEGORIES_PAR_CATEGORIE}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${colors.premium.bg} ${colors.premium.text} font-medium border border-purple-200`}
                      >
                        ● {compCount}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {competenceError && (
            <div
              className={`p-2.5 ${colors.error.bg} border ${colors.error.border} rounded-lg`}
            >
              <p className={`${colors.error.text} text-xs text-center`}>
                ⚠️ {competenceError}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {categories.map((cat) => {
              const isOpen = openCat === cat.id;
              const inSel = !!selection[cat.id];
              const blocked = !inSel && selectedCatIds.length >= MAX_CATEGORIES;
              const scCount = nbSousCat(selection, cat.id);
              const compCount = Object.values(selection[cat.id] || {}).flat()
                .length;
              return (
                <div
                  key={cat.id}
                  className={`rounded-xl overflow-hidden border-2 transition-all ${inSel ? "border-pink-300" : blocked ? "border-gray-100 opacity-40" : `${colors.border.light} hover:border-pink-200`}`}
                >
                  <button
                    type="button"
                    disabled={blocked}
                    onClick={() => toggleCat(cat.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${colors.secondary.bg} hover:opacity-90`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-emerald-500">✦</span>
                      <span className="text-xl">{cat.icon}</span>
                      <div className="text-left">
                        <div
                          className={`font-semibold text-sm ${colors.text.primary}`}
                        >
                          {cat.nom}
                        </div>
                        <div
                          className={`text-xs mt-0.5 ${inSel ? "text-pink-400" : colors.secondary.text}`}
                        >
                          {scCount}/{MAX_SOUS_CATEGORIES_PAR_CATEGORIE}{" "}
                          sous-catégories
                          {compCount > 0 && ` · ${compCount} compétences`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {inSel && (
                        <span className="w-5 h-5 rounded-full bg-pink-400 text-white text-xs flex items-center justify-center">
                          ✓
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 ${inSel ? "text-pink-400" : colors.secondary.text} transition-transform ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>
                  {isOpen && (
                    <div className={`border-t ${colors.secondary.borderLight}`}>
                      {cat.sousCategories.map((sc) => {
                        const scOpen = openSc === sc.id;
                        const scSelected = nbComp(selection, cat.id, sc.id);
                        const scBlocked =
                          !selection[cat.id]?.[sc.id] &&
                          nbSousCat(selection, cat.id) >=
                            MAX_SOUS_CATEGORIES_PAR_CATEGORIE;
                        return (
                          <div
                            key={sc.id}
                            className={`border-b border-blue-100 last:border-0 ${scBlocked ? "opacity-40" : ""}`}
                          >
                            <button
                              type="button"
                              disabled={scBlocked}
                              onClick={() => toggleSc(cat.id, sc.id)}
                              className={`w-full flex items-center justify-between px-5 py-2.5 text-sm transition-colors ${scOpen ? "bg-blue-100" : `${colors.neutral.bg} hover:bg-blue-100`}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-blue-400 text-sm">◆</span>
                                <span
                                  className={`font-medium ${scSelected > 0 ? colors.neutral.text : "text-gray-600"}`}
                                >
                                  {sc.nom}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-xs font-semibold ${scSelected >= MAX_COMPETENCES_PAR_SOUS_CATEGORIE ? colors.error.text : colors.neutral.text}`}
                                >
                                  {scSelected}/
                                  {MAX_COMPETENCES_PAR_SOUS_CATEGORIE}
                                </span>
                                <svg
                                  className={`w-3.5 h-3.5 ${colors.neutral.text} transition-transform ${scOpen ? "rotate-180" : ""}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </div>
                            </button>
                            {scOpen && (
                              <div
                                className={`${colors.background.light} px-6 py-2 border-t border-blue-100`}
                              >
                                <p
                                  className={`text-xs ${colors.premium.text} font-medium mb-2`}
                                >
                                  {scSelected}/
                                  {MAX_COMPETENCES_PAR_SOUS_CATEGORIE}{" "}
                                  compétences sélectionnées
                                </p>
                                <div className="space-y-1.5">
                                  {sc.prestations.map((prest) => {
                                    const on = isOn(cat.id, sc.id, prest.id);
                                    const compBlocked =
                                      !on &&
                                      scSelected >=
                                        MAX_COMPETENCES_PAR_SOUS_CATEGORIE;
                                    return (
                                      <label
                                        key={prest.id}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors border ${on ? `${colors.premium.bg} border-purple-300` : compBlocked ? "opacity-40 cursor-not-allowed bg-white border-gray-200" : `bg-white ${colors.border.light} hover:border-purple-300`}`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={on}
                                          disabled={compBlocked}
                                          onChange={() =>
                                            !compBlocked &&
                                            toggleComp(cat.id, sc.id, prest.id)
                                          }
                                          className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
                                        />
                                        <span className="text-purple-400 text-xs">
                                          ●
                                        </span>
                                        <span
                                          className={`text-sm ${on ? `${colors.premium.text} font-medium` : "text-gray-700"}`}
                                        >
                                          {prest.nom}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {resume.length > 0 && (
            <div
              className={`p-3 ${colors.background.white} border-2 ${colors.secondary.borderLight} rounded-xl`}
            >
              <p
                className={`text-xs font-bold ${colors.secondary.textDark} mb-2 uppercase tracking-wide`}
              >
                ✅ Sélection ({resume.length} compétence
                {resume.length > 1 ? "s" : ""})
              </p>
              <div className="space-y-2">
                {selectedCatIds.map((catId) => {
                  const cat = categories.find((c) => c.id === catId)!;
                  const catResume = resume.filter((r) => r.catId === catId);
                  const scIds = [...new Set(catResume.map((r) => r.scId))];
                  return (
                    <div key={catId}>
                      <div
                        className={`flex items-center gap-2 px-2 py-1 rounded-lg ${colors.secondary.bg} border ${colors.secondary.borderLight} mb-1`}
                      >
                        <span className="text-emerald-500">✦</span>
                        <span>{cat.icon}</span>
                        <span
                          className={`text-xs font-bold ${colors.secondary.textDark}`}
                        >
                          {cat.nom}
                        </span>
                      </div>
                      <div className="space-y-1 pl-2">
                        {scIds.map((scId) => {
                          const scResume = catResume.filter(
                            (r) => r.scId === scId,
                          );
                          return (
                            <div key={scId}>
                              <div
                                className={`text-xs font-medium px-2 py-0.5 rounded ${colors.neutral.bg} ${colors.neutral.text} mb-1 inline-flex items-center gap-1 border border-blue-200`}
                              >
                                <span className="text-blue-400">◆</span>{" "}
                                {scResume[0]?.scNom}
                              </div>
                              <div className="flex flex-wrap gap-1 pl-1">
                                {scResume.map((r) => (
                                  <button
                                    key={r.prestId}
                                    type="button"
                                    onClick={() =>
                                      toggleComp(r.catId, r.scId, r.prestId)
                                    }
                                    className={`text-xs px-2 py-1 ${colors.premium.bg} ${colors.premium.text} border border-purple-300 rounded-full hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition flex items-center gap-1`}
                                  >
                                    <span className="text-purple-400 text-xs">
                                      ●
                                    </span>{" "}
                                    {r.prestNom}{" "}
                                    <span className="opacity-60">✕</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-2">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => setShowCompetences(false)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              isLoading={updateCompetences.isPending}
              disabled={selectedCatIds.length === 0}
              onClick={onSaveCompetences}
            >
              Sauvegarder ({selectedCatIds.length})
            </Button>
          </div>
        </div>
      </Modal>

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
        headerVariant="secondary"
      >
        {phoneStep === "request" && (
          <form
            onSubmit={phoneForm.handleSubmit(onRequestPhone)}
            className="space-y-4"
          >
            <p className={`text-sm ${colors.text.secondary}`}>
              🔒 Un code SMS sera envoyé sur votre nouveau numéro.
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
                variant="secondary"
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
              label="Code (6 chiffres)"
              type="text"
              placeholder="_ _ _ _ _ _"
              maxLength={6}
              error={phoneOtpForm.formState.errors.otp?.message}
              {...phoneOtpForm.register("otp")}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={colors.text.secondary}>
                ⏱️{" "}
                <OtpTimer
                  seconds={600}
                  onExpire={() => setPhoneOtpExpired(true)}
                />
              </span>
              <button
                type="button"
                onClick={onResendPhone}
                disabled={phoneCooldown > 0}
                className={`font-medium ${phoneCooldown > 0 ? colors.text.muted : colors.secondary.text} disabled:cursor-not-allowed`}
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
                variant="secondary"
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
            <p className={`text-sm ${colors.text.secondary} text-center`}>
              Numéro mis à jour. Veuillez vous reconnecter.
            </p>
            <Button
              variant="secondary"
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
        headerVariant="secondary"
      >
        {emailStep === "request" && (
          <form
            onSubmit={emailForm.handleSubmit(onRequestEmail)}
            className="space-y-4"
          >
            <p className={`text-sm ${colors.text.secondary}`}>
              🔒 Un code sera envoyé sur votre nouvelle adresse email.
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
                variant="secondary"
                fullWidth
                isLoading={requestEmailChange.isPending}
              >
                Envoyer le code
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
              label="Code (6 chiffres)"
              type="text"
              placeholder="_ _ _ _ _ _"
              maxLength={6}
              error={emailOtpForm.formState.errors.otp?.message}
              {...emailOtpForm.register("otp")}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={colors.text.secondary}>
                ⏱️{" "}
                <OtpTimer
                  seconds={600}
                  onExpire={() => setEmailOtpExpired(true)}
                />
              </span>
              <button
                type="button"
                onClick={onResendEmail}
                disabled={emailCooldown > 0}
                className={`font-medium ${emailCooldown > 0 ? colors.text.muted : colors.secondary.text} disabled:cursor-not-allowed`}
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
                variant="secondary"
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
            <p className={`text-sm ${colors.text.secondary} text-center`}>
              Email mis à jour. Veuillez vous reconnecter.
            </p>
            <Button
              variant="secondary"
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
