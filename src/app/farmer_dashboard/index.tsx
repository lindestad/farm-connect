import { supabase } from "@/lib/supabase";
import { Link, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../providers/auth-provider";

type DashboardSummary = {
  marketDays: number;
  pickupSlots: number;
  inventoryItems: number;
  nextMarket: string | null;
  nextPickup: string | null;
};

const EMPTY_SUMMARY: DashboardSummary = {
  marketDays: 0,
  pickupSlots: 0,
  inventoryItems: 0,
  nextMarket: null,
  nextPickup: null,
};

function dateToStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(timeStr: string): string {
  return timeStr ? timeStr.slice(0, 5) : "";
}

export default function DashboardScreen() {
  const { profile, user } = useAuth();
  const isFarmer = profile?.role === "farmer";
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!isFarmer || !user || !supabase) {
      setSummary(EMPTY_SUMMARY);
      setSummaryLoading(false);
      return;
    }

    setSummaryLoading(true);
    setSummaryError(null);
    const today = dateToStr(new Date());

    const [marketResult, inventoryResult, slotsResult] = await Promise.all([
      supabase
        .from("market_days")
        .select("id,date,start_time,location")
        .eq("farmer_id", user.id)
        .gte("date", today)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true }),
      supabase
        .from("pickup_inventory")
        .select("id,produce_name,available_quantity,unit,is_available")
        .eq("farmer_id", user.id)
        .eq("is_available", true)
        .gt("available_quantity", 0)
        .order("produce_name", { ascending: true }),
      supabase
        .from("pickup_time_slots")
        .select("id,slot_date,start_time,end_time,location")
        .eq("farmer_id", user.id)
        .gte("slot_date", today)
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true }),
    ]);

    if (marketResult.error || inventoryResult.error || slotsResult.error) {
      setSummaryError("Unable to load dashboard overview.");
      setSummary(EMPTY_SUMMARY);
    } else {
      const marketDays = marketResult.data ?? [];
      const inventoryItems = inventoryResult.data ?? [];
      const pickupSlots = slotsResult.data ?? [];
      const nextMarket = marketDays[0]
        ? `${formatDate(marketDays[0].date)} at ${formatTime(marketDays[0].start_time)}`
        : null;
      const nextPickup = pickupSlots[0]
        ? `${formatDate(pickupSlots[0].slot_date)} at ${formatTime(pickupSlots[0].start_time)}`
        : null;

      setSummary({
        marketDays: marketDays.length,
        pickupSlots: pickupSlots.length,
        inventoryItems: inventoryItems.length,
        nextMarket,
        nextPickup,
      });
    }

    setSummaryLoading(false);
  }, [isFarmer, user]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Farmer dashboard</Text>
          <Text style={styles.heroBody}>
            {isFarmer
              ? "Manage your market days, pickup windows, and produce inventory from here."
              : "This area is intended for farmer accounts. If you need access, update your profile role."}
          </Text>
        </View>

        {isFarmer ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Planning Overview</Text>
            {summaryLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#2F6A3E" />
                <Text style={styles.panelBody}>
                  Loading dashboard overview...
                </Text>
              </View>
            ) : summaryError ? (
              <Text style={styles.errorText}>{summaryError}</Text>
            ) : (
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Market days</Text>
                  <Text style={styles.summaryValue}>{summary.marketDays}</Text>
                  <Text style={styles.summaryMeta}>
                    {summary.nextMarket ?? "Nothing scheduled"}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Pickup slots</Text>
                  <Text style={styles.summaryValue}>{summary.pickupSlots}</Text>
                  <Text style={styles.summaryMeta}>
                    {summary.nextPickup ?? "No open slots"}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Inventory</Text>
                  <Text style={styles.summaryValue}>
                    {summary.inventoryItems}
                  </Text>
                  <Text style={styles.summaryMeta}>Available products</Text>
                </View>
              </View>
            )}
          </View>
        ) : null}

        {isFarmer ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Market Management</Text>
            <Text style={styles.panelBody}>
              Create and update upcoming market days, locations, and notes.
            </Text>
            <Link
              href={"/farmer_dashboard/market" as Href}
              style={styles.panelButton}
            >
              <Text style={styles.panelButtonText}>
                Go to Market Management
              </Text>
            </Link>
          </View>
        ) : null}

        {isFarmer ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Pickup Management</Text>
            <Text style={styles.panelBody}>
              Manage pickup inventory quantities and customer collection slots.
            </Text>
            <Link
              href={"/farmer_dashboard/pickup-inventory" as Href}
              style={styles.panelButton}
            >
              <Text style={styles.panelButtonText}>Go to Pickup Inventory</Text>
            </Link>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <Link href={"/account" as Href} style={styles.footerLink}>
            Back to profile
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F6F7F3",
  },
  content: {
    padding: 24,
    gap: 20,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#182019",
    marginBottom: 12,
  },
  heroBody: {
    fontSize: 16,
    lineHeight: 24,
    color: "#3E4C42",
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#182019",
    marginBottom: 8,
  },
  panelBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4D5B50",
  },
  loadingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  summaryGrid: {
    gap: 10,
  },
  summaryItem: {
    backgroundColor: "#F7FBF5",
    borderColor: "#D7E2D3",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  summaryLabel: {
    color: "#5D6A60",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  summaryValue: {
    color: "#182019",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 4,
  },
  summaryMeta: {
    color: "#4D5B50",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  panelButton: {
    marginTop: 16,
    backgroundColor: "#2F6A3E",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  panelButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  footerRow: {
    alignItems: "center",
    marginTop: 16,
  },
  footerLink: {
    color: "#2F6A3E",
    fontWeight: "700",
    fontSize: 15,
  },
  errorText: {
    color: "#9C5B4D",
    fontSize: 14,
    lineHeight: 20,
  },
});
