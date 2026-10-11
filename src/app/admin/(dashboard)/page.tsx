import Link from "next/link";
import {
  ArrowRight,
  Bell,
  MessageSquare,
  Package,
  Plus,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/helpers";
import { getDashboardData } from "@/lib/admin/dashboard-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/admin/StatCard";
import ActivityFeed from "@/components/admin/ActivityFeed";
import EnquiriesTrendChart from "@/components/admin/charts/EnquiriesTrendChart";
import CategoryDistributionChart from "@/components/admin/charts/CategoryDistributionChart";
import EnquiryStatusChart from "@/components/admin/charts/EnquiryStatusChart";

export const metadata = { title: "Dashboard — Admin" };

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const data = await getDashboardData();

  // Calculate week-over-week trend (rough estimate)
  const trendPercent =
    data.stats.weekEnquiries === 0
      ? 0
      : Math.round(
          (data.stats.todayEnquiries / Math.max(1, data.stats.weekEnquiries)) *
            100
        );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-br from-ink via-wood to-ink p-6 md:p-8 text-cream relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-brass text-xs uppercase tracking-widest mb-2">
              Dashboard
            </p>
            <h1 className="font-display text-2xl md:text-3xl mb-1">
              Welcome back, {user.profile?.full_name || "Admin"}
            </h1>
            <p className="text-cream/60 text-sm max-w-lg">
              Here's how Guitar Island is doing today.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              className="bg-brass hover:bg-brass/90 text-ink font-semibold"
            >
              <Link href="/admin/products/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="border border-cream/30 text-cream hover:bg-cream/10 bg-transparent"
            >
              <Link href="/admin/enquiries">
                View Enquiries
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="New Enquiries"
          value={data.stats.newEnquiries}
          icon={MessageSquare}
          accent="text-blue-600 bg-blue-50"
          href="/admin/enquiries"
          sublabel={`${data.stats.todayEnquiries} today · ${data.stats.weekEnquiries} this week`}
          trend={{ value: trendPercent, label: "today" }}
        />
        <StatCard
          label="Pending Wishes"
          value={data.stats.pendingWishes}
          icon={Sparkles}
          accent="text-purple-600 bg-purple-50"
          href="/admin/wish-requests"
        />
        <StatCard
          label="Unread Messages"
          value={data.stats.unreadMessages}
          icon={Bell}
          accent="text-amber-600 bg-amber-50"
          href="/admin/messages"
        />
        <StatCard
          label="Inventory Value"
          value={`৳${Math.round(data.stats.inventoryValue).toLocaleString()}`}
          icon={Wallet}
          accent="text-green-600 bg-green-50"
          sublabel={`${data.stats.totalStock} items in stock`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">
              Enquiries (Last 30 Days)
            </CardTitle>
            <CardDescription>
              Daily customer enquiries received from your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EnquiriesTrendChart data={data.enquiryTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">
              Products by Category
            </CardTitle>
            <CardDescription>
              How your catalogue is distributed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.productsByCategory.length > 0 ? (
              <CategoryDistributionChart data={data.productsByCategory} />
            ) : (
              <p className="text-center py-12 text-ink/50 text-sm">
                No products yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">
              Enquiries by Status
            </CardTitle>
            <CardDescription>
              Where your customers stand in the pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.enquiriesByStatus.length > 0 ? (
              <EnquiryStatusChart data={data.enquiriesByStatus} />
            ) : (
              <p className="text-center py-12 text-ink/50 text-sm">
                No enquiries yet
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">
              Top Enquired Products
            </CardTitle>
            <CardDescription>Most requested by customers</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topProducts.length === 0 ? (
              <p className="text-center py-8 text-ink/50 text-sm">
                No enquiries yet
              </p>
            ) : (
              <div className="space-y-3">
                {data.topProducts.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-brass/10 text-brass text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="flex-1 text-sm line-clamp-1">{p.name}</p>
                    <span className="text-xs text-ink/50 font-medium">
                      {p.enquiries}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">Recent Activity</CardTitle>
            <CardDescription>
              Latest customer interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={data.recentActivity} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Quick Actions</CardTitle>
            <CardDescription>Jump to common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction
              href="/admin/products/new"
              icon={Plus}
              label="Add Product"
            />
            <QuickAction
              href="/admin/enquiries"
              icon={MessageSquare}
              label="Review Enquiries"
            />
            <QuickAction
              href="/admin/wish-requests"
              icon={Sparkles}
              label="Check Wish Requests"
            />
            <QuickAction
              href="/admin/messages"
              icon={Bell}
              label="Read Messages"
            />
            <QuickAction
              href="/admin/blog/new"
              icon={TrendingUp}
              label="Write a Post"
            />
            <QuickAction
              href="/admin/products"
              icon={Package}
              label="Manage Inventory"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream/60 transition-colors group"
    >
      <div className="w-8 h-8 rounded-md bg-brass/10 text-brass flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm text-ink flex-1">{label}</span>
      <ArrowRight className="w-4 h-4 text-ink/40 group-hover:text-brass group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}