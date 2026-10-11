import Link from "next/link";
import {
  Guitar,
  MessageSquare,
  Package,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard — Guitar Island Admin",
};

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const supabase = await createClient();

  // Fetch quick stats
  const [products, enquiries, wishes, messages] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("enquiries")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("wish_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false),
  ]);

  const stats = [
    {
      label: "Products",
      value: products.count ?? 0,
      icon: Package,
      href: "/admin/products",
      accent: "text-brass bg-brass/10",
    },
    {
      label: "New Enquiries",
      value: enquiries.count ?? 0,
      icon: MessageSquare,
      href: "/admin/enquiries",
      accent: "text-blue-600 bg-blue-50",
    },
    {
      label: "Pending Wishes",
      value: wishes.count ?? 0,
      icon: Sparkles,
      href: "/admin/wish-requests",
      accent: "text-purple-600 bg-purple-50",
    },
    {
      label: "Unread Messages",
      value: messages.count ?? 0,
      icon: TrendingUp,
      href: "/admin/messages",
      accent: "text-red-600 bg-red-50",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="rounded-2xl bg-gradient-to-br from-ink via-wood to-ink p-8 text-cream relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Guitar className="w-5 h-5 text-brass" />
            <p className="text-brass text-xs uppercase tracking-widest">
              Welcome back
            </p>
          </div>
          <h1 className="font-display text-3xl md:text-4xl mb-2">
            Hello, {user.profile?.full_name || "Admin"}
          </h1>
          <p className="text-cream/60 max-w-lg text-sm">
            Manage your shop from here. Phase 8 is the layout shell — the
            dashboard widgets and CRUD pages arrive in the next phases.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const { label, value, icon: Icon, href, accent } = stat;
          return (
            <Link key={label} href={href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-display text-ink mb-1">
                    {value}
                  </p>
                  <p className="text-xs text-ink/60">{label}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Phase 8 notice */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">
            Phase 8 Complete — Admin Shell Ready
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-ink/60">
            You're logged in as <strong>{user.email}</strong> with{" "}
            <strong>admin</strong> role. The sidebar links work — clicking
            them will show placeholder pages until we build the CRUD in later
            phases.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="bg-brass hover:bg-brass/90 text-ink">
              <Link href="/admin/products">Manage Products</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/enquiries">View Enquiries</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/" target="_blank">
                View Shop →
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}