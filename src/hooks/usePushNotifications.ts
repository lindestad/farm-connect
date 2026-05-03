import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

// Function to ensure the Android notification channel is set up
async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

// Function to get the push token, requesting permissions if necessary
async function getPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  const finalStatus =
    existing === "granted"
      ? existing
      : (await Notifications.requestPermissionsAsync()).status;

  if (finalStatus !== "granted") return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn(
      "Missing EAS projectId — push token will not work in production",
    );
  }

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return data;
  } catch (err) {
    console.warn("Push token unavailable:", err);
    return null;
  }
}

// Function to save the push token to the database, ensuring it's not associated with any other user
async function savePushToken(userId: string, token: string) {
  // Clear this token from any other user's row (handles device handoff)
  const { error: clearError } = await supabase!
    .from("push_tokens")
    .delete()
    .eq("token", token)
    .neq("user_id", userId);

  if (clearError) {
    console.error("Failed to clear stale token:", clearError);
  }

  const { error } = await supabase!
    .from("push_tokens")
    .upsert({ user_id: userId, token }, { onConflict: "user_id" });

  if (error) {
    console.error("Failed to save push token:", error);
  }
}

// Custom hook to manage push notifications
export function usePushNotifications() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  useEffect(() => {
    void ensureAndroidChannel();
  }, []);

  useEffect(() => {
    if (!userId) return;

    void (async () => {
      const token = await getPushToken();
      if (token) await savePushToken(userId, token);
    })();

    const sub = Notifications.addPushTokenListener(({ data: token }) => {
      void savePushToken(userId, token);
    });

    return () => sub.remove();
  }, [userId]);
}
