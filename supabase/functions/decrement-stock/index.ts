import { createClient } from "@supabase/supabase-js";

type StockItem = {
  produce_id: string;
  qty: number;
};

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { farm_user_id, items } = await req.json();

  if (!farm_user_id || !Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: farmProfile, error: farmError } = await supabase
    .from("farm_profiles")
    .select("id")
    .eq("user_id", farm_user_id)
    .single();

  if (farmError || !farmProfile) {
    return Response.json({ error: "Farm not found" }, { status: 404 });
  }

  const farmProfileId = farmProfile.id;

  for (const item of items as StockItem[]) {
    const { data: stockRow } = await supabase
      .from("farm_produce")
      .select("stock")
      .eq("farm_id", farmProfileId)
      .eq("produce_id", item.produce_id)
      .single();

    if (stockRow && stockRow.stock >= item.qty) {
      await supabase
        .from("farm_produce")
        .update({
          stock: stockRow.stock - item.qty,
          updated_at: new Date().toISOString(),
        })
        .eq("farm_id", farmProfileId)
        .eq("produce_id", item.produce_id);
    }
  }

  return Response.json({ message: "Stock updated" }, { status: 200 });
});
