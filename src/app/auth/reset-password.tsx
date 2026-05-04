import { Link, type Href, useRouter } from "expo-router";
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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { session, updatePassword, user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleUpdatePassword = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      if (!password || !confirmPassword) {
        throw new Error("Enter and confirm your new password.");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      await updatePassword(password);
      setPassword("");
      setConfirmPassword("");
      setSuccessMessage("Your password has been updated.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell
      eyebrow="Password reset"
      title={
        session
          ? "Choose a new password."
          : "Open your reset link from your inbox."
      }
      subtitle={
        session
          ? "The recovery link verified your account. Set the new password before leaving this screen."
          : "Request a reset email, then open the link on this device to continue."
      }
      footer={
        <Text style={styles.footerText}>
          Need a new link?{" "}
          <Link
            href={"/auth/forgot-password" as Href}
            style={styles.footerLink}
          >
            Send another email
          </Link>
        </Text>
      }
    >
      {user?.email ? (
        <Text style={styles.metaText}>Resetting password for {user.email}</Text>
      ) : null}
      {session ? (
        <>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>New password</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={setPassword}
              placeholder="New password"
              placeholderTextColor="#7A867D"
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm new password</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={setConfirmPassword}
              placeholder="Repeat your new password"
              placeholderTextColor="#7A867D"
              secureTextEntry
              style={styles.input}
              value={confirmPassword}
            />
          </View>
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
          {successMessage ? (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Password updated</Text>
              <Text style={styles.infoBody}>{successMessage}</Text>
            </View>
          ) : null}
          <Pressable
            disabled={loading}
            onPress={handleUpdatePassword}
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Update password</Text>
            )}
          </Pressable>
          {successMessage ? (
            <Pressable
              onPress={() => router.replace("/account" as Href)}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>
                Continue to account
              </Text>
            </Pressable>
          ) : null}
        </>
      ) : (
        <>
          <Text style={styles.messageText}>
            This screen needs the temporary Supabase recovery session from your
            reset email before it can change the password.
          </Text>
          <Pressable
            onPress={() => router.replace("/auth/forgot-password" as Href)}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Send reset link</Text>
          </Pressable>
        </>
      )}
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
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#EEF5EB",
    borderColor: "#DCE8D7",
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: "#2F6A3E",
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
