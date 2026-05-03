import { StripeProvider } from "@stripe/stripe-react-native";
import * as Notifications from "expo-notifications";
import { Stack, usePathname, useRouter, type Href } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { AuthProvider, useAuth } from "../providers/auth-provider";
import { CartProvider, useCart } from "../providers/cart-provider";

// Configure how notifications are displayed when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/confirm"];

function RootNavigator() {
  const { isLoading, session } = useAuth();
  const { clearCart } = useCart();
  usePushNotifications();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!session) clearCart();
  }, [session, clearCart]);

  useEffect(() => {
    if (isLoading) return;

    if (!session && !AUTH_ROUTES.includes(pathname)) {
      router.replace("/auth/login" as Href);
      return;
    }

    if (session && AUTH_ROUTES.includes(pathname)) {
      router.replace("/account" as Href);
      return;
    }

    if (session && pathname === "/") {
      router.replace("/(tabs)" as Href);
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
      <CartProvider>
        <StripeProvider
          publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
        >
          <RootNavigator />
        </StripeProvider>
      </CartProvider>
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
