import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Slot, useRouter, type Href } from "expo-router";

import { useAuth } from "../../providers/auth-provider";

export default function FarmerDashboardLayout() {
  const { profile, profileLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (profileLoading) return;
    if (profile?.role !== "farmer") {
      router.replace("/(tabs)" as Href);
    }
  }, [profile, profileLoading, router]);

  if (profileLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#2F6A3E" size="large" />
      </View>
    );
  }

  if (profile?.role !== "farmer") {
    return null;
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F7F3",
  },
});
