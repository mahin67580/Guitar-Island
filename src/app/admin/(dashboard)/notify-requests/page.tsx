import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import NotifyRequestsClient from "@/components/admin/NotifyRequestsClient";

export const metadata = { title: "Notify Requests — Admin" };

export default async function AdminNotifyPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("notify_requests")
    .select("*, upcoming:upcoming_products(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Notify Requests</h1>
        <p className="text-ink/60 text-sm">
          Customers waiting to hear about upcoming products.
        </p>
      </div>
      <NotifyRequestsClient requests={data || []} />
    </div>
  );
}