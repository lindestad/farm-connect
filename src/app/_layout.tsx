import { StripeProvider } from "@stripe/stripe-react-native";
import * as Notifications from "expo-notifications";
import { Stack, usePathname, useRouter } from "expo-router";
import { Component, type ReactNode, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { AuthProvider, useAuth } from "../providers/auth-provider";
import { CartProvider, useCart } from "../providers/cart-provider";

const AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/confirm",
  "/auth/forgot-password",
  "/auth/reset-password",
];
const SESSION_REDIRECT_AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/confirm",
  "/auth/forgot-password",
];

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorScreen}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>
            Please restart the app. If the problem persists, contact support.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// Configure how notifications are displayed when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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
      router.replace("/auth/login");
      return;
    }

    if (session && SESSION_REDIRECT_AUTH_ROUTES.includes(pathname)) {
      router.replace("/(tabs)");
      return;
    }

    if (session && pathname === "/") {
      router.replace("/(tabs)");
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
    <AppErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <StripeProvider
            publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
          >
            <RootNavigator />
          </StripeProvider>
        </CartProvider>
      </AuthProvider>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F7F3",
  },
  errorScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F7F3",
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A2E1F",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#5A7A63",
    textAlign: "center",
  },
});
