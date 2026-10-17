"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CartItemInput = {
  productId: string;
  quantity: number;
};

export type CreateOrderInput = {
  customer_name: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  district?: string;
  postal_code?: string;
  notes?: string;
  payment_method: "cod" | "bkash";
  payment_reference?: string;
  items: CartItemInput[];
  delivery_fee: number;
};

type Result =
  | { success: true; orderNumber: string }
  | { success: false; error: string };

export async function createOrder(input: CreateOrderInput): Promise<Result> {
  const supabase = await createClient();

  // ─── 1. Basic validation ───
  if (!input.customer_name.trim()) {
    return { success: false, error: "Name is required" };
  }
  if (!input.phone.trim() || input.phone.trim().length < 6) {
    return { success: false, error: "Valid phone number is required" };
  }
  if (!input.address.trim()) {
    return { success: false, error: "Address is required" };
  }
  if (!input.items || input.items.length === 0) {
    return { success: false, error: "Your cart is empty" };
  }
  if (input.payment_method === "bkash" && !input.payment_reference?.trim()) {
    return {
      success: false,
      error: "Please enter your bKash transaction ID",
    };
  }

  // ─── 2. Fetch fresh product data for every item ───
  const productIds = input.items.map((i) => i.productId);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, slug, brand, price, discount_price, quantity, images, status")
    .in("id", productIds);

  if (productsError || !products) {
    return {
      success: false,
      error: "Could not verify product availability. Please try again.",
    };
  }

  // ─── 3. Validate every item still in stock ───
  const orderItems: {
    product_id: string;
    product_name: string;
    product_image: string | null;
    unit_price: number;
    quantity: number;
    subtotal: number;
  }[] = [];

  let subtotal = 0;

  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId);

    if (!product) {
      return {
        success: false,
        error: "One of the items is no longer available",
      };
    }

    if (product.status !== "active") {
      return {
        success: false,
        error: `"${product.name}" is no longer available for purchase`,
      };
    }

    if (product.quantity < item.quantity) {
      return {
        success: false,
        error: `Only ${product.quantity} of "${product.name}" left in stock (you wanted ${item.quantity})`,
      };
    }

        // Ensure strict number conversion
    const basePrice = Number(product.price) || 0;
    const discountPrice = Number(product.discount_price) || 0;
    
    // Determine the actual price to charge
    const finalPrice = (discountPrice > 0 && discountPrice < basePrice) 
      ? discountPrice 
      : basePrice;

    // Round to 2 decimals to prevent floating-point bugs
    const unitPrice = Math.round(finalPrice * 100) / 100;

    const lineSubtotal = unitPrice * item.quantity;
    subtotal += lineSubtotal;

    orderItems.push({
      product_id: product.id,
      product_name: product.name,
      product_image: product.images?.[0] ?? null,
      unit_price: unitPrice,
      quantity: item.quantity,
      subtotal: lineSubtotal,
    });
  }

  const total = subtotal + input.delivery_fee;

  // ─── 4. Generate the order number ───
  const { data: orderNumberData, error: orderNumberError } = await supabase.rpc(
    "generate_order_number"
  );

  if (orderNumberError || !orderNumberData) {
    return {
      success: false,
      error: "Could not generate order number. Please try again.",
    };
  }

  const orderNumber = orderNumberData as string;

  // ─── 5. Insert the order ───
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_name: input.customer_name.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || null,
      address: input.address.trim(),
      city: input.city?.trim() || null,
      district: input.district?.trim() || null,
      postal_code: input.postal_code?.trim() || null,
      notes: input.notes?.trim() || null,
      payment_method: input.payment_method,
      payment_status: "pending",
      payment_reference: input.payment_reference?.trim() || null,
      subtotal,
      delivery_fee: input.delivery_fee,
      total,
      status: "new",
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    console.error("Order insert error:", orderError);
    return {
      success: false,
      error: "Could not create your order. Please try again.",
    };
  }

  // ─── 6. Insert order items ───
  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(
      orderItems.map((item) => ({
        order_id: order.id,
        ...item,
      }))
    );

  if (itemsError) {
    console.error("Order items insert error:", itemsError);
    // Roll back the order — safest approach
    await supabase.from("orders").delete().eq("id", order.id);
    return {
      success: false,
      error: "Could not save order items. Please try again.",
    };
  }

  // ─── 7. Decrement stock (best-effort) ───
  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue;

    const newQty = Math.max(0, product.quantity - item.quantity);
    const newStatus = newQty === 0 ? "sold_out" : "active";

    await supabase
      .from("products")
      .update({
        quantity: newQty,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.productId);
  }

  // ─── 8. Revalidate ───
  revalidatePath("/shop");
  revalidatePath("/admin/products");
  revalidatePath("/admin/orders");

  return { success: true, orderNumber: order.order_number };
}