import type { PropsWithChildren, ReactNode } from "react";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthScreenShellProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  subtitle: string;
  footer?: ReactNode;
}>;

export function AuthScreenShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.body}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const shadow = {
  boxShadow: "0px 18px 30px rgba(24, 32, 25, 0.08)",
} as const;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7F3",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 24,
  },
  heroCard: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "#DDE4D9",
    borderRadius: 32,
    padding: 24,
    gap: 12,
    ...shadow,
  },
  eyebrow: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF5EB",
    borderWidth: 1,
    borderColor: "#DCE8D7",
    color: "#2F6A3E",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  title: {
    color: "#182019",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  subtitle: {
    color: "#5D6A60",
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    gap: 14,
    marginTop: 8,
  },
  footer: {
    marginTop: 10,
  },
});
