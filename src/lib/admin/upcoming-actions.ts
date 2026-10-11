"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";

export type UpcomingInput = {
  name: string;
  image_url?: string | null;
  expected_date?: string | null;
  description?: string | null;
  is_published: boolean;
};

export async function createUpcoming(input: UpcomingInput) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("upcoming_products").insert(input);
  if (error) return { error: error.message };
  revalidatePath("/admin/upcoming");
  revalidatePath("/upcoming");
  revalidatePath("/");
  return { success: true };
}

export async function updateUpcoming(id: string, input: UpcomingInput) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("upcoming_products")
    .update(input)
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/upcoming");
  revalidatePath("/upcoming");
  revalidatePath("/");
  return { success: true };
}

export async function deleteUpcoming(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("upcoming_products")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/upcoming");
  revalidatePath("/upcoming");
  revalidatePath("/");
  return { success: true };
}