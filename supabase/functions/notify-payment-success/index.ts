import { createClient } from "@supabase/supabase-js";

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user_id, delivery_method, amount } = await req.json();

  if (!user_id || !delivery_method) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["pickup", "reservation"].includes(delivery_method)) {
    return Response.json({ message: "Skipped" }, { status: 200 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("push_tokens")
    .select("token")
    .eq("user_id", user_id)
    .single();

  if (error || !data?.token) {
    return Response.json(
      { message: "No push token found for user" },
      { status: 200 },
    );
  }

  const isPickup = delivery_method === "pickup";
  const message = {
    to: data.token,
    sound: "default",
    title: isPickup ? "Payment confirmed" : "Reservation confirmed",
    body: isPickup
      ? `Your payment of ${amount} NOK was successful.`
      : `Your items are reserved and held for 48 hours. Pay at pickup.`,
    data: { type: isPickup ? "payment_success" : "reservation_created" },
  };

  const pushResponse = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  const result = await pushResponse.json();
  return Response.json(result, { status: 200 });
});
