import { Link, type Href } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { AuthScreenShell } from "../../components/auth-screen-shell";
import { useAuth } from "../../providers/auth-provider";

export default function ForgotPasswordScreen() {
  const { makePasswordResetRedirectUrl, requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRequestReset = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const normalizedEmail = email.trim();

      if (!normalizedEmail) {
        throw new Error("Enter the email address for your account.");
      }

      await requestPasswordReset(normalizedEmail);
      setSuccessMessage("Check your inbox for a password reset link.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to send reset email.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell
      eyebrow="Password reset"
      title="Send a password reset link."
      subtitle="Supabase will email a recovery link that opens FarmConnect so you can choose a new password."
      footer={
        <Text style={styles.footerText}>
          Remembered it?{" "}
          <Link href={"/auth/login" as Href} style={styles.footerLink}>
            Back to login
          </Link>
        </Text>
      }
    >
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="you@farmconnect.app"
          placeholderTextColor="#7A867D"
          style={styles.input}
          value={email}
        />
      </View>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      {successMessage ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Reset email sent</Text>
          <Text style={styles.infoBody}>{successMessage}</Text>
          <Text style={styles.infoMeta}>
            Redirect target: {makePasswordResetRedirectUrl()}
          </Text>
        </View>
      ) : null}
      <Pressable
        disabled={loading}
        onPress={handleRequestReset}
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Send reset link</Text>
        )}
      </Pressable>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: "#182019",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE4D9",
    borderRadius: 18,
    borderWidth: 1,
    color: "#182019",
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  infoCard: {
    backgroundColor: "#EEF5EB",
    borderColor: "#DCE8D7",
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  infoTitle: {
    color: "#2F6A3E",
    fontSize: 15,
    fontWeight: "800",
  },
  infoBody: {
    color: "#334338",
    fontSize: 14,
    lineHeight: 20,
  },
  infoMeta: {
    color: "#5D6A60",
    fontSize: 12,
    lineHeight: 18,
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
