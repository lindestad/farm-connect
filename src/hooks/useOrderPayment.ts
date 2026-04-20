import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import { useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";
import { Alert } from "react-native";

export function useOrderPayment(amountInNOK: number) {
  const { session } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePayment = async () => {
    setPaymentError(null);

    if (!supabase) {
      setPaymentError("Supabase is not configured");
      return;
    }
    if (!session?.access_token) {
      Alert.alert("Not authenticated", "Please log in to continue.");
      return;
    }

    const { error: initError } = await initPaymentSheet({
      merchantDisplayName: "FarmConnect",
      googlePay: {
        merchantCountryCode: "NO",
        testEnv: true,
      },
      // Apple Pay can be configured similarly if needed, also enable it in App.json
      intentConfiguration: {
        mode: {
          amount: Math.round(amountInNOK * 100), // Stripe expects amounts in the smallest currency unit
          currencyCode: "NOK",
        },
        confirmHandler: async (
          _paymentMethod,
          _shouldSavePaymentMethod,
          onPaymentResult,
        ) => {
          // Call Supabase edge function to create a payment intent
          const { data, error } = await supabase!.functions.invoke(
            "create-payment-intent",
            {
              body: { amount: Math.round(amountInNOK * 100), currency: "nok" },
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

    if (initError) {
      setPaymentError(initError.message);
      return;
    }

    const { error: payError } = await presentPaymentSheet();
    if (payError?.code === "Canceled") return;
    if (payError) {
      setPaymentError(payError.message);
      return;
    }
    setPaymentSuccess(true);
  };

  return { handlePayment, paymentSuccess, paymentError };
}
