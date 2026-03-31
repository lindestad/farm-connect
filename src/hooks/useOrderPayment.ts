import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import { useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";

export function useOrderPayment(amountInNOK: number) {
  const { session } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayment = async () => {
    if (!supabase) throw new Error("Supabase is not configured");

    const { error: initError } = await initPaymentSheet({
      merchantDisplayName: "FarmConnect",
      intentConfiguration: {
        mode: {
          amount: amountInNOK * 100, // Stripe expects amounts in the smallest currency unit
          currencyCode: "NOK",
        },
        confirmHandler: async (
          paymentMethod,
          shouldSavePaymentMethod,
          onPaymentResult,
        ) => {
          // Call Supabase edge function to create a payment intent
          const { data, error } = await supabase!.functions.invoke(
            "create-payment-intent",
            {
              body: { amount: amountInNOK * 100, currency: "nok" },
              headers: { Authorization: `Bearer ${session?.access_token}` },
            },
          );

          if (error || !data?.clientSecret) {
            onPaymentResult({
              error: { code: "Failed", message: "Payment failed" },
            });
            return;
          }

          onPaymentResult({ clientSecret: data.clientSecret });
        },
      },
    });

    if (initError) throw new Error(initError.message);

    const { error: payError } = await presentPaymentSheet();
    if (payError?.code === "Canceled") return;
    if (payError) throw new Error(payError.message);
    setPaymentSuccess(true);
  };

  return { handlePayment, paymentSuccess };
}
