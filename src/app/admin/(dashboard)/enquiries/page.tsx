import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import EnquiriesClient from "@/components/admin/EnquiriesClient";
import type { Enquiry } from "@/lib/types";

export const metadata = { title: "Enquiries — Admin" };

export default async function AdminEnquiriesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: enquiries } = await supabase
    .from("enquiries")
    .select(
      `
      *,
      product:products(id, name, slug, images, price)
    `
    )
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Customer Enquiries</h1>
        <p className="text-ink/60 text-sm">
          Every enquiry from the website lands here. Call them, schedule a
          visit, mark the outcome.
        </p>
      </div>

      <EnquiriesClient
        enquiries={(enquiries as Enquiry[]) || []}
      />
    </div>
  );
}