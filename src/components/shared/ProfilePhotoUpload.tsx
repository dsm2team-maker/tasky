"use client";

import React, { useRef, useState } from "react";
import { colors } from "@/config/colors";

interface ProfilePhotoUploadProps {
  photo: string | null;
  onPhotoChange: (photoData: string | null) => void;
  onError?: (message: string) => void;
}

export const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  photo,
  onPhotoChange,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [justUploaded, setJustUploaded] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      onError?.("La photo ne doit pas dépasser 5 Mo");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onPhotoChange(reader.result as string);
      setJustUploaded(true);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onPhotoChange(null);
    setJustUploaded(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className={`p-4 rounded-2xl border-2 ${photo ? colors.secondary.borderLight : colors.border.light} ${colors.background.white}`}
    >
      <p className={`text-sm font-semibold ${colors.text.primary} mb-3`}>
        📸 Ajoutez une photo de profil
      </p>

      <div className="flex items-center gap-4">
        {/* Avatar preview */}
        <div
          className={`relative w-20 h-20 rounded-full flex-shrink-0 overflow-hidden border-2 ${photo ? colors.secondary.border : "border-dashed border-gray-300"} bg-gray-50`}
        >
          {photo ? (
            <img
              src={photo}
              alt="Photo de profil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl text-gray-300">👤</span>
            </div>
          )}
          {photo && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium"
            >
              ✕ Retirer
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
              photo
                ? `${colors.border.light} ${colors.text.secondary} hover:border-emerald-200 hover:text-emerald-600`
                : `${colors.secondary.border} ${colors.secondary.text} ${colors.secondary.bg} hover:opacity-80`
            }`}
          >
            <span>🖼️</span>
            {photo ? "Changer la photo" : "Choisir une photo"}
          </label>
          <p className={`text-xs ${colors.text.tertiary} text-center`}>
            Photo claire de votre visage · Max 5 Mo
          </p>
        </div>
      </div>

      {/* Message uniquement après un vrai upload */}
      {justUploaded && (
        <div
          className={`mt-3 flex items-center gap-2 text-xs ${colors.secondary.text} ${colors.secondary.bg} px-3 py-1.5 rounded-lg`}
        >
          <span>✓</span> Photo ajoutée avec succès
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoUpload;
