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
import type { ProfileRole } from "../../lib/profiles";
import { useAuth } from "../../providers/auth-provider";

const roleOptions: {
  value: ProfileRole;
  title: string;
  body: string;
}[] = [
  {
    value: "customer",
    title: "Customer",
    body: "Reserve produce, pick a collection slot, and follow local market days.",
  },
  {
    value: "farmer",
    title: "Farmer",
    body: "Publish produce, manage pickup windows, and promote Saturday markets.",
  },
];

export default function RegisterScreen() {
  const { makeEmailRedirectUrl, resendConfirmationEmail, signUpWithPassword } =
    useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<ProfileRole>("customer");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      if (!email.trim() || !password || !confirmPassword) {
        throw new Error("Enter an email address and matching password.");
      }

      if (!fullName.trim()) {
        throw new Error("Enter your name so the profile can be created.");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const result = await signUpWithPassword(email.trim(), password, {
        fullName,
        role,
      });
      setNeedsConfirmation(result.needsEmailConfirmation);
      setSuccessMessage(
        result.needsEmailConfirmation
          ? `Check your inbox to confirm your email address before signing in as a ${role}.`
          : "Account created successfully. You can continue into the app.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create account.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      await resendConfirmationEmail(email.trim());
      setSuccessMessage("Confirmation email sent again.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to resend email.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell
      eyebrow="Register"
      title="Create an account for farm-gate pickup and market planning."
      subtitle="Registration is email-based. Supabase will send a confirmation link back into the app using your FarmConnect deep link."
      footer={
        <Text style={styles.footerText}>
          Already registered?{" "}
          <Link href={"/auth/login" as Href} style={styles.footerLink}>
            Sign in
          </Link>
        </Text>
      }
    >
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          onChangeText={setFullName}
          placeholder="Your name"
          placeholderTextColor="#7A867D"
          style={styles.input}
          value={fullName}
        />
      </View>
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
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          autoCapitalize="none"
          onChangeText={setPassword}
          placeholder="Choose a password"
          placeholderTextColor="#7A867D"
          secureTextEntry
          style={styles.input}
          value={password}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Confirm password</Text>
        <TextInput
          autoCapitalize="none"
          onChangeText={setConfirmPassword}
          placeholder="Repeat your password"
          placeholderTextColor="#7A867D"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Account type</Text>
        <View style={styles.roleGrid}>
          {roleOptions.map((option) => {
            const active = option.value === role;

            return (
              <Pressable
                key={option.value}
                onPress={() => setRole(option.value)}
                style={[styles.roleCard, active && styles.roleCardActive]}
              >
                <Text
                  style={[styles.roleTitle, active && styles.roleTitleActive]}
                >
                  {option.title}
                </Text>
                <Text
                  style={[styles.roleBody, active && styles.roleBodyActive]}
                >
                  {option.body}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      {successMessage ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            {needsConfirmation
              ? "Email confirmation required"
              : "Account ready"}
          </Text>
          <Text style={styles.infoBody}>{successMessage}</Text>
          <Text style={styles.infoMeta}>
            Redirect target: {makeEmailRedirectUrl()}
          </Text>
        </View>
      ) : null}
      <Pressable
        disabled={loading}
        onPress={handleRegister}
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>Create account</Text>
        )}
      </Pressable>
      {needsConfirmation ? (
        <Pressable
          disabled={loading}
          onPress={handleResend}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            Resend confirmation email
          </Text>
        </Pressable>
      ) : null}
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
  roleGrid: {
    gap: 12,
  },
  roleCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DDE4D9",
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  roleCardActive: {
    backgroundColor: "#EEF5EB",
    borderColor: "#2F6A3E",
  },
  roleTitle: {
    color: "#182019",
    fontSize: 15,
    fontWeight: "700",
  },
  roleTitleActive: {
    color: "#224E2E",
  },
  roleBody: {
    color: "#5D6A60",
    fontSize: 13,
    lineHeight: 20,
  },
  roleBodyActive: {
    color: "#345540",
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
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: "#2F6A3E",
    fontSize: 14,
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
  infoBody: {
    color: "#5D6A60",
    fontSize: 14,
    lineHeight: 21,
  },
  infoMeta: {
    color: "#2F6A3E",
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
