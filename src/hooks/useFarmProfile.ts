/**
 * useFarmProfile
 *
 * Fetches the farm profile for a given user ID.
 * Returns null if the user has no farm profile yet.
 *
 * Use this hook in any screen that needs farm profile data for the current user.
 *
 * Usage:
 *   const { farmProfile, loading } = useFarmProfile(user?.id);
 *
 * Examples:
 *   // Access farm data
 *   <Text>{farmProfile.farm_name}</Text>
 */
import { useEffect, useState } from "react";
import {
  type FarmProfile,
  fetchAllFarmProfiles,
  fetchFarmProfileByUserId,
} from "../lib/farmProfiles";
import { isSupabaseConfigured } from "../lib/supabase";

export function useFarmProfile(userId: string | undefined): {
  farmProfile: FarmProfile | null;
  loading: boolean;
  error: string | null;
} {
  const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setFarmProfile(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchFarmProfileByUserId(userId)
      .then(setFarmProfile)
      .catch((err) => {
        setFarmProfile(null);
        setError(
          err instanceof Error ? err.message : "Failed to load farm profile.",
        );
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return { farmProfile, loading, error };
}

export function useAllFarmProfiles(): {
  farms: FarmProfile[];
  loading: boolean;
  error: string | null;
} {
  const [farms, setFarms] = useState<FarmProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    fetchAllFarmProfiles()
      .then(setFarms)
      .catch((err) => {
        setFarms([]);
        setError(err instanceof Error ? err.message : "Failed to load farms.");
      })
      .finally(() => setLoading(false));
  }, []);

  return { farms, loading, error };
}
