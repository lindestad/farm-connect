import { supabase } from "./supabase";

export type FarmProfile = {
  id: string;
  user_id: string;
  farm_name: string;
  farm_bio: string | null;
  farm_location: string | null;
  farm_profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
};

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
  farmBio: string,
  farmLocation: string,
): Promise<FarmProfile> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("farm_profiles")
    .upsert(
      {
        user_id: userId,
        farm_name: farmName.trim(),
        farm_bio: farmBio.trim() || null,
        farm_location: farmLocation.trim() || null,
        farm_profile_picture_url: null, // Image uploads handled separately, not yet implemented
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

export async function deleteFarmProfile(userId: string): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from("farm_profiles")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}
