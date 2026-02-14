import React, { useEffect, useState } from "react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<
  PasswordStrengthIndicatorProps
> = ({ password }) => {
  const [strength, setStrength] = useState(0);

  // Calculer la force du mot de passe
  useEffect(() => {
    if (!password) {
      setStrength(0);
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    setStrength(score);
  }, [password]);

  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ];
  const strengthLabels = ["Très faible", "Faible", "Moyen", "Bon", "Excellent"];

  return (
    <div className="mt-3">
      {/* Règles du mot de passe */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-3">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Votre mot de passe doit contenir :
        </h3>
        <ul className="text-sm space-y-2">
          <li className="flex items-center gap-2">
            <span
              className={`font-bold ${password.length >= 8 ? "text-emerald-500" : "text-pink-600"}`}
            >
              {password.length >= 8 ? "✓" : "○"}
            </span>
            <span
              className={
                password.length >= 8
                  ? "text-emerald-700 font-medium"
                  : "text-pink-800"
              }
            >
              Au moins <strong>8 caractères</strong>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className={`font-bold ${/[A-Z]/.test(password) ? "text-emerald-500" : "text-pink-600"}`}
            >
              {/[A-Z]/.test(password) ? "✓" : "○"}
            </span>
            <span
              className={
                /[A-Z]/.test(password)
                  ? "text-emerald-700 font-medium"
                  : "text-pink-800"
              }
            >
              Une <strong>majuscule</strong> (A-Z)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className={`font-bold ${/[a-z]/.test(password) ? "text-emerald-500" : "text-pink-600"}`}
            >
              {/[a-z]/.test(password) ? "✓" : "○"}
            </span>
            <span
              className={
                /[a-z]/.test(password)
                  ? "text-emerald-700 font-medium"
                  : "text-pink-800"
              }
            >
              Une <strong>minuscule</strong> (a-z)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className={`font-bold ${/[0-9]/.test(password) ? "text-emerald-500" : "text-pink-600"}`}
            >
              {/[0-9]/.test(password) ? "✓" : "○"}
            </span>
            <span
              className={
                /[0-9]/.test(password)
                  ? "text-emerald-700 font-medium"
                  : "text-pink-800"
              }
            >
              Un <strong>chiffre</strong> (0-9)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className={`font-bold ${/[^A-Za-z0-9]/.test(password) ? "text-emerald-500" : "text-pink-600"}`}
            >
              {/[^A-Za-z0-9]/.test(password) ? "✓" : "○"}
            </span>
            <span
              className={
                /[^A-Za-z0-9]/.test(password)
                  ? "text-emerald-700 font-medium"
                  : "text-pink-800"
              }
            >
              Un <strong>caractère spécial</strong> (!@#$%...)
            </span>
          </li>
        </ul>
      </div>

      {/* Barres de force */}
      {password && (
        <div>
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  level <= strength
                    ? strengthColors[strength - 1]
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          {strength > 0 && (
            <p
              className={`text-xs font-medium ${strength >= 4 ? "text-green-600" : "text-gray-600"}`}
            >
              Force : {strengthLabels[strength - 1]}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
