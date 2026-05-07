/**
 * Unit tests for src/lib/checkout/order.ts
 *
 * All Supabase I/O is mocked via the getter pattern so the mock can be set to
 * null for the "not configured" branches without re-importing the module.
 */

import {
  confirmOrder,
  createOrder,
  createPendingOrder,
} from "../src/lib/checkout/order";

// Supabase builder mocks
// Tracks call order for the decrement-before-confirm regression test.
const callLog: string[] = [];

// orders.insert chain: .insert({}).select("*").single<Order>()
const mockSingle = jest.fn<any, any[]>();
const mockSelect = jest.fn<any, any[]>(() => ({ single: mockSingle }));
const mockOrdersInsert = jest.fn<any, any[]>(() => ({ select: mockSelect }));

// orders.update chain: .update({}).eq("id", id)
const mockEq = jest.fn<any, any[]>();
const mockOrdersUpdate = jest.fn<any, any[]>(() => ({ eq: mockEq }));

// order_items.insert (awaited directly — no further chaining)
const mockItemsInsert = jest.fn<any, any[]>();

// functions.invoke
const mockFunctionsInvoke = jest.fn<any, any[]>();

// The live supabase value: set to null in "not configured" tests.
let mockSupabaseValue: any = {
  from: (table: string) => {
    if (table === "orders") {
      return {
        insert: (data: any) => mockOrdersInsert(data),
        update: (data: any) => {
          callLog.push("orders.update");
          return mockOrdersUpdate(data);
        },
      };
    }
    // order_items
    return { insert: (data: any) => mockItemsInsert(data) };
  },
  functions: {
    invoke: (fn: string, opts: any) => {
      callLog.push("functions.invoke");
      return mockFunctionsInvoke(fn, opts);
    },
  },
};

jest.mock("../src/lib/supabase", () => ({
  // Getter is evaluated on every property access, so setting mockSupabaseValue
  // to null in a test immediately affects the imported `supabase` binding.
  get supabase() {
    return mockSupabaseValue;
  },
}));

// Fixtures
const MOCK_ORDER = {
  id: "order-1",
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

const BASE_INPUT = {
  customer_id: "user-1",
  farm_id: "farm-1",
  delivery_method: "pickup" as const,
  items: [
    {
      produce_id: "tomat",
      produce_name: "Tomat",
      qty: 2,
      unit: "kg",
      price: 45,
    },
  ],
};

// Setup / teardown
beforeEach(() => {
  jest.clearAllMocks();
  callLog.length = 0;
  mockSupabaseValue = {
    from: (table: string) => {
      if (table === "orders") {
        return {
          insert: (data: any) => mockOrdersInsert(data),
          update: (data: any) => {
            callLog.push("orders.update");
            return mockOrdersUpdate(data);
          },
        };
      }
      return { insert: (data: any) => mockItemsInsert(data) };
    },
    functions: {
      invoke: (fn: string, opts: any) => {
        callLog.push("functions.invoke");
        return mockFunctionsInvoke(fn, opts);
      },
    },
  };

  // Default happy-path returns
  mockSingle.mockResolvedValue({ data: MOCK_ORDER, error: null });
  mockSelect.mockReturnValue({ single: mockSingle });
  mockOrdersInsert.mockReturnValue({ select: mockSelect });
  mockEq.mockResolvedValue({ error: null });
  mockOrdersUpdate.mockReturnValue({ eq: mockEq });
  mockItemsInsert.mockResolvedValue({ error: null });
  mockFunctionsInvoke.mockResolvedValue({ error: null });
});

// createPendingOrder
describe("createPendingOrder", () => {
  it("inserts an order row with status=pending and expires_at=null", async () => {
    await createPendingOrder(BASE_INPUT);

    expect(mockOrdersInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "pending",
        expires_at: null,
        customer_id: "user-1",
        farm_id: "farm-1",
        total_price: 45,
      }),
    );
  });

  it("inserts order_items for the order", async () => {
    await createPendingOrder(BASE_INPUT);

    expect(mockItemsInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          order_id: MOCK_ORDER.id,
          produce_name: "Tomat",
          qty: 2,
          unit: "kg",
          price: 45,
        }),
      ]),
    );
  });

  it("does NOT call decrement-stock", async () => {
    await createPendingOrder(BASE_INPUT);
    expect(mockFunctionsInvoke).not.toHaveBeenCalled();
  });

  it("throws 'Supabase is not configured' when supabase is null", async () => {
    mockSupabaseValue = null;
    await expect(createPendingOrder(BASE_INPUT)).rejects.toThrow(
      "Supabase is not configured.",
    );
  });
});

// confirmOrder
describe("confirmOrder", () => {
  const items = [{ produce_id: "tomat", qty: 2 }];

  it("calls decrement-stock BEFORE updating orders.status (regression for stage-2 reorder)", async () => {
    await confirmOrder("order-1", "farm-1", items, "token-abc");

    // The callLog entries are pushed in execution order.
    expect(callLog.indexOf("functions.invoke")).toBeLessThan(
      callLog.indexOf("orders.update"),
    );
  });

  it("propagates a decrement-stock failure without touching orders.status", async () => {
    mockFunctionsInvoke.mockResolvedValue({ error: new Error("stock error") });

    await expect(
      confirmOrder("order-1", "farm-1", items, "token-abc"),
    ).rejects.toThrow("stock error");

    expect(mockOrdersUpdate).not.toHaveBeenCalled();
  });

  it("sends the Authorization header to decrement-stock", async () => {
    await confirmOrder("order-1", "farm-1", items, "my-token");

    expect(mockFunctionsInvoke).toHaveBeenCalledWith(
      "decrement-stock",
      expect.objectContaining({
        headers: { Authorization: "Bearer my-token" },
      }),
    );
  });

  it("throws 'Supabase is not configured' when supabase is null", async () => {
    mockSupabaseValue = null;
    await expect(
      confirmOrder("order-1", "farm-1", items, "token"),
    ).rejects.toThrow("Supabase is not configured.");
  });
});

// createOrder (reservation flow)
describe("createOrder", () => {
  it("sets expires_at 48 h ahead for reservation delivery_method", async () => {
    const beforeMs = Date.now();

    await createOrder({ ...BASE_INPUT, delivery_method: "reservation" });

    const afterMs = Date.now();
    const insertArg = (mockOrdersInsert.mock.calls as any[][])[0]![0];
    const expiresMs = new Date(insertArg.expires_at).getTime();
    const expected = 48 * 60 * 60 * 1000;

    expect(expiresMs).toBeGreaterThanOrEqual(beforeMs + expected);
    expect(expiresMs).toBeLessThanOrEqual(afterMs + expected + 1000);
  });

  it("sets expires_at=null for pickup delivery_method", async () => {
    await createOrder({ ...BASE_INPUT, delivery_method: "pickup" });

    const insertArg = (mockOrdersInsert.mock.calls as any[][])[0]![0];
    expect(insertArg.expires_at).toBeNull();
  });

  it("calls decrement-stock after inserting the order", async () => {
    await createOrder(BASE_INPUT);
    expect(mockFunctionsInvoke).toHaveBeenCalledWith(
      "decrement-stock",
      expect.objectContaining({
        body: expect.objectContaining({ farm_user_id: "farm-1" }),
      }),
    );
  });

  it("throws 'Supabase is not configured' when supabase is null", async () => {
    mockSupabaseValue = null;
    await expect(createOrder(BASE_INPUT)).rejects.toThrow(
      "Supabase is not configured.",
    );
  });
});
