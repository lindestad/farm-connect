import { fireEvent, render, screen } from "@testing-library/react-native";
import { Alert } from "react-native";

import CheckoutScreen from "../src/app/checkout/index";

const mockUseCart = jest.fn();

jest.mock("../src/providers/cart-provider", () => ({
  useCart: () => mockUseCart(),
}));

jest.mock("../src/hooks/useOrderPayment", () => ({
  useOrderPayment: () => ({
    handlePayment: jest.fn(),
    paymentSuccess: false,
  }),
}));

jest.mock("../src/providers/auth-provider", () => ({
  useAuth: () => ({ session: null }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

const mockCartItem = {
  produce_id: "tomat",
  produce_name: "Tomat",
  qty: 1,
  unit: "kg",
  price_per_unit: 45,
};

beforeEach(() => {
  mockUseCart.mockReturnValue({
    cartItems: [mockCartItem],
    clearCart: jest.fn(),
    totalItems: 1,
  });
});

describe("Checkout screen", () => {
  it("renders page title and cart items", () => {
    render(<CheckoutScreen />);

    expect(screen.getByText("Checkout")).toBeTruthy();
    expect(screen.getByText("Tomat")).toBeTruthy();
  });

  it("shows 'Buy Now' button when pickup is selected (default)", () => {
    render(<CheckoutScreen />);

    expect(screen.getByText(/Buy Now/)).toBeTruthy();
  });

  it("shows 'Reserve Now' button when reservation is selected", () => {
    render(<CheckoutScreen />);

    fireEvent.press(screen.getByText("Reserve"));

    expect(screen.getByText(/Reserve Now/)).toBeTruthy();
  });

  it("shows auth error when unauthenticated user tries to reserve", () => {
    jest.spyOn(Alert, "alert");

    render(<CheckoutScreen />);

    fireEvent.press(screen.getByText("Reserve"));
    fireEvent.press(screen.getByText(/Reserve Now/));

    expect(Alert.alert).toHaveBeenCalledWith("Error", "You must be logged in.");
  });

  it("shows empty state when cart is empty", () => {
    mockUseCart.mockReturnValue({
      cartItems: [],
      clearCart: jest.fn(),
      totalItems: 0,
    });

    render(<CheckoutScreen />);

    expect(screen.getByText("Your cart is empty")).toBeTruthy();
    expect(screen.getByText("Browse Produce")).toBeTruthy();
  });
});
