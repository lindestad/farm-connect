import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/auth-provider";

async function registerForPushNotifications(userId: string) {
  const { status: existing } = await Notifications.getPermissionsAsync();
  const finalStatus =
    existing === "granted"
      ? existing
      : (await Notifications.requestPermissionsAsync()).status;

  if (finalStatus !== "granted") return;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return;

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  await supabase
    ?.from("push_tokens")
    .upsert({ user_id: userId, token }, { onConflict: "user_id" });
}

export function usePushNotifications() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) return;
    void registerForPushNotifications(userId);
  }, [userId]);
}
