"use client";

import Link from "next/link";
import React from "react";
import Logo from "@/components/Logo";

interface AuthLayoutProps {
  variant?: "client" | "prestataire" | "neutral";
  children: React.ReactNode;
}

export default function AuthLayout({
  variant = "neutral",
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Carte blanche avec contenu */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo Tasky en haut à gauche DANS la carte */}
          <div className="mb-8">
            <Link href="/" className="inline-block hover:opacity-80 transition">
              <Logo linkable={false} />
            </Link>
          </div>

          {/* Contenu de la page */}
          {children}
        </div>
      </div>
    </div>
  );
}
