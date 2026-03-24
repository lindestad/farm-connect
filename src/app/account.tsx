import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AuthScreenShell } from "../components/auth-screen-shell";
import { useAuth } from "../providers/auth-provider";

export default function AccountScreen() {
  const { profile, profileError, profileLoading, signOut, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      await signOut();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign out.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell
      eyebrow="Account"
      title="Your FarmConnect session is stored on this device."
      subtitle="Supabase is now persisting the auth session locally, so reopening the app should keep you signed in until you sign out."
      footer={
        <Text style={styles.footerText}>
          <Link href="/" style={styles.footerLink}>
            Back to landing page
          </Link>
        </Text>
      }
    >
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Signed in account</Text>
        <Text style={styles.infoValue}>{user?.email ?? "Unknown email"}</Text>
        <Text style={styles.infoMeta}>
          Email confirmed: {user?.email_confirmed_at ? "yes" : "no"}
        </Text>
      </View>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Profile</Text>
        {profileLoading ? (
          <Text style={styles.infoMeta}>Loading profile...</Text>
        ) : (
          <>
            <Text style={styles.infoValue}>
              {profile?.fullName ?? "No name saved yet"}
            </Text>
            <Text style={styles.infoMeta}>
              Role: {profile?.role ?? "No role saved yet"}
            </Text>
          </>
        )}
        {profileError ? (
          <Text style={styles.errorText}>{profileError}</Text>
        ) : null}
      </View>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      <Pressable
        disabled={loading}
        onPress={handleSignOut}
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Sign out</Text>
        )}
      </Pressable>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: "#F7FBF5",
    borderColor: "#D6E3D0",
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  infoTitle: {
    color: "#182019",
    fontSize: 15,
    fontWeight: "700",
  },
  infoValue: {
    color: "#182019",
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
  },
  infoMeta: {
    color: "#5D6A60",
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
  buttonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: "#9C5B4D",
    fontSize: 14,
    lineHeight: 20,
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
