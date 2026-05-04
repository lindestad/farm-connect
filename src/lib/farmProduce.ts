import produceData from "../data/produceData.json";
import { supabase } from "./supabase";

type ProduceDataFile = {
  items: { id: string; name_nb: string; unit: string; price: number }[];
};

const typedProduceData = produceData as ProduceDataFile;

export type FarmProduce = {
  id: string;
  farm_id: string;
  produce_id: string;
  price: number;
  stock: number;
  unit: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  // Joined from produceData.json locally
  name_nb?: string;
};

export async function fetchProduceByFarm(
  farmId: string,
): Promise<FarmProduce[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("farm_produce")
    .select("*")
    .eq("farm_id", farmId)
    .eq("is_available", true);

  if (error) throw error;

  // Join med lokal produceData for å få navn
  return (data ?? []).map((row) => {
    const match = typedProduceData.items.find((i) => i.id === row.produce_id);
    return { ...row, name_nb: match?.name_nb ?? row.produce_id };
  });
}

export async function upsertFarmProduce(
  farmId: string,
  produceId: string,
  price: number,
  stock: number,
  unit: string,
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("farm_produce").upsert(
    {
      farm_id: farmId,
      produce_id: produceId,
      price,
      stock,
      unit,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "farm_id,produce_id" },
  );

  if (error) throw error;
}

export async function deleteFarmProduce(
  farmId: string,
  produceId: string,
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from("farm_produce")
    .delete()
    .eq("farm_id", farmId)
    .eq("produce_id", produceId);

  if (error) throw error;
}

export async function fetchAllFarmsWithProduce(): Promise<
  { farm_id: string; produce_ids: string[] }[]
> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("farm_produce")
    .select("farm_id, produce_id")
    .eq("is_available", true);

  if (error) throw error;

  const map = new Map<string, string[]>();
  for (const row of data ?? []) {
    if (!map.has(row.farm_id)) map.set(row.farm_id, []);
    map.get(row.farm_id)!.push(row.produce_id);
  }

  return Array.from(map.entries()).map(([farm_id, produce_ids]) => ({
    farm_id,
    produce_ids,
  }));
}
