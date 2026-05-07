import {
  DEFAULT_CENTER,
  distanceKm,
  searchableText,
} from "../src/components/FarmList.helpers";
import { type FarmProfile } from "../src/lib/farmProfiles";

// distanceKm
describe("distanceKm", () => {
  it("returns null when latitude is null", () => {
    expect(distanceKm(null, DEFAULT_CENTER.longitude)).toBeNull();
  });

  it("returns null when longitude is null", () => {
    expect(distanceKm(DEFAULT_CENTER.latitude, null)).toBeNull();
  });

  it("returns null when both coordinates are null", () => {
    expect(distanceKm(null, null)).toBeNull();
  });

  it("returns 0 when the farm is at the exact centre", () => {
    const d = distanceKm(DEFAULT_CENTER.latitude, DEFAULT_CENTER.longitude);
    expect(d).not.toBeNull();
    expect(d!).toBeCloseTo(0, 5);
  });

  it("computes ~292 km from Kristiansand (DEFAULT_CENTER) to Bergen", () => {
    // Bergen, Norway: 60.39°N 5.32°E
    // Haversine from DEFAULT_CENTER gives 292.1 km (not 270 as approximately
    // stated in the review — both are reasonable round numbers for the route).
    const d = distanceKm(60.39, 5.32);
    expect(d).not.toBeNull();
    expect(d!).toBeGreaterThan(272);
    expect(d!).toBeLessThan(312);
  });

  it("works correctly with negative coordinates (southern hemisphere)", () => {
    // Two coords near each other, both negative lat/lon
    const d = distanceKm(-33.87, 151.21, -33.87, 151.21); // same point
    expect(d).not.toBeNull();
    expect(d!).toBeCloseTo(0, 5);
  });

  it("accepts an explicit centre and measures from there", () => {
    // Oslo (59.91°N, 10.75°E) to Trondheim (63.43°N, 10.39°E) ≈ 392 km
    const d = distanceKm(63.43, 10.39, 59.91, 10.75);
    expect(d).not.toBeNull();
    expect(d!).toBeGreaterThan(370);
    expect(d!).toBeLessThan(415);
  });
});

// searchableText
function makeProfile(overrides: Partial<FarmProfile> = {}): FarmProfile {
  return {
    id: "farm-1",
    user_id: "user-1",
    farm_name: "Green Acres",
    farm_location: "Countryside Lane",
    farm_bio: "Organic vegetables.",
    farm_profile_picture_url: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    country: "Norway",
    region: "Vest-Agder",
    city: "Kristiansand",
    postal_code: "4614",
    street: "Bondeveien 1",
    latitude: 58.15,
    longitude: 7.99,
    ...overrides,
  };
}

describe("searchableText", () => {
  it("includes farm_name, farm_location, city, region, country", () => {
    const text = searchableText(makeProfile());
    expect(text).toContain("green acres");
    expect(text).toContain("countryside lane");
    expect(text).toContain("kristiansand");
    expect(text).toContain("vest-agder");
    expect(text).toContain("norway");
  });

  it("is fully lower-cased", () => {
    const text = searchableText(makeProfile({ farm_name: "UPPER FARM" }));
    expect(text).toContain("upper farm");
    expect(text).not.toContain("UPPER FARM");
  });

  it("excludes null fields without introducing extra spaces", () => {
    const text = searchableText(
      makeProfile({ farm_location: null, region: null }),
    );
    expect(text).not.toContain("  "); // no double spaces
    expect(text).toContain("green acres");
    expect(text).toContain("kristiansand");
  });

  it("returns an empty string when all fields are null", () => {
    const text = searchableText(
      makeProfile({
        farm_name: "",
        farm_location: null,
        city: null,
        region: null,
        country: null,
      }),
    );
    // farm_name "" is falsy and filtered out
    expect(text).toBe("");
  });
});
