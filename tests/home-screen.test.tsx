import { render, screen } from "@testing-library/react-native";

import HomeScreen from "../src/app/index";

jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    Link: ({ children }: { children: React.ReactNode }) => (
      <Text>{children}</Text>
    ),
  };
});

jest.mock("../src/providers/auth-provider", () => ({
  useAuth: () => ({
    session: null,
    user: null,
    profile: null,
    profileLoading: false,
    profileError: null,
    refreshProfile: jest.fn(),
  }),
}));

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
    expect(screen.getByText("Create account")).toBeTruthy();
    expect(screen.getByText("Sign in")).toBeTruthy();
  });

  it("shows pickup and market planning details for both roles", () => {
    render(<HomeScreen />);

    expect(screen.getByText("Thursday pickup")).toBeTruthy();
    expect(screen.getByText("Saturday market setup")).toBeTruthy();
    expect(screen.getByText("Green Square")).toBeTruthy();
    expect(screen.getByText("River Barn Hall")).toBeTruthy();
  });

  it("shows the Supabase bootstrap fallback when env vars are missing", () => {
    render(<HomeScreen />);

    expect(
      screen.getByText(
        "Supabase environment variables still need local setup.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Add .env.local")).toBeTruthy();
  });
});
