import { render, screen } from "@testing-library/react-native";

import ConfirmEmailScreen from "../src/app/auth/confirm";
import LoginScreen from "../src/app/auth/login";
import RegisterScreen from "../src/app/auth/register";

jest.mock("../src/providers/auth-provider", () => ({
  useAuth: () => ({
    session: null,
    user: null,
    isLoading: false,
    authLinkStatus: "idle",
    authLinkMessage: null,
    signInWithPassword: jest.fn(),
    signUpWithPassword: jest.fn(),
    resendConfirmationEmail: jest.fn(),
    signOut: jest.fn(),
    clearAuthLinkState: jest.fn(),
    makeEmailRedirectUrl: () => "farmconnect://auth/confirm",
  }),
}));

describe("Auth screens", () => {
  it("renders the login page", () => {
    render(<LoginScreen />);

    expect(
      screen.getByText("Sign in to manage pickups and market days."),
    ).toBeTruthy();
    expect(screen.getByPlaceholderText("you@farmconnect.app")).toBeTruthy();
    expect(screen.getByText("Sign in")).toBeTruthy();
  });

  it("renders the registration page", () => {
    render(<RegisterScreen />);

    expect(
      screen.getByText(
        "Create an account for farm-gate pickup and market planning.",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Create account")).toBeTruthy();
  });

  it("renders the confirmation page", () => {
    render(<ConfirmEmailScreen />);

    expect(
      screen.getByText("Open the confirmation link from your inbox."),
    ).toBeTruthy();
    expect(screen.getByText("Back to login")).toBeTruthy();
  });
});
