"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";

export async function saveSettings(data: Record<string, any>) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("settings")
    .upsert({ id: 1, data }, { onConflict: "id" });

  if (error) return { error: error.message };

  // Revalidate every public page so new settings show immediately
  revalidatePath("/", "layout");
  revalidatePath("/contact");
  revalidatePath("/about");
  revalidatePath("/shop");
  revalidatePath("/upcoming");
  revalidatePath("/blog");
  revalidatePath("/wishlist");

  return { success: true };
}