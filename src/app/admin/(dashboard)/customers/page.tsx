import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import CustomersClient from "@/components/admin/CustomersClient";

export const metadata = { title: "Customers — Admin" };

type Aggregated = {
  name: string;
  phone: string;
  email: string | null;
  enquiry_count: number;
  wish_count: number;
  last_activity: string;
};

export default async function AdminCustomersPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: enquiries }, { data: wishes }] = await Promise.all([
    supabase.from("enquiries").select("customer_name, phone, email, created_at"),
    supabase.from("wish_requests").select("customer_name, phone, email, created_at"),
  ]);

  // Aggregate by phone (unique contact key)
  const map = new Map<string, Aggregated>();

  const add = (
    name: string,
    phone: string,
    email: string | null,
    createdAt: string,
    kind: "enquiry" | "wish"
  ) => {
    const key = phone.replace(/\D/g, "") || name.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      if (kind === "enquiry") existing.enquiry_count += 1;
      else existing.wish_count += 1;
      if (createdAt > existing.last_activity) existing.last_activity = createdAt;
      if (!existing.email && email) existing.email = email;
    } else {
      map.set(key, {
        name,
        phone,
        email,
        enquiry_count: kind === "enquiry" ? 1 : 0,
        wish_count: kind === "wish" ? 1 : 0,
        last_activity: createdAt,
      });
    }
  };

  (enquiries || []).forEach((e) =>
    add(e.customer_name, e.phone, e.email, e.created_at, "enquiry")
  );
  (wishes || []).forEach((w) =>
    add(w.customer_name, w.phone, w.email, w.created_at, "wish")
  );

  const customers = Array.from(map.values()).sort((a, b) =>
    b.last_activity.localeCompare(a.last_activity)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">All Customers</h1>
        <p className="text-ink/60 text-sm">
          Every customer who has contacted you, aggregated by phone number.
        </p>
      </div>
      <CustomersClient customers={customers} />
    </div>
  );
}