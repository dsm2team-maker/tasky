"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import HeaderPrestataire from "@/components/headers/HeaderPrestataire";
import DirectChat from "@/components/chat/DirectChat";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";

export default function PrestataireDirectConversationPage() {
  useAuthGuard();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderPrestataire />
      <main className={`${spacing.container} py-8 max-w-2xl`}>
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 text-sm ${colors.text.secondary} mb-6`}
        >
          ← Retour
        </button>
        <DirectChat conversationId={id} />
      </main>
    </div>
  );
}
