import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Clock,
  DollarSign,
  MessageSquare,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Truck,
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
import RevenueTrendChart from "@/components/admin/charts/RevenueTrendChart";

export const metadata = { title: "Dashboard — Admin" };

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const data = await getDashboardData();

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
              Here&apos;s how Guitar Island is doing today.
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
              <Link href="/admin/orders">
                <ShoppingBag className="w-4 h-4 mr-2" />
                View Orders
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ORDER STATS ROW */}
      <div>
        <h2 className="font-display text-lg text-ink mb-3">Orders</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Today's Orders"
            value={data.stats.todayOrders}
            icon={ShoppingCart}
            accent="text-blue-600 bg-blue-50"
            href="/admin/orders"
            sublabel={`${data.stats.totalOrders} total`}
          />
          <StatCard
            label="Pending Orders"
            value={data.stats.pendingOrders}
            icon={Clock}
            accent="text-amber-600 bg-amber-50"
            href="/admin/orders"
            sublabel="Awaiting completion"
          />
          <StatCard
            label="Delivered"
            value={data.stats.deliveredOrders}
            icon={Truck}
            accent="text-green-600 bg-green-50"
            href="/admin/orders"
            sublabel="Lifetime"
          />
          <StatCard
            label="Month Revenue"
            value={`৳${Math.round(data.stats.monthRevenue).toLocaleString()}`}
            icon={DollarSign}
            accent="text-brass bg-brass/10"
            href="/admin/orders"
            sublabel="From delivered orders"
          />
        </div>
      </div>

      {/* CUSTOMER STATS ROW */}
      <div>
        <h2 className="font-display text-lg text-ink mb-3">Customers</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="New Enquiries"
            value={data.stats.newEnquiries}
            icon={MessageSquare}
            accent="text-blue-600 bg-blue-50"
            href="/admin/enquiries"
            sublabel={`${data.stats.todayEnquiries} today`}
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
            href="/admin/products"
            sublabel={`${data.stats.totalStock} items in stock`}
          />
        </div>
      </div>

      {/* REVENUE TREND + TOP SELLING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">
              Revenue (Last 30 Days)
            </CardTitle>
            <CardDescription>
              Delivered orders only — revenue actually collected
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.orderRevenueTrend.some((d) => d.revenue > 0) ? (
              <RevenueTrendChart data={data.orderRevenueTrend} />
            ) : (
              <div className="text-center py-16">
                <p className="text-ink/50 text-sm">
                  No delivered orders yet — revenue will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Top Selling</CardTitle>
            <CardDescription>Best performing products</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topSellingProducts.length === 0 ? (
              <p className="text-center py-8 text-ink/50 text-sm">
                No sales yet
              </p>
            ) : (
              <div className="space-y-3">
                {data.topSellingProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-brass/10 text-brass text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-1">{p.name}</p>
                      <p className="text-xs text-ink/50">
                        ৳{p.revenue.toLocaleString()} revenue
                      </p>
                    </div>
                    <span className="text-xs font-medium text-ink shrink-0">
                      {p.quantity} sold
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ENQUIRY TREND + CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display">
              Enquiries (Last 30 Days)
            </CardTitle>
            <CardDescription>
              Daily customer enquiries received
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
            <CardDescription>Catalogue distribution</CardDescription>
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

      {/* RECENT ORDERS + ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display">Recent Orders</CardTitle>
              <CardDescription>Latest 5 orders received</CardDescription>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link href="/admin/orders" className="text-brass">
                View all
                <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentOrders.length === 0 ? (
              <p className="text-center py-8 text-ink/50 text-sm">
                No orders yet
              </p>
            ) : (
              <div className="space-y-1">
                {data.recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href="/admin/orders"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream/50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-full bg-brass/10 text-brass flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink leading-snug">
                        <strong className="font-medium font-mono">
                          {order.order_number}
                        </strong>{" "}
                        · {order.customer_name}
                      </p>
                      <p className="text-xs text-ink/50 mt-0.5">
                        ৳{Number(order.total).toLocaleString()} ·{" "}
                        <span className="capitalize">{order.status}</span>
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-ink/40 group-hover:text-brass group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Recent Activity</CardTitle>
            <CardDescription>Latest customer interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={data.recentActivity} />
          </CardContent>
        </Card>
      </div>

      {/* QUICK ACTIONS */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Quick Actions</CardTitle>
          <CardDescription>Jump to common tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <QuickAction
            href="/admin/products/new"
            icon={Plus}
            label="Add Product"
          />
          <QuickAction
            href="/admin/orders"
            icon={ShoppingBag}
            label="Review Orders"
          />
          <QuickAction
            href="/admin/enquiries"
            icon={MessageSquare}
            label="Review Enquiries"
          />
          <QuickAction
            href="/admin/wish-requests"
            icon={Sparkles}
            label="Wish Requests"
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
        </CardContent>
      </Card>
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
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream/60 transition-colors group border border-black/5"
    >
      <div className="w-8 h-8 rounded-md bg-brass/10 text-brass flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm text-ink flex-1">{label}</span>
      <ArrowRight className="w-4 h-4 text-ink/40 group-hover:text-brass group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}