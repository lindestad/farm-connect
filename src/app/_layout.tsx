import { Stack, usePathname, useRouter, type Href } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { StripeProvider } from "@stripe/stripe-react-native";
import { AuthProvider, useAuth } from "../providers/auth-provider";

function RootNavigator() {
  const { isLoading, session } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (pathname === "/") {
      router.replace("/(tabs)" as Href);
      return;
    }

    if (!session && pathname === "/account") {
      router.replace("/auth/login" as Href);
      return;
    }

    if (
      session &&
      (pathname === "/auth/login" || pathname === "/auth/register")
    ) {
      router.replace("/account" as Href);
    }
  }, [isLoading, pathname, router, session]);

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color="#2F6A3E" size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "#F6F7F3",
        },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      >
        <RootNavigator />
      </StripeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F7F3",
  },
});
