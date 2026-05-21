"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/auth-store";
import {
  useRequestPhoneChange,
  useVerifyPhoneOtp,
  useRequestEmailChange,
  useVerifyEmailOtp,
  useRequestDeleteAccount,
  useConfirmDeleteAccount,
} from "@/hooks/useProfile";
import { usePhoneInput } from "@/hooks/usePhoneInput";
import { otpSchema, newPhoneSchema, newEmailSchema } from "@/lib/schemas";
import { maskEmail } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OtpTimer } from "@/components/ui/OtpTimer";
import { colors } from "@/config/colors";
import { routes } from "@/config/routes";
import type { z } from "zod";

type OtpFormData = z.infer<typeof otpSchema>;
type NewPhoneFormData = z.infer<typeof newPhoneSchema>;
type NewEmailFormData = z.infer<typeof newEmailSchema>;

// ─── Modal Téléphone ──────────────────────────────────────────────────────────
interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhoneModal: React.FC<PhoneModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [step, setStep] = useState<"request" | "otp" | "success">("request");
  const [error, setError] = useState<string | null>(null);
  const [newPhoneValue, setNewPhoneValue] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);

  const phoneForm = useForm<NewPhoneFormData>({
    resolver: zodResolver(newPhoneSchema),
  });
  const otpForm = useForm<OtpFormData>({ resolver: zodResolver(otpSchema) });
  const requestPhoneChange = useRequestPhoneChange();
  const verifyPhoneOtp = useVerifyPhoneOtp();
  const { displayValue, handleChange } = usePhoneInput((val) =>
    phoneForm.setValue("newPhone", val),
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleClose = () => {
    setStep("request");
    setError(null);
    phoneForm.reset();
    otpForm.reset();
    onClose();
  };

  const onRequest = (data: NewPhoneFormData) => {
    setError(null);
    requestPhoneChange.mutate(data.newPhone, {
      onSuccess: () => {
        setNewPhoneValue(data.newPhone);
        setStep("otp");
        setOtpExpired(false);
        setCooldown(120);
        phoneForm.reset();
      },
      onError: (err: any) => setError(err.response?.data?.message || "Erreur"),
    });
  };

  const onVerify = (data: OtpFormData) => {
    setError(null);
    verifyPhoneOtp.mutate(data.otp, {
      onSuccess: () => {
        setStep("success");
        otpForm.reset();
      },
      onError: (err: any) =>
        setError(err.response?.data?.message || "Code incorrect"),
    });
  };

  const onResend = () => {
    if (cooldown > 0) return;
    requestPhoneChange.mutate(newPhoneValue, {
      onSuccess: () => {
        setOtpExpired(false);
        setCooldown(120);
      },
      onError: (err: any) => setError(err.response?.data?.message || "Erreur"),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === "request"
          ? "Changer de téléphone"
          : step === "otp"
            ? "Code de vérification"
            : "Téléphone mis à jour !"
      }
      icon={step === "success" ? "✅" : "📱"}
      headerVariant="secondary"
    >
      {step === "request" && (
        <form
          onSubmit={phoneForm.handleSubmit(onRequest)}
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
              value={displayValue}
              onChange={handleChange}
              error={phoneForm.formState.errors.newPhone?.message}
            />
          </div>
          {error && <p className={`text-sm ${colors.error.text}`}>{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={handleClose}
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
      {step === "otp" && (
        <form onSubmit={otpForm.handleSubmit(onVerify)} className="space-y-4">
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
            error={otpForm.formState.errors.otp?.message}
            {...otpForm.register("otp")}
          />
          <div className="flex items-center justify-between text-sm">
            <span className={colors.text.secondary}>
              ⏱️ <OtpTimer seconds={600} onExpire={() => setOtpExpired(true)} />
            </span>
            <button
              type="button"
              onClick={onResend}
              disabled={cooldown > 0}
              className={`font-medium ${cooldown > 0 ? colors.text.muted : colors.secondary.text} disabled:cursor-not-allowed`}
            >
              🔄 {cooldown > 0 ? `Renvoyer (${cooldown}s)` : "Renvoyer"}
            </button>
          </div>
          {error && <p className={`text-sm ${colors.error.text}`}>{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => {
                setStep("request");
                otpForm.reset();
              }}
            >
              Retour
            </Button>
            <Button
              type="submit"
              variant="secondary"
              fullWidth
              isLoading={verifyPhoneOtp.isPending}
            >
              Vérifier
            </Button>
          </div>
        </form>
      )}
      {step === "success" && (
        <div className="space-y-5 py-2">
          <p className={`text-sm ${colors.text.secondary} text-center`}>
            Numéro mis à jour. Veuillez vous reconnecter.
          </p>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              handleClose();
              logout();
              router.push(routes.auth.login);
            }}
          >
            Se reconnecter
          </Button>
        </div>
      )}
    </Modal>
  );
};

// ─── Modal Suppression de compte ─────────────────────────────────────────────
interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [step, setStep] = useState<"warning" | "otp" | "success">("warning");
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const otpForm = useForm<OtpFormData>({ resolver: zodResolver(otpSchema) });
  const requestDelete = useRequestDeleteAccount();
  const confirmDelete = useConfirmDeleteAccount();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleClose = () => {
    if (step === "success") return;
    setStep("warning");
    setError(null);
    otpForm.reset();
    onClose();
  };

  const onRequestOtp = () => {
    setError(null);
    requestDelete.mutate(undefined, {
      onSuccess: () => {
        setStep("otp");
        setCooldown(120);
      },
      onError: (err: any) =>
        setError(err.response?.data?.message || "Erreur lors de l'envoi"),
    });
  };

  const onVerify = (data: OtpFormData) => {
    setError(null);
    confirmDelete.mutate(data.otp, {
      onSuccess: () => setStep("success"),
      onError: (err: any) =>
        setError(err.response?.data?.message || "Code incorrect"),
    });
  };

  const onResend = () => {
    if (cooldown > 0) return;
    requestDelete.mutate(undefined, {
      onSuccess: () => setCooldown(120),
      onError: (err: any) => setError(err.response?.data?.message || "Erreur"),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      preventClose={step === "success"}
      title={
        step === "warning"
          ? "Supprimer mon compte"
          : step === "otp"
            ? "Code de confirmation"
            : "Compte supprimé"
      }
      icon={step === "success" ? "✅" : "🗑️"}
      headerVariant="error"
    >
      {step === "warning" && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-700 font-semibold mb-1">
              ⚠️ Cette action est irréversible
            </p>
            <ul className="text-sm text-red-600 space-y-1 list-disc pl-4">
              <li>Vos données personnelles seront anonymisées</li>
              <li>Vous ne pourrez plus vous connecter</li>
              <li>Vos échanges et historique seront conservés anonymement</li>
            </ul>
          </div>
          <p className={`text-sm ${colors.text.secondary}`}>
            Un code de confirmation vous sera envoyé par email pour valider cette suppression.
          </p>
          <p className={`text-xs ${colors.text.muted}`}>
            Toute prestation en cours doit être finalisée avant de supprimer votre compte.
          </p>
          {error && <p className={`text-sm ${colors.error.text}`}>{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" fullWidth onClick={handleClose}>
              Annuler
            </Button>
            <Button
              type="button"
              variant="primary"
              fullWidth
              isLoading={requestDelete.isPending}
              onClick={onRequestOtp}
              className="!bg-red-600 hover:!bg-red-700"
            >
              Recevoir le code
            </Button>
          </div>
        </div>
      )}

      {step === "otp" && (
        <form onSubmit={otpForm.handleSubmit(onVerify)} className="space-y-4">
          <div className={`flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200`}>
            <span>📧</span>
            <p className="text-sm text-red-700">
              Code envoyé sur votre adresse email
            </p>
          </div>
          <Input
            label="Code (6 chiffres)"
            type="text"
            placeholder="_ _ _ _ _ _"
            maxLength={6}
            error={otpForm.formState.errors.otp?.message}
            {...otpForm.register("otp")}
          />
          <div className="flex items-center justify-between text-sm">
            <span className={colors.text.secondary}>
              ⏱️ <OtpTimer seconds={600} onExpire={() => {}} />
            </span>
            <button
              type="button"
              onClick={onResend}
              disabled={cooldown > 0}
              className={`font-medium ${cooldown > 0 ? colors.text.muted : "text-red-600"} disabled:cursor-not-allowed`}
            >
              🔄 {cooldown > 0 ? `Renvoyer (${cooldown}s)` : "Renvoyer"}
            </button>
          </div>
          {error && <p className={`text-sm ${colors.error.text}`}>{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => { setStep("warning"); otpForm.reset(); setError(null); }}
            >
              Retour
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={confirmDelete.isPending}
              className="!bg-red-600 hover:!bg-red-700"
            >
              Confirmer la suppression
            </Button>
          </div>
        </form>
      )}

      {step === "success" && (
        <div className="space-y-5 py-2 text-center">
          <p className={`text-sm ${colors.text.secondary}`}>
            Votre compte a bien été supprimé. Merci d'avoir utilisé Tasky.
          </p>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              logout();
              router.push("/");
            }}
          >
            Retour à l'accueil
          </Button>
        </div>
      )}
    </Modal>
  );
};

// ─── Modal Email ──────────────────────────────────────────────────────────────
interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [step, setStep] = useState<"request" | "otp" | "success">("request");
  const [error, setError] = useState<string | null>(null);
  const [newEmailValue, setNewEmailValue] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);

  const emailForm = useForm<NewEmailFormData>({
    resolver: zodResolver(newEmailSchema),
  });
  const otpForm = useForm<OtpFormData>({ resolver: zodResolver(otpSchema) });
  const requestEmailChange = useRequestEmailChange();
  const verifyEmailOtp = useVerifyEmailOtp();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleClose = () => {
    setStep("request");
    setError(null);
    emailForm.reset();
    otpForm.reset();
    onClose();
  };

  const onRequest = (data: NewEmailFormData) => {
    setError(null);
    requestEmailChange.mutate(data.newEmail, {
      onSuccess: () => {
        setNewEmailValue(data.newEmail);
        setStep("otp");
        setOtpExpired(false);
        setCooldown(120);
        emailForm.reset();
      },
      onError: (err: any) => setError(err.response?.data?.message || "Erreur"),
    });
  };

  const onVerify = (data: OtpFormData) => {
    setError(null);
    verifyEmailOtp.mutate(data.otp, {
      onSuccess: () => {
        setStep("success");
        otpForm.reset();
      },
      onError: (err: any) =>
        setError(err.response?.data?.message || "Code incorrect"),
    });
  };

  const onResend = () => {
    if (cooldown > 0) return;
    requestEmailChange.mutate(newEmailValue, {
      onSuccess: () => {
        setOtpExpired(false);
        setCooldown(120);
      },
      onError: (err: any) => setError(err.response?.data?.message || "Erreur"),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === "request"
          ? "Changer d'adresse email"
          : step === "otp"
            ? "Code de vérification"
            : "Email mis à jour !"
      }
      icon={step === "success" ? "✅" : "📧"}
      headerVariant="secondary"
    >
      {step === "request" && (
        <form
          onSubmit={emailForm.handleSubmit(onRequest)}
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
          {error && <p className={`text-sm ${colors.error.text}`}>{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={handleClose}
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
      {step === "otp" && (
        <form onSubmit={otpForm.handleSubmit(onVerify)} className="space-y-4">
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
            error={otpForm.formState.errors.otp?.message}
            {...otpForm.register("otp")}
          />
          <div className="flex items-center justify-between text-sm">
            <span className={colors.text.secondary}>
              ⏱️ <OtpTimer seconds={600} onExpire={() => setOtpExpired(true)} />
            </span>
            <button
              type="button"
              onClick={onResend}
              disabled={cooldown > 0}
              className={`font-medium ${cooldown > 0 ? colors.text.muted : colors.secondary.text} disabled:cursor-not-allowed`}
            >
              🔄 {cooldown > 0 ? `Renvoyer (${cooldown}s)` : "Renvoyer"}
            </button>
          </div>
          {error && <p className={`text-sm ${colors.error.text}`}>{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => {
                setStep("request");
                otpForm.reset();
              }}
            >
              Retour
            </Button>
            <Button
              type="submit"
              variant="secondary"
              fullWidth
              isLoading={verifyEmailOtp.isPending}
            >
              Vérifier
            </Button>
          </div>
        </form>
      )}
      {step === "success" && (
        <div className="space-y-5 py-2">
          <p className={`text-sm ${colors.text.secondary} text-center`}>
            Email mis à jour. Veuillez vous reconnecter.
          </p>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              handleClose();
              logout();
              router.push(routes.auth.login);
            }}
          >
            Se reconnecter
          </Button>
        </div>
      )}
    </Modal>
  );
};
