import { Link, type Href, useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { AuthScreenShell } from "../../components/auth-screen-shell";
import { useAuth } from "../../providers/auth-provider";

export default function ConfirmEmailScreen() {
  const { authLinkMessage, authLinkStatus, clearAuthLinkState, user } =
    useAuth();
  const router = useRouter();

  useEffect(() => {
    return () => {
      clearAuthLinkState();
    };
  }, [clearAuthLinkState]);

  return (
    <AuthScreenShell
      eyebrow="Email confirmation"
      title={
        authLinkStatus === "success"
          ? "Your email link worked."
          : "Open the confirmation link from your inbox."
      }
      subtitle={
        authLinkStatus === "success"
          ? "FarmConnect can now keep your session on this device."
          : "Supabase will redirect back into the app when the link is tapped."
      }
      footer={
        <Text style={styles.footerText}>
          Need a different step?{" "}
          <Link href={"/auth/login" as Href} style={styles.footerLink}>
            Go to login
          </Link>
        </Text>
      }
    >
      <Text style={styles.messageText}>
        {authLinkMessage ??
          "After you confirm your email, this screen will update and you can continue into the app."}
      </Text>
      {user?.email ? (
        <Text style={styles.metaText}>Signed in as {user.email}</Text>
      ) : null}
      <Pressable
        onPress={() =>
          router.replace((user ? "/account" : "/auth/login") as Href)
        }
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>
          {user ? "Continue to account" : "Back to login"}
        </Text>
      </Pressable>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  messageText: {
    color: "#5D6A60",
    fontSize: 15,
    lineHeight: 23,
  },
  metaText: {
    color: "#2F6A3E",
    fontSize: 13,
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2F6A3E",
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  footerText: {
    color: "#5D6A60",
    fontSize: 14,
    lineHeight: 22,
  },
  footerLink: {
    color: "#2F6A3E",
    fontWeight: "700",
  },
});
