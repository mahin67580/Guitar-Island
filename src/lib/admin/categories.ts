"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";
import type { Category } from "@/lib/types";

export async function getAllCategories(): Promise<Category[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  return (data as Category[]) || [];
}