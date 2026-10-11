import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import WishRequestsClient from "@/components/admin/WishRequestsClient";
import type { WishRequest } from "@/lib/types";

export const metadata = { title: "Wish Requests — Admin" };

export default async function AdminWishesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("wish_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Wish Requests</h1>
        <p className="text-ink/60 text-sm">
          Customers asking for guitars not in your catalogue.
        </p>
      </div>
      <WishRequestsClient wishes={(data as WishRequest[]) || []} />
    </div>
  );
}