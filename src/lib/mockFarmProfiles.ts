export type MockFarmProfile = {
  id: string;
  user_id: string;
  farm_name: string;
  farm_bio: string | null;
  farm_location: string | null;
  farm_profile_picture_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
};

export const mockFarmProfiles: MockFarmProfile[] = [
  {
    id: "1",
    user_id: "1",
    farm_name: "Green Valley Farm",
    farm_bio: "We grow organic vegetables and fruits.",
    farm_location: "Kristiansand",
    farm_profile_picture_url: null,
    latitude: 58.1467,
    longitude: 7.9956,
    created_at: "2024-01-01T12:00:00Z",
    updated_at: "2024-01-01T12:00:00Z",
  },
  {
    id: "2",
    user_id: "2",
    farm_name: "Sunny Fields",
    farm_bio: "We specialize in growing sunflowers and other cheerful blooms.",
    farm_location: "Grimstad",
    farm_profile_picture_url: null,
    latitude: 58.3405,
    longitude: 8.5934,
    created_at: "2024-01-02T12:00:00Z",
    updated_at: "2024-01-02T12:00:00Z",
  },
];
