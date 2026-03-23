import { render, screen } from "@testing-library/react-native";

import HomeScreen from "../src/app/index";

describe("HomeScreen", () => {
  it("renders the main landing page messaging for customers", () => {
    render(<HomeScreen />);

    expect(
      screen.getByText(
        "Order from the farm, pick up in a slot, or meet at Saturday market.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Browse pickups")).toBeTruthy();
    expect(screen.getByText("See market days")).toBeTruthy();
  });

  it("shows pickup and market planning details for both roles", () => {
    render(<HomeScreen />);

    expect(screen.getByText("Thursday pickup")).toBeTruthy();
    expect(screen.getByText("Saturday market setup")).toBeTruthy();
    expect(screen.getByText("Green Square")).toBeTruthy();
    expect(screen.getByText("River Barn Hall")).toBeTruthy();
  });
});
