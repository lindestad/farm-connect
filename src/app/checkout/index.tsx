import { useOrderPayment } from "@/hooks/useOrderPayment";
import { createOrder } from "@/lib/checkout/order";
import { useAuth } from "@/providers/auth-provider";
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

// TODO: replace with real produce listings from farm inventory
// When inventory for each farm is implemented, this page should receive the
// farm_id and fetch the items from the backend instead of using mock data
const MOCK_FARM_ID = "005eb263-c5d6-42fc-bae5-47847b952c1a"; // Phonero Farm AS

const MOCK_ITEMS = [
  { id: "1", produce_name: "Tomatoes", qty: 2, unit: "kg", price: 35 },
];

type DeliveryMethod = "pickup" | "reservation";

export default function Checkout() {
  const farm_id = MOCK_FARM_ID;
  const { session } = useAuth();
  const router = useRouter();

  const [delivery, setDelivery] = useState<DeliveryMethod>("pickup");
  const [pickupNotes, setPickupNotes] = useState("");
  const pickupNotesRef = useRef(pickupNotes);
  useEffect(() => {
    pickupNotesRef.current = pickupNotes;
  }, [pickupNotes]);
  const [loading, setLoading] = useState(false);
  const [reserved, setReserved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setReserved(false);
    }, []),
  );

  const subtotal = MOCK_ITEMS.reduce((sum, item) => sum + item.price, 0);
  const { handlePayment, paymentSuccess } = useOrderPayment(subtotal);

  // After Stripe payment succeeds, create the order and navigate back
  useEffect(() => {
    if (!paymentSuccess) return;

    createOrder({
      customer_id: session!.user.id,
      farm_id,
      delivery_method: "pickup",
      pickup_notes: pickupNotesRef.current,
      items: MOCK_ITEMS,
    })
      .then(() => {
        setPickupNotes("");
        router.replace("/");
      })
      .catch(() =>
        Alert.alert(
          "Order failed",
          "Payment succeeded but order could not be saved. Please contact support.",
        ),
      );
  }, [paymentSuccess, session, farm_id, router]);

  async function handleReserve() {
    if (!session?.user.id) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    setLoading(true);
    try {
      await createOrder({
        customer_id: session.user.id,
        farm_id,
        delivery_method: "reservation",
        pickup_notes: pickupNotes,
        items: MOCK_ITEMS,
      });
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

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Checkout</Text>

        {/* Produce list */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR ORDER</Text>
          {MOCK_ITEMS.map((item) => (
            <View key={item.id} style={styles.produceRow}>
              <View style={styles.produceInfo}>
                <Text style={styles.produceName}>{item.produce_name}</Text>
                <Text style={styles.produceMeta}>
                  {item.qty} {item.unit}
                </Text>
              </View>
              <Text style={styles.producePrice}>{item.price} kr</Text>
            </View>
          ))}
        </View>

        {/* Delivery method */}
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

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Items ({MOCK_ITEMS.length}){" "}
            </Text>
            <Text style={styles.summaryValue}> {subtotal} kr </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery </Text>
            <Text style={styles.summaryValue}>Free </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total </Text>
            <Text style={styles.totalValue}>{subtotal} kr </Text>
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
