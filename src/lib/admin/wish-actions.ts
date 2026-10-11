"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";

export type WishStatus = "pending" | "sourcing" | "available" | "closed";

export async function updateWishStatus(id: string, status: WishStatus) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("wish_requests")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/wish-requests");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateWishNotes(id: string, notes: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("wish_requests")
    .update({ internal_notes: notes || null })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/wish-requests");
  return { success: true };
}

export async function deleteWish(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("wish_requests")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/wish-requests");
  revalidatePath("/admin");
  return { success: true };
}