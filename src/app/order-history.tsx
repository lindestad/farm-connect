import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  fetchOrderItems,
  fetchOrdersByCustomer,
  type Order,
  type OrderItem,
} from "../lib/checkout/order";
import { useAuth } from "../providers/auth-provider";

function formatTimestamp(value: string | null | undefined) {
  if (!value) return "Unavailable";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unavailable";
  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OrderCard({ order }: { order: Order }) {
  const isPickup = order.delivery_method === "pickup";
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    fetchOrderItems(order.id)
      .then(setItems)
      .catch(() => {});
  }, [order.id]);

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeading}>
        <Text style={styles.orderTitle}>Order #{order.id.slice(0, 8)}</Text>
        <Text style={styles.orderValue}>{order.total_price} kr</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Status</Text>
          <Text style={styles.metaValue}>{order.status}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Delivery</Text>
          <Text style={styles.metaValue}>{order.delivery_method}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Placed</Text>
          <Text style={styles.metaValue}>
            {formatTimestamp(order.created_at)}
          </Text>
        </View>
        {order.expires_at ? (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Expires</Text>
            <Text style={styles.metaValue}>
              {formatTimestamp(order.expires_at)}
            </Text>
          </View>
        ) : null}
      </View>

      {isPickup && order.pickup_notes ? (
        <View style={styles.notesBlock}>
          <Text style={styles.metaLabel}>Pickup notes</Text>
          <Text style={styles.notesValue}>{order.pickup_notes}</Text>
        </View>
      ) : null}

      {items.length > 0 ? (
        <View style={styles.itemsBlock}>
          <Text style={styles.metaLabel}>Items</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.produce_name}</Text>
              <Text style={styles.itemDetail}>
                {item.qty} {item.unit} · {item.price} kr
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
export default function OrderHistoryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const result = await fetchOrdersByCustomer(user.id);
        setOrders(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load order history.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [user?.id]);

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.screenTitle}>Order history</Text>
          <Text style={styles.screenBody}>
            Your past purchases and pickup reservations from FarmConnect.
          </Text>
        </View>

        {loading ? (
          <View style={styles.statePanel}>
            <ActivityIndicator color="#2F6A3E" />
            <Text style={styles.stateText}>Loading orders...</Text>
          </View>
        ) : error ? (
          <View style={styles.statePanel}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.statePanel}>
            <Text style={styles.stateText}>No orders yet.</Text>
            <Text style={styles.stateBody}>
              Place an order from the checkout screen to see it here.
            </Text>
          </View>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const shadow = {
  boxShadow: "0px 18px 40px rgba(26, 41, 30, 0.08)",
} as const;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F4F5EF",
  },
  scrollContent: {
    gap: 16,
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  header: {
    gap: 6,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF5EB",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 6,
  },
  backButtonText: {
    color: "#214C2D",
    fontSize: 13,
    fontWeight: "700",
  },
  screenTitle: {
    color: "#182019",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  screenBody: {
    color: "#5D6A60",
    fontSize: 14,
    lineHeight: 21,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DFE4DB",
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    padding: 18,
    ...shadow,
  },
  orderHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTitle: {
    color: "#182019",
    fontSize: 16,
    fontWeight: "800",
  },
  orderValue: {
    color: "#21432D",
    fontSize: 16,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: "#EDF1EB",
  },
  metaGrid: {
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: {
    color: "#5D6A60",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  metaValue: {
    color: "#445148",
    fontSize: 14,
  },
  notesBlock: {
    backgroundColor: "#F7FBF5",
    borderColor: "#D7E2D3",
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  notesValue: {
    color: "#213025",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  itemsBlock: {
    gap: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F7FBF5",
    borderColor: "#D7E2D3",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itemName: {
    color: "#182019",
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 1,
  },
  itemDetail: {
    color: "#445148",
    fontSize: 13,
    marginLeft: 8,
  },
  statePanel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DFE4DB",
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
    padding: 24,
    ...shadow,
  },
  stateText: {
    color: "#182019",
    fontSize: 16,
    fontWeight: "700",
  },
  stateBody: {
    color: "#5D6A60",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  errorText: {
    color: "#9C5B4D",
    fontSize: 14,
    lineHeight: 20,
  },
});
