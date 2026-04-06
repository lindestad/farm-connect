import { Link, type Href } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../providers/auth-provider";

export default function DashboardScreen() {
  const { profile } = useAuth();
  const isFarmer = profile?.role === "farmer";

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
            <Text style={styles.panelTitle}>Ready for launch</Text>
            <Text style={styles.panelBody}>
              The dashboard page is in place. Add market-day and pickup
              management components next.
            </Text>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          <Link href={'/account' as Href} style={styles.footerLink}>
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
  footerRow: {
    alignItems: "center",
    marginTop: 16,
  },
  footerLink: {
    color: "#2F6A3E",
    fontWeight: "700",
    fontSize: 15,
  },
});
