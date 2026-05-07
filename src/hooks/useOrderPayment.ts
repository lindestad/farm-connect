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
  const [processing, setProcessing] = useState(false);

  // orderId is forwarded to create-payment-intent so the server can validate the amount.
  // DEPENDENCY: edge-function fix #2 must verify the JWT and look up orders.total_price
  // using this order_id instead of trusting the client-supplied amount.
  const handlePayment = async (
    orderId?: string,
  ): Promise<"success" | "cancelled" | "failed"> => {
    if (processing) return "failed";
    setProcessing(true);
    setPaymentError(null);

    if (!supabase) {
      setPaymentError("Supabase is not configured");
      setProcessing(false);
      return "failed";
    }
    if (!session?.access_token) {
      Alert.alert("Not authenticated", "Please log in to continue.");
      setProcessing(false);
      return "failed";
    }

    const { error: initError } = await initPaymentSheet({
      merchantDisplayName: "FarmConnect",
      googlePay: {
        merchantCountryCode: "NO",
        testEnv: __DEV__,
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
              body: {
                amount: Math.round(amountInNOK * 100),
                currency: "nok",
                ...(orderId ? { order_id: orderId } : {}),
              },
              headers: { Authorization: `Bearer ${session?.access_token}` },
            },
          );

          if (error || !data?.clientSecret) {
            onPaymentResult({
              error: {
                code: "Failed",
                message: error?.message ?? "Payment failed",
              },
            });
            return;
          }

          onPaymentResult({ clientSecret: data.clientSecret });
        },
      },
    });

    if (initError) {
      setPaymentError(initError.message);
      setProcessing(false);
      return "failed";
    }

    const { error: payError } = await presentPaymentSheet();
    setProcessing(false);
    if (payError?.code === "Canceled") return "cancelled";
    if (payError) {
      setPaymentError(payError.message);
      return "failed";
    }
    setPaymentSuccess(true);
    return "success";
  };

  const resetPayment = () => {
    setPaymentSuccess(false);
    setPaymentError(null);
  };

  return {
    handlePayment,
    paymentSuccess,
    paymentError,
    processing,
    resetPayment,
  };
}
