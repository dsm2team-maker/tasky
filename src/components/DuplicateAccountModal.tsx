"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { colors } from "@/config/colors";
import { routes } from "@/config/routes";

interface DuplicateAccountModalProps {
  isOpen: boolean;
  type: "email" | "phone" | null;
  value?: string;
  onClose: () => void;
}

export const DuplicateAccountModal: React.FC<DuplicateAccountModalProps> = ({
  isOpen,
  type,
  value,
  onClose,
}) => {
  const router = useRouter();

  if (!isOpen || !type) return null;

  const isEmail = type === "email";
  const icon = isEmail ? "📧" : "📱";
  const label = isEmail ? "adresse email" : "numéro de téléphone";
  const displayValue = isEmail
    ? value
    : value?.replace(/(\d{2})(?=\d)/g, "$1 ").trim();

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header violet */}
          <div className={`${colors.premium.gradient} px-6 py-5 text-center`}>
            <div className="text-4xl mb-2">{icon}</div>
            <h2 className="text-white font-bold text-lg leading-tight">
              {isEmail ? "Email déjà utilisé" : "Numéro déjà utilisé"}
            </h2>
          </div>

          {/* Contenu */}
          <div className="px-6 py-5 text-center">
            <p className={`text-sm ${colors.text.secondary} mb-1`}>
              {isEmail ? "Cette" : "Ce"} {label}
            </p>
            {value && (
              <p
                className={`font-semibold ${colors.text.primary} mb-3 text-sm break-all`}
              >
                {displayValue}
              </p>
            )}
            <p className={`text-sm ${colors.text.secondary} mb-5`}>
              est déjà associé{isEmail ? "e" : ""} à un compte Tasky.
              <br />
              Souhaitez-vous :
            </p>

            {/* Boutons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  onClose();
                  router.push(routes.auth.login);
                }}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white text-sm ${colors.premium.gradient} hover:opacity-90 transition-opacity`}
              >
                Me connecter
              </button>
              <button
                onClick={() => {
                  onClose();
                  router.push(routes.auth.forgotPassword);
                }}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm border-2 ${colors.premium.borderLight} ${colors.premium.text} hover:${colors.premium.bg} transition-colors`}
              >
                Réinitialiser mon mot de passe
              </button>
              <button
                onClick={onClose}
                className={`w-full py-2 text-sm ${colors.text.tertiary} hover:${colors.text.secondary} transition-colors`}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
