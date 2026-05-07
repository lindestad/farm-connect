import { useOrderPayment } from "@/hooks/useOrderPayment";
import {
  confirmOrder,
  createOrder,
  createPendingOrder,
  type DeliveryMethod,
  updateOrderStatus,
} from "@/lib/checkout/order";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/providers/cart-provider";
import { checkoutStyles as styles } from "@/styles/checkout-styles";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Checkout() {
  const { session } = useAuth();
  const router = useRouter();
  const { cartItems, clearCart, removeItem } = useCart();
  const farm_id = cartItems[0]?.farm_id ?? "";

  const [delivery, setDelivery] = useState<DeliveryMethod>("pickup");
  const [pickupNotes, setPickupNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [reserved, setReserved] = useState(false);

  // Populated by handleBuyNow before Stripe is invoked; consumed by the
  // post-payment effect to confirm the order and decrement stock.
  const pendingRef = useRef<{
    orderId: string;
    farmId: string;
    deliveryMethod: DeliveryMethod;
    totalPrice: number;
    items: { produce_id?: string; qty: number }[];
  } | null>(null);
  const submittedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setReserved(false);
    }, []),
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price_per_unit * item.qty,
    0,
  );
  const { handlePayment, paymentSuccess, paymentError, processing } =
    useOrderPayment(subtotal);

  useEffect(() => {
    if (!paymentError) return;
    Alert.alert("Payment failed", paymentError);
  }, [paymentError]);

  useEffect(() => {
    if (!paymentSuccess) return;
    if (!session?.user.id) return;
    if (submittedRef.current) return;
    submittedRef.current = true;

    const pending = pendingRef.current;
    if (!pending) return;

    confirmOrder(
      pending.orderId,
      pending.farmId,
      pending.items,
      session.access_token,
    )
      .then(() => {
        supabase?.functions.invoke("notify-payment-success", {
          body: {
            user_id: session!.user.id,
            delivery_method: pending.deliveryMethod,
            amount: pending.totalPrice,
          },
          headers: { Authorization: `Bearer ${session!.access_token}` },
        });
        clearCart();
        setPickupNotes("");
        router.replace("/");
      })
      .catch(() => {
        submittedRef.current = false;
        Alert.alert(
          "Order failed",
          "Payment succeeded but order could not be confirmed. Please contact support.",
        );
      });
  }, [paymentSuccess, session, router, clearCart]);

  // Creates the pending order first, then launches Stripe. This ensures an
  // orders row exists before any payment attempt, so the edge function can
  // validate the amount via order_id (see DEPENDENCY comment in useOrderPayment).
  // If the user cancels, the order stays in pending state — add a cleanup job
  // or cancel it explicitly once the edge-function side (#2) is implemented.
  async function handleBuyNow() {
    if (!session?.user.id || processing) return;

    const items = cartItems.map((item) => ({
      produce_id: item.produce_id,
      produce_name: item.produce_name,
      qty: item.qty,
      unit: item.unit,
      price: item.price_per_unit * item.qty,
    }));

    let order;
    try {
      order = await createPendingOrder({
        customer_id: session.user.id,
        farm_id,
        delivery_method: delivery,
        pickup_notes: pickupNotes,
        items,
      });
    } catch {
      Alert.alert("Error", "Could not initialise order. Please try again.");
      return;
    }

    pendingRef.current = {
      orderId: order.id,
      farmId: farm_id,
      deliveryMethod: delivery,
      totalPrice: subtotal,
      items: items.map((i) => ({ produce_id: i.produce_id, qty: i.qty })),
    };
    submittedRef.current = false;

    const result = await handlePayment(order.id);
    if (result !== "success") {
      try {
        await updateOrderStatus(order.id, "cancelled");
      } catch {
        // best-effort; order stays pending until a cleanup job handles it
      }
    }
  }

  async function handleReserve() {
    if (!session?.user.id) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    const items = cartItems.map((item) => ({
      produce_id: item.produce_id,
      produce_name: item.produce_name,
      qty: item.qty,
      unit: item.unit,
      price: item.price_per_unit * item.qty,
    }));

    setLoading(true);
    try {
      const order = await createOrder({
        customer_id: session.user.id,
        farm_id,
        delivery_method: "reservation",
        pickup_notes: pickupNotes,
        items,
        accessToken: session.access_token,
      });
      supabase?.functions.invoke("notify-payment-success", {
        body: {
          user_id: session.user.id,
          delivery_method: order.delivery_method,
          amount: order.total_price,
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      clearCart();
      setPickupNotes("");
      setReserved(true);
    } catch {
      Alert.alert(
        "Reservation failed",
        "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (cartItems.length === 0 && !reserved) {
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Browse produce to add items.</Text>
          <Pressable
            accessibilityRole="button"
            style={styles.buyButton}
            onPress={() => router.replace("/(tabs)/produce")}
          >
            <Text style={styles.buyButtonText}>Browse Produce</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          <Text style={styles.pageTitle}>Checkout</Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>YOUR ORDER</Text>
            {cartItems.map((item) => (
              <View key={item.produce_id} style={styles.produceRow}>
                <View style={styles.produceInfo}>
                  <Text style={styles.produceName}>{item.produce_name}</Text>
                  <Text style={styles.produceMeta}>
                    {item.qty} {item.unit}
                  </Text>
                </View>
                <View style={styles.produceRowRight}>
                  <Text style={styles.producePrice}>
                    {item.price_per_unit * item.qty} kr
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => removeItem(item.produce_id)}
                    hitSlop={8}
                  >
                    <Text style={styles.removeButton}>✕</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DELIVERY METHOD</Text>
            <View style={styles.toggleRow}>
              <Pressable
                accessibilityRole="button"
                style={[
                  styles.toggleButton,
                  delivery === "pickup" && styles.toggleActive,
                ]}
                onPress={() => setDelivery("pickup")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    delivery === "pickup" && styles.toggleTextActive,
                  ]}
                >
                  Pickup
                </Text>
                <Text
                  style={[
                    styles.toggleSub,
                    delivery === "pickup" && styles.toggleSubActive,
                  ]}
                >
                  Collect at farm
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={[
                  styles.toggleButton,
                  delivery === "reservation" && styles.toggleActive,
                ]}
                onPress={() => setDelivery("reservation")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    delivery === "reservation" && styles.toggleTextActive,
                  ]}
                >
                  Reserve
                </Text>
                <Text
                  style={[
                    styles.toggleSub,
                    delivery === "reservation" && styles.toggleSubActive,
                  ]}
                >
                  Hold for later
                </Text>
              </Pressable>
            </View>

            {delivery === "pickup" && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Pick up your order directly at the farm. Bring your
                  confirmation.
                </Text>
              </View>
            )}
            {delivery === "reservation" && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  We will hold your items for 48 hours. Payment at pickup.
                </Text>
              </View>
            )}

            <TextInput
              style={styles.notesInput}
              placeholder="Add a note for the farmer (optional)"
              placeholderTextColor="#9AA89D"
              value={pickupNotes}
              onChangeText={setPickupNotes}
              multiline
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SUMMARY</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Items ({cartItems.length})
              </Text>
              <Text style={styles.summaryValue}>{subtotal} kr</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={styles.summaryValue}>Free</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{subtotal} kr</Text>
            </View>
          </View>
        </ScrollView>

        <Modal visible={reserved} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.reservedTitle}>Items Reserved</Text>
              <Text style={styles.reservedText}>
                Your items are held for 48 hours. Pay at pickup.
              </Text>
              <Pressable
                accessibilityRole="button"
                style={styles.buyButton}
                onPress={() => router.replace("/")}
              >
                <Text style={styles.buyButtonText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {!reserved && (
          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              style={styles.buyButton}
              onPress={delivery === "pickup" ? handleBuyNow : handleReserve}
              disabled={loading || processing}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buyButtonText}>
                  {delivery === "reservation" ? "Reserve Now" : "Buy Now"} ·{" "}
                  {subtotal} kr
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
