import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import AccountScreen from "../src/app/account";
import type { UserProfile } from "../src/lib/profiles";

const mockSignOut = jest.fn();
const mockUpdateOwnProfile = jest.fn();
const mockUser = {
  id: "user-1",
  email: "test@example.com",
  email_confirmed_at: "2026-03-30T12:00:00.000Z",
};
const mockCustomerProfile: UserProfile = {
  id: "user-1",
  email: "test@example.com",
  displayName: "Ava",
  fullName: "Ava Fields",
  role: "customer" as const,
  phoneNumber: "+47 999 99 999",
  bio: "Weekly produce shopper who prefers afternoon collections.",
  locationLabel: "Kristiansand",
  preferredContactMethod: "phone" as const,
  defaultPickupNotes: "Call when you arrive at the gate.",
  createdAt: "2026-03-10T08:30:00.000Z",
  updatedAt: "2026-03-25T14:45:00.000Z",
};
const mockFarmerProfile: UserProfile = {
  ...mockCustomerProfile,
  role: "farmer" as const,
};

let mockCurrentProfile: UserProfile = mockCustomerProfile;

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
    session: {
      user: {
        id: "user-1",
        email: "test@example.com",
      },
    },
    user: mockUser,
    profile: mockCurrentProfile,
    profileLoading: false,
    profileError: null,
    isLoading: false,
    authLinkStatus: "idle",
    authLinkMessage: null,
    signInWithPassword: jest.fn(),
    signUpWithPassword: jest.fn(),
    resendConfirmationEmail: jest.fn(),
    signOut: mockSignOut,
    clearAuthLinkState: jest.fn(),
    makeEmailRedirectUrl: () => "farmconnect://auth/confirm",
    refreshProfile: jest.fn(),
    updateOwnProfile: mockUpdateOwnProfile,
  }),
}));

describe("AccountScreen", () => {
  beforeEach(() => {
    mockCurrentProfile = mockCustomerProfile;
    mockSignOut.mockReset();
    mockUpdateOwnProfile.mockReset();
  });

  it("renders the customer profile and readonly account fields", () => {
    render(<AccountScreen />);

    expect(screen.getAllByText("Customer profile")).toHaveLength(2);
    expect(screen.getByText("Account details")).toBeTruthy();
    expect(screen.getByText("test@example.com")).toBeTruthy();
    expect(screen.getByText("Customer")).toBeTruthy();
    expect(screen.getAllByText("Ava")).toHaveLength(2);
    expect(screen.getByText("+47 999 99 999")).toBeTruthy();
    expect(screen.getAllByText("Kristiansand")).toHaveLength(2);
    expect(screen.getByText("Phone")).toBeTruthy();
    expect(screen.getByText("Call when you arrive at the gate.")).toBeTruthy();
    expect(screen.getByText("Edit customer profile")).toBeTruthy();
  });

  it("lets the customer edit and save profile fields", async () => {
    mockUpdateOwnProfile.mockResolvedValue({
      ...mockCustomerProfile,
      displayName: "Ava Green",
      fullName: "Ava Marie Green",
      preferredContactMethod: "email",
      locationLabel: "Lillesand",
      bio: "Collects after work and prefers email reminders.",
      defaultPickupNotes: "Usually arrives around 17:30.",
    });

    render(<AccountScreen />);

    fireEvent.press(screen.getByTestId("edit-profile-button"));
    fireEvent.changeText(screen.getByDisplayValue("Ava"), "Ava Green");
    fireEvent.changeText(
      screen.getByDisplayValue("Ava Fields"),
      "Ava Marie Green",
    );
    fireEvent.changeText(
      screen.getByDisplayValue("+47 999 99 999"),
      "+47 111 22 333",
    );
    fireEvent.changeText(screen.getByDisplayValue("Kristiansand"), "Lillesand");
    fireEvent.press(screen.getByTestId("contact-method-email"));
    fireEvent.changeText(
      screen.getByDisplayValue(
        "Weekly produce shopper who prefers afternoon collections.",
      ),
      "Collects after work and prefers email reminders.",
    );
    fireEvent.changeText(
      screen.getByDisplayValue("Call when you arrive at the gate."),
      "Usually arrives around 17:30.",
    );
    fireEvent.press(screen.getByTestId("save-profile-button"));

    await waitFor(() => {
      expect(mockUpdateOwnProfile).toHaveBeenCalledWith({
        displayName: "Ava Green",
        fullName: "Ava Marie Green",
        phoneNumber: "+47 111 22 333",
        locationLabel: "Lillesand",
        preferredContactMethod: "email",
        bio: "Collects after work and prefers email reminders.",
        defaultPickupNotes: "Usually arrives around 17:30.",
      });
    });

    expect(screen.getByText("Customer profile updated.")).toBeTruthy();
  });

  it("shows a separate farmer view without the customer editor", () => {
    mockCurrentProfile = mockFarmerProfile;

    render(<AccountScreen />);

    expect(screen.getAllByText("Farmer profile")).toHaveLength(2);
    expect(
      screen.getByText(
        "Farmer accounts will get a separate profile editor once farm-specific fields are designed. This customer profile form is intentionally not shown here.",
      ),
    ).toBeTruthy();
    expect(screen.queryByText("Edit customer profile")).toBeNull();
  });
});
