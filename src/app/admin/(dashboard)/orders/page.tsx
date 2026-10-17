import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import OrdersClient from "@/components/admin/OrdersClient";

export const metadata = { title: "Orders — Admin" };

export default async function AdminOrdersPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Orders</h1>
        <p className="text-ink/60 text-sm">
          Manage every order — verify bKash payments, confirm, ship, and
          deliver.
        </p>
      </div>

      <OrdersClient orders={orders || []} />
    </div>
  );
}