import { render, screen } from "@testing-library/react-native";

import ConfirmEmailScreen from "../src/app/auth/confirm";
import ForgotPasswordScreen from "../src/app/auth/forgot-password";
import LoginScreen from "../src/app/auth/login";
import RegisterScreen from "../src/app/auth/register";
import ResetPasswordScreen from "../src/app/auth/reset-password";

let mockSession: { user: { email: string } } | null = null;

jest.mock("../src/providers/auth-provider", () => ({
  useAuth: () => ({
    session: mockSession,
    user: mockSession?.user ?? null,
    profile: null,
    profileLoading: false,
    profileError: null,
    isLoading: false,
    authLinkStatus: "idle",
    authLinkMessage: null,
    signInWithPassword: jest.fn(),
    signUpWithPassword: jest.fn(),
    requestPasswordReset: jest.fn(),
    updatePassword: jest.fn(),
    resendConfirmationEmail: jest.fn(),
    signOut: jest.fn(),
    clearAuthLinkState: jest.fn(),
    makeEmailRedirectUrl: () => "farmconnect://auth/confirm",
    makePasswordResetRedirectUrl: () => "farmconnect://auth/reset-password",
    refreshProfile: jest.fn(),
  }),
}));

describe("Auth screens", () => {
  beforeEach(() => {
    mockSession = null;
  });

  it("renders the login page", () => {
    render(<LoginScreen />);

    expect(
      screen.getByText("Sign in to manage pickups and market days."),
    ).toBeTruthy();
    expect(screen.getByPlaceholderText("you@farmconnect.app")).toBeTruthy();
    expect(screen.getByText("Forgot your password?")).toBeTruthy();
    expect(screen.getByText("Sign in")).toBeTruthy();
  });

  it("renders the registration page", () => {
    render(<RegisterScreen />);

    expect(
      screen.getByText(
        "Create an account for farm-gate pickup and market planning.",
      ),
    ).toBeTruthy();
    expect(screen.getByPlaceholderText("Your name")).toBeTruthy();
    expect(screen.getByText("Customer")).toBeTruthy();
    expect(screen.getByText("Farmer")).toBeTruthy();
    expect(screen.getByText("Create account")).toBeTruthy();
  });

  it("renders the confirmation page", () => {
    render(<ConfirmEmailScreen />);

    expect(
      screen.getByText("Open the confirmation link from your inbox."),
    ).toBeTruthy();
    expect(screen.getByText("Back to login")).toBeTruthy();
  });

  it("renders the forgot password page", () => {
    render(<ForgotPasswordScreen />);

    expect(screen.getByText("Send a password reset link.")).toBeTruthy();
    expect(screen.getByPlaceholderText("you@farmconnect.app")).toBeTruthy();
    expect(screen.getByText("Send reset link")).toBeTruthy();
  });

  it("renders the reset password page for a recovery session", () => {
    mockSession = { user: { email: "you@farmconnect.app" } };

    render(<ResetPasswordScreen />);

    expect(screen.getByText("Choose a new password.")).toBeTruthy();
    expect(
      screen.getByText("Resetting password for you@farmconnect.app"),
    ).toBeTruthy();
    expect(screen.getByPlaceholderText("New password")).toBeTruthy();
    expect(screen.getByText("Update password")).toBeTruthy();
  });

  it("renders reset guidance without a recovery session", () => {
    render(<ResetPasswordScreen />);

    expect(
      screen.getByText("Open your reset link from your inbox."),
    ).toBeTruthy();
    expect(screen.getAllByText("Send reset link")).toHaveLength(1);
  });
});
