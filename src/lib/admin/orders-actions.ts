"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";

export type OrderStatus =
  | "new"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "verified"
  | "failed"
  | "refunded";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();
  const supabase = await createClient();

  // When cancelling, restore stock
  if (status === "cancelled") {
    const { data: order } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    // Only restore stock if it wasn't already cancelled
    if (order?.status !== "cancelled") {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", orderId);

      if (items) {
        for (const item of items) {
          if (!item.product_id) continue;
          const { data: product } = await supabase
            .from("products")
            .select("quantity")
            .eq("id", item.product_id)
            .single();

          if (product) {
            await supabase
              .from("products")
              .update({
                quantity: product.quantity + item.quantity,
                status: "active",
                updated_at: new Date().toISOString(),
              })
              .eq("id", item.product_id);
          }
        }
      }
    }
  }

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/shop");
  return { success: true };
}

export async function updatePaymentStatus(
  orderId: string,
  payment_status: PaymentStatus
) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateOrderNotes(orderId: string, notes: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ admin_notes: notes || null, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  return { success: true };
}

export async function deleteOrder(orderId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("orders").delete().eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true };
}