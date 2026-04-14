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
  fetchFarmProfileByUserId,
} from "../lib/farmProfiles";

export function useFarmProfile(userId: string | undefined): {
  farmProfile: FarmProfile | null;
  loading: boolean;
} {
  const [farmProfile, setFarmProfile] = useState<FarmProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return setFarmProfile(null);
    setLoading(true);
    fetchFarmProfileByUserId(userId)
      .then(setFarmProfile)
      .catch(() => setFarmProfile(null))
      .finally(() => setLoading(false));
  }, [userId]);

  return { farmProfile, loading };
}
