import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Alert } from "react-native";

import CheckoutScreen from "../src/app/checkout/index";

// Module-level mock variables (mock* prefix allows use inside jest.mock factories)
const mockUseCart = jest.fn();

let mockSession: { user: { id: string }; access_token: string } | null = null;

const mockPaymentState = {
  paymentSuccess: false,
  paymentError: null as string | null,
  processing: false,
};
const mockHandlePayment = jest.fn();

const mockCreatePendingOrder = jest.fn();
const mockConfirmOrder = jest.fn();
const mockUpdateOrderStatus = jest.fn();
const mockCreateOrder = jest.fn();

// Jest module mocks
jest.mock("../src/providers/cart-provider", () => ({
  useCart: () => mockUseCart(),
}));

jest.mock("../src/hooks/useOrderPayment", () => ({
  useOrderPayment: () => ({
    handlePayment: mockHandlePayment,
    paymentSuccess: mockPaymentState.paymentSuccess,
    paymentError: mockPaymentState.paymentError,
    processing: mockPaymentState.processing,
  }),
}));

jest.mock("../src/providers/auth-provider", () => ({
  useAuth: () => ({ session: mockSession }),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("../src/lib/checkout/order", () => ({
  // Wrappers are required so the mock* variables are accessed lazily (at call
  // time, after module-level declarations have run) rather than eagerly when
  // the factory executes during require hoisting.
  createPendingOrder: (...args: any[]) => mockCreatePendingOrder(...args),
  confirmOrder: (...args: any[]) => mockConfirmOrder(...args),
  updateOrderStatus: (...args: any[]) => mockUpdateOrderStatus(...args),
  createOrder: (...args: any[]) => mockCreateOrder(...args),
}));

jest.mock("../src/lib/supabase", () => ({
  supabase: { functions: { invoke: jest.fn().mockResolvedValue({}) } },
}));

// Fixtures
const mockCartItem = {
  produce_id: "tomat",
  produce_name: "Tomat",
  farm_id: "farm-1",
  qty: 1,
  unit: "kg",
  price_per_unit: 45,
};

const mockPendingOrder = {
  id: "order-123",
  customer_id: "user-1",
  farm_id: "farm-1",
  status: "pending" as const,
  delivery_method: "pickup" as const,
  pickup_notes: null,
  total_price: 45,
  expires_at: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

// Test setup
beforeEach(() => {
  jest.clearAllMocks();

  mockSession = null;
  mockPaymentState.paymentSuccess = false;
  mockPaymentState.paymentError = null;
  mockPaymentState.processing = false;

  mockHandlePayment.mockResolvedValue("success");
  mockCreatePendingOrder.mockResolvedValue(mockPendingOrder);
  mockConfirmOrder.mockResolvedValue(undefined);
  mockUpdateOrderStatus.mockResolvedValue(undefined);

  mockUseCart.mockReturnValue({
    cartItems: [mockCartItem],
    clearCart: jest.fn(),
    removeItem: jest.fn(),
    totalItems: 1,
  });
});

// Rendering tests
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
      removeItem: jest.fn(),
      totalItems: 0,
    });

    render(<CheckoutScreen />);

    expect(screen.getByText("Your cart is empty")).toBeTruthy();
    expect(screen.getByText("Browse Produce")).toBeTruthy();
  });
});

// Payment flow tests
describe("Checkout payment flow", () => {
  beforeEach(() => {
    mockSession = { user: { id: "user-1" }, access_token: "token-abc" };
  });

  it("handleBuyNow calls createPendingOrder then handlePayment with the order id", async () => {
    render(<CheckoutScreen />);

    fireEvent.press(screen.getByText(/Buy Now/));

    await waitFor(() =>
      expect(mockCreatePendingOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_id: "user-1",
          farm_id: "farm-1",
          delivery_method: "pickup",
        }),
      ),
    );
    expect(mockHandlePayment).toHaveBeenCalledWith("order-123");
  });

  it("calls confirmOrder once when paymentSuccess flips true", async () => {
    const { rerender } = render(<CheckoutScreen />);

    // Populate pendingRef
    fireEvent.press(screen.getByText(/Buy Now/));
    await waitFor(() => expect(mockHandlePayment).toHaveBeenCalled());

    // Simulate Stripe success
    mockPaymentState.paymentSuccess = true;
    rerender(<CheckoutScreen />);

    await waitFor(() =>
      expect(mockConfirmOrder).toHaveBeenCalledWith(
        "order-123",
        "farm-1",
        expect.any(Array),
        "token-abc",
      ),
    );
    expect(mockConfirmOrder).toHaveBeenCalledTimes(1);
  });

  it("submittedRef blocks confirmOrder when session refreshes while paymentSuccess is still true", async () => {
    const { rerender } = render(<CheckoutScreen />);

    fireEvent.press(screen.getByText(/Buy Now/));
    await waitFor(() => expect(mockHandlePayment).toHaveBeenCalled());

    mockPaymentState.paymentSuccess = true;
    rerender(<CheckoutScreen />);
    await waitFor(() => expect(mockConfirmOrder).toHaveBeenCalledTimes(1));

    // Simulate a token refresh — session is a new object reference, re-triggering the effect
    mockSession = { user: { id: "user-1" }, access_token: "token-refreshed" };
    rerender(<CheckoutScreen />);

    // Allow microtasks to flush, then assert confirmOrder was not called again
    await new Promise((r) => setTimeout(r, 50));
    expect(mockConfirmOrder).toHaveBeenCalledTimes(1);
  });

  it("shows alert and resets submittedRef so confirmOrder can be retried after failure", async () => {
    mockConfirmOrder.mockRejectedValueOnce(new Error("network error"));
    jest.spyOn(Alert, "alert");

    const { rerender } = render(<CheckoutScreen />);

    fireEvent.press(screen.getByText(/Buy Now/));
    await waitFor(() => expect(mockHandlePayment).toHaveBeenCalled());

    mockPaymentState.paymentSuccess = true;
    rerender(<CheckoutScreen />);

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        "Order failed",
        expect.stringContaining("contact support"),
      ),
    );

    // Cycle paymentSuccess to retrigger the effect — submittedRef was reset to false
    mockConfirmOrder.mockResolvedValue(undefined);
    mockPaymentState.paymentSuccess = false;
    rerender(<CheckoutScreen />);
    mockPaymentState.paymentSuccess = true;
    rerender(<CheckoutScreen />);

    await waitFor(() => expect(mockConfirmOrder).toHaveBeenCalledTimes(2));
  });

  it("cancels the pending order when Stripe returns cancelled", async () => {
    mockHandlePayment.mockResolvedValueOnce("cancelled");

    render(<CheckoutScreen />);

    fireEvent.press(screen.getByText(/Buy Now/));

    await waitFor(() =>
      expect(mockUpdateOrderStatus).toHaveBeenCalledWith(
        "order-123",
        "cancelled",
      ),
    );
  });
});
