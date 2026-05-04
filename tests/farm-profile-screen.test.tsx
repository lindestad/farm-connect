import { render, screen, waitFor } from "@testing-library/react-native";

import FarmProfileScreen from "../src/app/farm/[farmId]";

const mockReplace = jest.fn();
const mockFetchFarmPickupDetailsByFarmerId = jest.fn();
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

jest.mock("../src/lib/farmProduce", () => ({
  fetchProduceByFarm: jest.fn().mockResolvedValue([]),
}));

jest.mock("../src/lib/farmProfiles", () => ({
  deleteFarmProfile: jest.fn(),
  fetchFarmPickupDetailsByFarmerId: (...args: unknown[]) =>
    mockFetchFarmPickupDetailsByFarmerId(...args),
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
    mockFetchFarmPickupDetailsByFarmerId.mockReset();
    mockFetchFarmProfileById.mockReset();
    mockFetchUpcomingMarketDaysByFarmerId.mockReset();
    mockFetchFarmPickupDetailsByFarmerId.mockResolvedValue({
      inventory: [],
      slots: [],
    });
    mockFetchUpcomingMarketDaysByFarmerId.mockResolvedValue([]);
  });

  it("renders pickup availability and upcoming market days for the farm profile", async () => {
    mockFetchFarmProfileById.mockResolvedValue(farmProfile);
    mockFetchFarmPickupDetailsByFarmerId.mockResolvedValue({
      inventory: [
        {
          id: "inventory-1",
          farmer_id: "farmer-1",
          produce_id: "carrots",
          produce_name: "Carrots",
          available_quantity: 12,
          unit: "kg",
          price_text: "40 kr/kg",
          notes: "Washed and bundled.",
          is_available: true,
        },
      ],
      slots: [
        {
          id: "slot-1",
          farmer_id: "farmer-1",
          slot_date: "2026-05-10",
          start_time: "14:00:00",
          end_time: "16:00:00",
          capacity: 5,
          location: "Farm gate",
          notes: "Ring the bell at the red barn.",
        },
      ],
    });
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
    expect(mockFetchFarmPickupDetailsByFarmerId).toHaveBeenCalledWith(
      "farmer-1",
    );
    expect(mockFetchUpcomingMarketDaysByFarmerId).toHaveBeenCalledWith(
      "farmer-1",
    );
    expect(screen.getByText("Pickup availability")).toBeTruthy();
    expect(screen.getByText("Carrots")).toBeTruthy();
    expect(screen.getByText("12 kg - 40 kr/kg")).toBeTruthy();
    expect(screen.getByText("Washed and bundled.")).toBeTruthy();
    expect(screen.getByText("Sun, 10 May 2026")).toBeTruthy();
    expect(screen.getByText("14:00-16:00 - 5 reservations")).toBeTruthy();
    expect(screen.getByText("Farm gate")).toBeTruthy();
    expect(screen.getByText("Ring the bell at the red barn.")).toBeTruthy();
    expect(screen.getByText("Sat, 9 May 2026")).toBeTruthy();
    expect(screen.getByText("09:00-13:00")).toBeTruthy();
    expect(screen.getByText("Kristiansand Torv")).toBeTruthy();
    expect(screen.getByText("Find us by the north entrance.")).toBeTruthy();
  });

  it("shows an empty state when the farm has no upcoming market days", async () => {
    mockFetchFarmProfileById.mockResolvedValue(farmProfile);

    render(<FarmProfileScreen />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "No pickup produce or time slots are currently available.",
        ),
      ).toBeTruthy();
      expect(
        screen.getByText("No upcoming market days scheduled."),
      ).toBeTruthy();
    });
  });
});
