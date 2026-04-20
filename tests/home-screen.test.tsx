import { render, screen } from "@testing-library/react-native";
import HomeScreen from "../src/app/index";

jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    useRouter: () => ({ push: jest.fn() }),
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

jest.mock("../src/hooks/useFarmProfile", () => ({
  useFarmProfile: () => ({ farmProfile: null, loading: false }),
  useAllFarmProfiles: () => ({ farms: [], loading: false }),
}));

describe("HomeScreen", () => {
  it("renders the main landing page messaging for customers", () => {
    render(<HomeScreen />);

    expect(screen.getByText("Welcome to FarmConnect 👋")).toBeTruthy();
    expect(screen.getByText("See market days")).toBeTruthy();
    expect(screen.getByText("Create account")).toBeTruthy();
    expect(screen.getByText("Sign in")).toBeTruthy();
  });

  it("renders produce section", () => {
    render(<HomeScreen />);

    expect(screen.getByText("Produce")).toBeTruthy();
    expect(screen.getByText("What's available")).toBeTruthy();
    expect(screen.getByText("See all produce")).toBeTruthy();
  });

  it("renders auth section for unauthenticated user", () => {
    render(<HomeScreen />);

    expect(screen.getByText("Create an account to get started.")).toBeTruthy();
    expect(screen.getByText("Create account")).toBeTruthy();
    expect(screen.getByText("Sign in")).toBeTruthy();
  });
});
