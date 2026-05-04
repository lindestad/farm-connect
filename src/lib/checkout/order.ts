import { supabase } from "../supabase";

export type OrderStatus = "pending" | "confirmed" | "cancelled";
export type DeliveryMethod = "pickup" | "reservation";

export type Order = {
  id: string;
  customer_id: string;
  farm_id: string;
  status: OrderStatus;
  delivery_method: DeliveryMethod;
  pickup_notes: string | null;
  total_price: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  produce_name: string;
  qty: number;
  unit: string;
  price: number;
};

export type CreateOrderInput = {
  customer_id: string;
  farm_id: string;
  delivery_method: DeliveryMethod;
  pickup_notes?: string;
  items: (Omit<OrderItem, "id" | "order_id"> & { produce_id?: string })[];
};

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const total_price = input.items.reduce((sum, item) => sum + item.price, 0);
  const expires_at =
    input.delivery_method === "reservation"
      ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      : null;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: input.customer_id,
      farm_id: input.farm_id,
      status: "pending",
      delivery_method: input.delivery_method,
      pickup_notes: input.pickup_notes?.trim() || null,
      total_price,
      expires_at,
    })
    .select("*")
    .single<Order>();

  if (orderError) throw orderError;

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.items.map((item) => ({
      order_id: order.id,
      produce_name: item.produce_name,
      qty: item.qty,
      unit: item.unit,
      price: item.price,
    })),
  );

  if (itemsError) throw itemsError;

  // Decrement stock in farm_produce. farm_produce.farm_id references farm_profiles(id),
  // while input.farm_id is profiles(id) = farm_profiles.user_id, so we resolve it first.
  const itemsWithProduce = input.items.filter((i) => i.produce_id);
  if (itemsWithProduce.length > 0) {
    const { data: farmProfileData } = await supabase
      .from("farm_profiles")
      .select("id")
      .eq("user_id", input.farm_id)
      .single();

    if (farmProfileData) {
      for (const item of itemsWithProduce) {
        const { data: stockRow } = await supabase
          .from("farm_produce")
          .select("stock")
          .eq("farm_id", farmProfileData.id)
          .eq("produce_id", item.produce_id!)
          .single();

        if (stockRow && stockRow.stock >= item.qty) {
          await supabase
            .from("farm_produce")
            .update({
              stock: stockRow.stock - item.qty,
              updated_at: new Date().toISOString(),
            })
            .eq("farm_id", farmProfileData.id)
            .eq("produce_id", item.produce_id!);
        }
      }
    }
  }

  return order;
}

export async function fetchOrdersByCustomer(
  customerId: string,
): Promise<Order[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchOrdersByFarm(farmId: string): Promise<Order[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("farm_id", farmId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchOrderItems(orderId: string): Promise<OrderItem[]> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (error) throw error;
  return data ?? [];
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) throw error;
}
