import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react-native";

import { FarmList } from "../src/components/FarmList";
import type { FarmProfile } from "../src/lib/farmProfiles";

jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    Link: ({ children }: { children: React.ReactNode }) => (
      <Text>{children}</Text>
    ),
  };
});

const farms: FarmProfile[] = [
  {
    id: "farm-1",
    user_id: "farmer-1",
    farm_name: "Green Valley Farm",
    farm_location: "Kristiansand",
    farm_bio: null,
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
  },
  {
    id: "farm-2",
    user_id: "farmer-2",
    farm_name: "Hilltop Herbs",
    farm_location: "Grimstad",
    farm_bio: null,
    farm_profile_picture_url: null,
    created_at: "2026-04-02T09:00:00.000Z",
    updated_at: "2026-04-16T14:30:00.000Z",
    country: "Norway",
    region: "Agder",
    city: "Grimstad",
    postal_code: "4878",
    street: "Herb Road 2",
    latitude: 58.3405,
    longitude: 8.5934,
  },
  {
    id: "farm-3",
    user_id: "farmer-3",
    farm_name: "Bergen Berry Farm",
    farm_location: "Bergen",
    farm_bio: null,
    farm_profile_picture_url: null,
    created_at: "2026-04-03T09:00:00.000Z",
    updated_at: "2026-04-17T14:30:00.000Z",
    country: "Norway",
    region: "Vestland",
    city: "Bergen",
    postal_code: "5003",
    street: "Berry Road 3",
    latitude: 60.3913,
    longitude: 5.3221,
  },
];

function visibleFarmNames() {
  return screen
    .getAllByTestId("farm-list-item")
    .map((item) => within(item).getByText(/Farm|Herbs/).props.children);
}

describe("FarmList", () => {
  it("defaults to nearby farms and hides farms outside the radius", () => {
    render(<FarmList farms={farms} loading={false} />);

    expect(
      screen.getByText("Showing 2 of 3 farms, within 100 km"),
    ).toBeTruthy();
    expect(screen.getByText("Green Valley Farm")).toBeTruthy();
    expect(screen.getByText("Hilltop Herbs")).toBeTruthy();
    expect(screen.queryByText("Bergen Berry Farm")).toBeNull();
  });

  it("filters farms by name, location, and region", () => {
    render(<FarmList farms={farms} loading={false} />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Search by name or location"),
      "agder",
    );

    expect(screen.getByText("Green Valley Farm")).toBeTruthy();
    expect(screen.getByText("Hilltop Herbs")).toBeTruthy();
    expect(screen.queryByText("Bergen Berry Farm")).toBeNull();
  });

  it("can show all distances and sort the visible farms by location", () => {
    render(<FarmList farms={farms} loading={false} />);

    fireEvent.press(screen.getByText("All"));
    fireEvent.press(screen.getByText("Location"));

    expect(
      screen.getByText("Showing 3 of 3 farms, all distances"),
    ).toBeTruthy();
    expect(visibleFarmNames()).toEqual([
      "Bergen Berry Farm",
      "Hilltop Herbs",
      "Green Valley Farm",
    ]);
  });

  it("renders as a compact map search bar", () => {
    const onExpand = jest.fn();

    render(
      <FarmList collapsed farms={farms} loading={false} onExpand={onExpand} />,
    );

    fireEvent.press(screen.getByTestId("farm-search-bar"));

    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it("reports the first visible result when filters change", async () => {
    const onFirstResultChange = jest.fn();

    render(
      <FarmList
        farms={farms}
        loading={false}
        onFirstResultChange={onFirstResultChange}
      />,
    );

    await waitFor(() =>
      expect(onFirstResultChange).toHaveBeenCalledWith(farms[0]),
    );

    fireEvent.changeText(
      screen.getByPlaceholderText("Search by name or location"),
      "grimstad",
    );

    await waitFor(() =>
      expect(onFirstResultChange).toHaveBeenLastCalledWith(farms[1]),
    );
  });
});
