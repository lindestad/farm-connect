/**
 * Unit tests for src/hooks/useOrderPayment.ts
 *
 * Mocks: useStripe, supabase.functions.invoke, useAuth.
 * Uses renderHook from @testing-library/react-native — no real Stripe calls.
 */

import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useOrderPayment } from "../src/hooks/useOrderPayment";

// Module-level mock variables (mock* prefix for jest.mock hoisting)
const mockInitPaymentSheet = jest.fn<any, any[]>();
const mockPresentPaymentSheet = jest.fn<any, any[]>();
const mockFunctionsInvoke = jest.fn<any, any[]>();
let mockSession: { user: { id: string }; access_token: string } | null = {
  user: { id: "user-1" },
  access_token: "token-abc",
};
let mockSupabaseValue: any = {
  functions: {
    invoke: (fn: string, opts: any) => mockFunctionsInvoke(fn, opts),
  },
};

// Jest module mocks
jest.mock("@stripe/stripe-react-native", () => ({
  useStripe: () => ({
    initPaymentSheet: (...args: any[]) => mockInitPaymentSheet(...args),
    presentPaymentSheet: (...args: any[]) => mockPresentPaymentSheet(...args),
  }),
}));

jest.mock("../src/lib/supabase", () => ({
  get supabase() {
    return mockSupabaseValue;
  },
}));

jest.mock("../src/providers/auth-provider", () => ({
  useAuth: () => ({ session: mockSession }),
}));

// Helpers
/** Default happy-path: init succeeds, sheet succeeds. */
function setupSuccess() {
  let capturedConfig: any;
  mockInitPaymentSheet.mockImplementation(async (config: any) => {
    capturedConfig = config;
    return { error: null };
  });
  mockPresentPaymentSheet.mockResolvedValue({ error: null });
  mockFunctionsInvoke.mockResolvedValue({
    data: { clientSecret: "secret-123" },
    error: null,
  });
  return { getCapturedConfig: () => capturedConfig };
}

// Setup
beforeEach(() => {
  jest.clearAllMocks();
  mockSession = { user: { id: "user-1" }, access_token: "token-abc" };
  mockSupabaseValue = {
    functions: {
      invoke: (fn: string, opts: any) => mockFunctionsInvoke(fn, opts),
    },
  };
});

// Tests
describe("useOrderPayment", () => {
  it("returns 'success' and sets paymentSuccess on Stripe success", async () => {
    setupSuccess();

    const { result } = renderHook(() => useOrderPayment(45));

    let returnValue: string | undefined;
    await act(async () => {
      returnValue = await result.current.handlePayment();
    });

    expect(returnValue).toBe("success");
    expect(result.current.paymentSuccess).toBe(true);
    expect(result.current.paymentError).toBeNull();
  });

  it("returns 'cancelled' when presentPaymentSheet error code is 'Canceled'", async () => {
    setupSuccess();
    mockPresentPaymentSheet.mockResolvedValue({
      error: { code: "Canceled", message: "User cancelled" },
    });

    const { result } = renderHook(() => useOrderPayment(45));

    let returnValue: string | undefined;
    await act(async () => {
      returnValue = await result.current.handlePayment();
    });

    expect(returnValue).toBe("cancelled");
    expect(result.current.paymentSuccess).toBe(false);
    expect(result.current.paymentError).toBeNull();
  });

  it("returns 'failed' and sets paymentError on initPaymentSheet error", async () => {
    mockInitPaymentSheet.mockResolvedValue({
      error: { message: "init failed" },
    });

    const { result } = renderHook(() => useOrderPayment(45));

    let returnValue: string | undefined;
    await act(async () => {
      returnValue = await result.current.handlePayment();
    });

    expect(returnValue).toBe("failed");
    expect(result.current.paymentSuccess).toBe(false);
    expect(result.current.paymentError).toBe("init failed");
  });

  it("processing flag prevents re-entry on double-tap", async () => {
    // First call blocks inside initPaymentSheet until we release it.
    let resolveInit!: (v: { error: null }) => void;
    mockInitPaymentSheet.mockReturnValue(
      new Promise((r) => {
        resolveInit = r;
      }),
    );
    mockPresentPaymentSheet.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useOrderPayment(45));

    // Start the first call inside act so the synchronous state updates that
    // fire before the first `await initPaymentSheet()` (setProcessing, setPaymentError)
    // are properly flushed. The Promise is stored externally so it stays in-flight.
    let firstCall!: ReturnType<typeof result.current.handlePayment>;
    await act(async () => {
      firstCall = result.current.handlePayment();
    });

    // Wait for processing state to flip true after first call starts.
    await waitFor(() => expect(result.current.processing).toBe(true));

    // Second call sees processing=true and returns immediately.
    const secondResult = await result.current.handlePayment();
    expect(secondResult).toBe("failed");
    expect(mockInitPaymentSheet).toHaveBeenCalledTimes(1);

    // Release the blocked first call inside act so trailing state updates
    // (setProcessing(false), setPaymentSuccess(true)) are captured.
    await act(async () => {
      resolveInit({ error: null });
      await firstCall;
    });
  });

  it("real error message from create-payment-intent reaches onPaymentResult (fix #12 regression)", async () => {
    // Capture the config passed to initPaymentSheet so we can invoke
    // confirmHandler manually and inspect what it passes to onPaymentResult.
    let capturedConfig: any;
    mockInitPaymentSheet.mockImplementation(async (config: any) => {
      capturedConfig = config;
      return { error: null };
    });
    mockPresentPaymentSheet.mockResolvedValue({ error: null });

    // Edge function returns an error with a specific message.
    mockFunctionsInvoke.mockResolvedValue({
      data: null,
      error: { message: "stripe-edge-error" },
    });

    const { result } = renderHook(() => useOrderPayment(45));

    await act(async () => {
      await result.current.handlePayment();
    });

    // Manually invoke the confirmHandler that was registered with Stripe.
    const mockOnPaymentResult = jest.fn();
    await capturedConfig.intentConfiguration.confirmHandler(
      null,
      null,
      mockOnPaymentResult,
    );

    expect(mockOnPaymentResult).toHaveBeenCalledWith({
      error: { code: "Failed", message: "stripe-edge-error" },
    });
  });
});
