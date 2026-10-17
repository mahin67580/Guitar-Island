import { createClient } from "@/lib/supabase/server";

export type OrderItemData = {
  id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
  subtotal: number;
};

export type OrderData = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string | null;
  district: string | null;
  postal_code: string | null;
  notes: string | null;
  payment_method: "cod" | "bkash";
  payment_status: string;
  payment_reference: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItemData[];
};

export async function getOrderByNumber(
  orderNumber: string
): Promise<OrderData | null> {
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .single();

  if (orderError || !order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  return {
    ...(order as Omit<OrderData, "items">),
    items: (items as OrderItemData[]) || [],
  };
}