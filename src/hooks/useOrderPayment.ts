/**
 * useOrderPayment
 *
 * Handles the Stripe payment flow for a given order amount.
 *
 * Usage:
 * const { handlePayment, paymentSuccess } = useOrderPayment(amount);
 *
 * - amount: the order total in NOK (not øre)
 * - handlePayment: call this when the user taps "Pay Now"
 * - paymentSuccess: true after a successful payment
 *
 * When real products are added:
 * - Replace MOCK_ORDER in order-screen.tsx with real product data
 * - Pass the real order total as amountInNOK
 * - After paymentSuccess, update the order status in Supabase
 */

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import { useStripe } from "@stripe/stripe-react-native";
import { useState } from "react";
import { Alert } from "react-native";

export function useOrderPayment(amountInNOK: number) {
  const { session } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayment = async () => {
    if (!supabase) throw new Error("Supabase is not configured");
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
