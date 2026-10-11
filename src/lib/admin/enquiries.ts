"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/helpers";

export type EnquiryStatus =
  | "new"
  | "contacted"
  | "scheduled"
  | "completed"
  | "cancelled";

export async function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateEnquiryNotes(
  id: string,
  notes: string,
  followUpDate: string | null
) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("enquiries")
    .update({
      internal_notes: notes || null,
      follow_up_date: followUpDate || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/enquiries");
  return { success: true };
}

export async function deleteEnquiry(id: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("enquiries").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  return { success: true };
}

export async function getNewEnquiriesCount() {
  await requireAdmin();
  const supabase = await createClient();
  const { count } = await supabase
    .from("enquiries")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");
  return count ?? 0;
}