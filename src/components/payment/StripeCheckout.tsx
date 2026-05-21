"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/Button";
import { colors } from "@/config/colors";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

// ─── Formulaire interne ───────────────────────────────────────────────────────

function CheckoutForm({
  montant,
  prestationId,
  clientInfo,
  onSuccess,
  onError,
}: {
  montant: number;
  prestationId: string;
  clientInfo: { name: string; email: string; phone: string };
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsPaying(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message ?? "Paiement échoué");
      setIsPaying(false);
      return;
    }

    if (!paymentIntent?.id) {
      onError("Référence de paiement manquante — contactez le support");
      setIsPaying(false);
      return;
    }

    // Confirmer côté backend pour passer la prestation EN_COURS
    try {
      await apiClient.post("/api/payment/confirm", {
        prestationId,
        paymentIntentId: paymentIntent.id,
      });
    } catch (err: any) {
      console.error("[confirm]", err?.response?.data || err);
      onError(err?.response?.data?.message ?? "Paiement reçu mais erreur lors de la mise à jour. Contactez le support.");
      setIsPaying(false);
      return;
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement
        options={{
          defaultValues: {
            billingDetails: {
              name: clientInfo.name,
              email: clientInfo.email,
              phone: clientInfo.phone,
            },
          },
        }}
      />

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>🔒</span>
        <span>Paiement sécurisé par Stripe — vos données ne transitent pas par nos serveurs</span>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isPaying || !stripe || !elements}
      >
        💳 Payer {montant} €
      </Button>
    </form>
  );
}

// ─── Export principal ─────────────────────────────────────────────────────────

export function StripeCheckout({
  clientSecret,
  montant,
  prestationId,
  clientInfo,
  onSuccess,
  onError,
}: {
  clientSecret: string;
  montant: number;
  prestationId: string;
  clientInfo: { name: string; email: string; phone: string };
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  if (!clientSecret) {
    return (
      <div className={`flex items-center justify-center py-8 ${colors.text.muted}`}>
        <div className={`animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 ${colors.primary.border} mr-3`} />
        Préparation du paiement…
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: { colorPrimary: "#ec4899", borderRadius: "12px" },
        },
        locale: "fr",
      }}
    >
      <CheckoutForm montant={montant} prestationId={prestationId} clientInfo={clientInfo} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
