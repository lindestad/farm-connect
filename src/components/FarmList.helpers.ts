import { type FarmProfile } from "../lib/farmProfiles";

export const DEFAULT_CENTER = {
  latitude: 58.1467,
  longitude: 7.9956,
};

/**
 * Haversine distance in km between (lat, lon) and a centre point.
 * Returns null when either coordinate is null (farm has no geocoded address).
 */
export function distanceKm(
  lat: number | null,
  lon: number | null,
  centerLat: number = DEFAULT_CENTER.latitude,
  centerLon: number = DEFAULT_CENTER.longitude,
): number | null {
  if (lat === null || lon === null) return null;

  const earthRadiusKm = 6371;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latDelta = toRadians(lat - centerLat);
  const lonDelta = toRadians(lon - centerLon);
  const originLat = toRadians(centerLat);
  const farmLat = toRadians(lat);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(originLat) * Math.cos(farmLat) * Math.sin(lonDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Lower-cased, space-joined text used for the farm list search filter.
 * Null fields are excluded so they don't introduce a trailing/leading space.
 */
export function searchableText(farm: FarmProfile): string {
  return [
    farm.farm_name,
    farm.farm_location,
    farm.city,
    farm.region,
    farm.country,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
