import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import UpcomingClient from "@/components/admin/UpcomingClient";
import type { UpcomingProduct } from "@/lib/types";

export const metadata = { title: "Upcoming — Admin" };

export default async function AdminUpcomingPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("upcoming_products")
    .select("*")
    .order("expected_date", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">
          Upcoming Products
        </h1>
        <p className="text-ink/60 text-sm">
          Manage what's coming soon to your shop.
        </p>
      </div>
      <UpcomingClient items={(data as UpcomingProduct[]) || []} />
    </div>
  );
}