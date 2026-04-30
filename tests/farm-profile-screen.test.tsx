import { render, screen, waitFor } from "@testing-library/react-native";

import FarmProfileScreen from "../src/app/farm/[farmId]";

const mockReplace = jest.fn();
const mockFetchFarmProfileById = jest.fn();
const mockFetchUpcomingMarketDaysByFarmerId = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ farmId: "farm-1" }),
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("../src/providers/auth-provider", () => ({
  useAuth: () => ({
    user: null,
  }),
}));

jest.mock("../src/lib/farmProfiles", () => ({
  deleteFarmProfile: jest.fn(),
  fetchFarmProfileById: (...args: unknown[]) =>
    mockFetchFarmProfileById(...args),
  fetchUpcomingMarketDaysByFarmerId: (...args: unknown[]) =>
    mockFetchUpcomingMarketDaysByFarmerId(...args),
}));

const farmProfile = {
  id: "farm-1",
  user_id: "farmer-1",
  farm_name: "Green Valley Farm",
  farm_location: "Kristiansand",
  farm_bio: "Seasonal vegetables and berries.",
  farm_profile_picture_url: null,
  created_at: "2026-04-01T09:00:00.000Z",
  updated_at: "2026-04-15T14:30:00.000Z",
  country: "Norway",
  region: "Agder",
  city: "Kristiansand",
  postal_code: "4610",
  street: "Market Road 1",
  latitude: 58.1467,
  longitude: 7.9956,
};

describe("FarmProfileScreen", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockFetchFarmProfileById.mockReset();
    mockFetchUpcomingMarketDaysByFarmerId.mockReset();
  });

  it("renders upcoming market days for the farm profile", async () => {
    mockFetchFarmProfileById.mockResolvedValue(farmProfile);
    mockFetchUpcomingMarketDaysByFarmerId.mockResolvedValue([
      {
        id: "market-1",
        farmer_id: "farmer-1",
        date: "2026-05-09",
        start_time: "09:00:00",
        end_time: "13:00:00",
        location: "Kristiansand Torv",
        notes: "Find us by the north entrance.",
      },
    ]);

    render(<FarmProfileScreen />);

    await waitFor(() => {
      expect(screen.getByText("Upcoming market days")).toBeTruthy();
    });

    expect(mockFetchFarmProfileById).toHaveBeenCalledWith("farm-1");
    expect(mockFetchUpcomingMarketDaysByFarmerId).toHaveBeenCalledWith(
      "farmer-1",
    );
    expect(screen.getByText("Sat, 9 May 2026")).toBeTruthy();
    expect(screen.getByText("09:00-13:00")).toBeTruthy();
    expect(screen.getByText("Kristiansand Torv")).toBeTruthy();
    expect(screen.getByText("Find us by the north entrance.")).toBeTruthy();
  });

  it("shows an empty state when the farm has no upcoming market days", async () => {
    mockFetchFarmProfileById.mockResolvedValue(farmProfile);
    mockFetchUpcomingMarketDaysByFarmerId.mockResolvedValue([]);

    render(<FarmProfileScreen />);

    await waitFor(() => {
      expect(
        screen.getByText("No upcoming market days scheduled."),
      ).toBeTruthy();
    });
  });
});
