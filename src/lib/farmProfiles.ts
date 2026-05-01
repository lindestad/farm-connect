import { AddressInput } from "@/lib/location/types"; // Shared address object type
import { supabase } from "./supabase";

export type FarmProfile = {
  id: string;
  user_id: string;
  farm_name: string;
  farm_location: string | null;
  farm_bio: string | null;
  farm_profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
  country: string | null;
  region?: string | null;
  city: string | null;
  postal_code: string | null;
  street: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type FarmMarketDay = {
  id: string;
  farmer_id: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  notes: string | null;
};

export type FarmPickupInventoryItem = {
  id: string;
  farmer_id: string;
  produce_id: string | null;
  produce_name: string;
  available_quantity: number;
  unit: string;
  price_text: string | null;
  notes: string | null;
  is_available: boolean;
};

export type FarmPickupSlot = {
  id: string;
  farmer_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  location: string;
  notes: string | null;
};

export type FarmPickupDetails = {
  inventory: FarmPickupInventoryItem[];
  slots: FarmPickupSlot[];
};

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export async function fetchFarmProfileByUserId(
  userId: string,
): Promise<FarmProfile | null> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("farm_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<FarmProfile>();

  if (error) throw error;
  return data;
}

export async function fetchFarmProfileById(
  farmId: string,
): Promise<FarmProfile | null> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("farm_profiles")
    .select("*")
    .eq("id", farmId)
    .maybeSingle<FarmProfile>();

  if (error) throw error;
  return data;
}

export async function upsertFarmProfile(
  userId: string,
  farmName: string,
  farmLocation: string | null,
  farmBio: string,
  address: AddressInput,
  latitude: number | null,
  longitude: number | null,
): Promise<FarmProfile> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("farm_profiles")
    .upsert(
      {
        user_id: userId,
        farm_name: farmName.trim(),
        farm_bio: farmBio.trim() || null,
        farm_location: farmLocation?.trim() || null,
        farm_profile_picture_url: null, // Image uploads handled separately, not yet implemented
        country: address.country?.trim() || null, // Save country from the shared address object
        region: address.region?.trim() || null, // Save region from the shared address object
        city: address.city?.trim() || null, // Save city from the shared address object
        postal_code: address.postalCode?.trim() || null, // Save postal-code from the shared address object
        street: address.street?.trim() || null, // Save street from the shared address object
        latitude: latitude,
        longitude: longitude,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select("*")
    .single<FarmProfile>();

  if (error) throw error;
  return data;
}

export async function fetchAllFarmProfiles(): Promise<FarmProfile[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("farm_profiles")
    .select("*")
    .order("farm_name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function fetchUpcomingMarketDaysByFarmerId(
  farmerId: string,
  limit = 3,
): Promise<FarmMarketDay[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("market_days")
    .select("id, farmer_id, date, start_time, end_time, location, notes")
    .eq("farmer_id", farmerId)
    .gte("date", dateKey(new Date()))
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function fetchFarmPickupDetailsByFarmerId(
  farmerId: string,
  limit = 4,
): Promise<FarmPickupDetails> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const today = dateKey(new Date());
  const [inventoryResult, slotsResult] = await Promise.all([
    supabase
      .from("pickup_inventory")
      .select(
        "id, farmer_id, produce_id, produce_name, available_quantity, unit, price_text, notes, is_available",
      )
      .eq("farmer_id", farmerId)
      .eq("is_available", true)
      .gt("available_quantity", 0)
      .order("produce_name", { ascending: true })
      .limit(limit),
    supabase
      .from("pickup_time_slots")
      .select(
        "id, farmer_id, slot_date, start_time, end_time, capacity, location, notes",
      )
      .eq("farmer_id", farmerId)
      .gte("slot_date", today)
      .order("slot_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(limit),
  ]);

  if (inventoryResult.error) throw inventoryResult.error;
  if (slotsResult.error) throw slotsResult.error;

  return {
    inventory: inventoryResult.data ?? [],
    slots: slotsResult.data ?? [],
  };
}

export async function deleteFarmProfile(userId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from("farm_profiles")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}
