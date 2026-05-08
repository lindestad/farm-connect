import { render, screen, waitFor } from "@testing-library/react-native";
import HomeScreen from "../src/app/index";

jest.mock("expo-router", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return {
    useRouter: () => ({ push: jest.fn() }),
    useFocusEffect: (cb: () => () => void) => {
      React.useEffect(cb, []);
    },
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

jest.mock("../src/lib/farmProduce", () => ({
  fetchAllFarmsWithProduce: jest.fn(() => Promise.resolve([])),
}));

describe("HomeScreen", () => {
  it("renders the main landing page messaging for customers", async () => {
    render(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText("Welcome to FarmConnect 👋")).toBeTruthy();
    });

    // "See market days" is farmer-only; profile is null here so it should be absent
    expect(screen.queryByText("See market days")).toBeNull();
    expect(screen.getByText("Create account")).toBeTruthy();
    expect(screen.getByText("Sign in")).toBeTruthy();
  });

  it("renders produce section", async () => {
    render(<HomeScreen />);

    await waitFor(() => {
      expect(screen.getByText("Produce")).toBeTruthy();
    });

    expect(screen.getByText("What's available")).toBeTruthy();
    expect(screen.getByText("See all produce")).toBeTruthy();
  });

  it("renders auth section for unauthenticated user", async () => {
    render(<HomeScreen />);

    await waitFor(() => {
      expect(
        screen.getByText("Create an account to get started."),
      ).toBeTruthy();
    });

    expect(screen.getByText("Create account")).toBeTruthy();
    expect(screen.getByText("Sign in")).toBeTruthy();
  });
});
