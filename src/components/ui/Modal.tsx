"use client";

import React, { useRef, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: React.ReactNode;
  headerVariant?: "premium" | "primary" | "secondary" | "error" | "success";
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

const headerGradients = {
  premium: "bg-gradient-to-r from-indigo-500 to-purple-600",
  primary: "bg-gradient-to-r from-pink-500 to-pink-600",
  secondary: "bg-gradient-to-r from-emerald-500 to-teal-600",
  error: "bg-gradient-to-r from-red-500 to-red-600",
  success: "bg-gradient-to-r from-green-500 to-emerald-600",
};

const maxWidths = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  headerVariant = "premium",
  children,
  maxWidth = "sm",
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const justOpened = useRef(false);

  useEffect(() => {
    if (isOpen) {
      justOpened.current = true;
      const timer = setTimeout(() => {
        justOpened.current = false;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (justOpened.current) return;

    // ne fermer que si on clique sur l'overlay
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidths[maxWidth]} overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || icon) && (
          <div
            className={`${headerGradients[headerVariant]} px-6 py-5 text-center`}
          >
            {icon && <div className="text-4xl mb-2">{icon}</div>}
            {title && (
              <h2 className="text-white font-bold text-lg leading-tight">
                {title}
              </h2>
            )}
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
