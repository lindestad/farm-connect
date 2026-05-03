import { useOrderPayment } from "@/hooks/useOrderPayment";
import { createOrder } from "@/lib/checkout/order";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import { useCart } from "@/providers/cart-provider";
import { checkoutStyles as styles } from "@/styles/checkout-styles";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// TODO: replace with real farm_id from farm inventory when per-farm produce is implemented
const MOCK_FARM_ID = "005eb263-c5d6-42fc-bae5-47847b952c1a";

type DeliveryMethod = "pickup" | "reservation";

export default function Checkout() {
  const farm_id = MOCK_FARM_ID;
  const { session } = useAuth();
  const router = useRouter();
  const { cartItems, clearCart, removeItem } = useCart();

  const [delivery, setDelivery] = useState<DeliveryMethod>("pickup");
  const deliveryRef = useRef(delivery);
  useEffect(() => {
    deliveryRef.current = delivery;
  }, [delivery]);

  const [pickupNotes, setPickupNotes] = useState("");
  const pickupNotesRef = useRef(pickupNotes);
  useEffect(() => {
    pickupNotesRef.current = pickupNotes;
  }, [pickupNotes]);

  // Capture cart items at payment time to avoid stale closure in payment effect
  const cartItemsRef = useRef(cartItems);
  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  const [loading, setLoading] = useState(false);
  const [reserved, setReserved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setReserved(false);
    }, []),
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price_per_unit * item.qty,
    0,
  );
  const { handlePayment, paymentSuccess, paymentError } =
    useOrderPayment(subtotal);

  useEffect(() => {
    if (!paymentError) return;
    Alert.alert("Payment failed", paymentError);
  }, [paymentError]);

  useEffect(() => {
    if (!paymentSuccess) return;

    const items = cartItemsRef.current.map((item) => ({
      produce_name: item.produce_name,
      qty: item.qty,
      unit: item.unit,
      price: item.price_per_unit * item.qty,
    }));

    createOrder({
      customer_id: session!.user.id,
      farm_id,
      delivery_method: deliveryRef.current,
      pickup_notes: pickupNotesRef.current,
      items,
    })
      .then((order) => {
        supabase?.functions.invoke("notify-payment-success", {
          body: {
            user_id: session!.user.id,
            delivery_method: order.delivery_method,
            amount: order.total_price,
          },
          headers: { Authorization: `Bearer ${session!.access_token}` },
        });
        clearCart();
        setPickupNotes("");
        router.replace("/");
      })
      .catch(() =>
        Alert.alert(
          "Order failed",
          "Payment succeeded but order could not be saved. Please contact support.",
        ),
      );
  }, [paymentSuccess, session, farm_id, router, clearCart]);

  async function handleReserve() {
    if (!session?.user.id) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    const items = cartItems.map((item) => ({
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
    <SafeAreaView style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
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
            <Text style={styles.summaryLabel}>Items ({cartItems.length}) </Text>
            <Text style={styles.summaryValue}>{subtotal} kr </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery </Text>
            <Text style={styles.summaryValue}>Free </Text>
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
            style={styles.buyButton}
            onPress={delivery === "pickup" ? handlePayment : handleReserve}
            disabled={loading}
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
  );
}
