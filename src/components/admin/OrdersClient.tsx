"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";
import {
  Download,
  Package,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import OrderDetailDrawer from "@/components/admin/OrderDetailDrawer";
import type { Order } from "@/components/admin/OrderDetailDrawer";

import {
  ORDER_STATUSES,
  getOrderStatusConfig,
} from "@/lib/admin/order-status";
import { exportToCSV } from "@/lib/admin/csv";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/admin/orders-actions";



type Props = {
  orders: Order[];
};

type QuickFilter = "all" | "today" | "week" | "month";

export default function OrdersClient({ orders }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Realtime: refresh when new orders come in
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    const channelName = `orders-admin-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          if (!cancelled) startTransition(() => router.refresh());
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      if (!cancelled) startTransition(() => router.refresh());
    }, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [router]);

  // Stats
  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      all: orders.length,
      new: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  // Filter
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (search) {
        const q = search.toLowerCase();
        const matches =
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (paymentFilter !== "all" && o.payment_method !== paymentFilter)
        return false;

      if (quickFilter !== "all") {
        const d = new Date(o.created_at);
        if (quickFilter === "today" && !isToday(d)) return false;
        if (quickFilter === "week" && !isThisWeek(d)) return false;
        if (quickFilter === "month" && !isThisMonth(d)) return false;
      }
      return true;
    });
  }, [orders, search, statusFilter, paymentFilter, quickFilter]);

  const openOrder = (order: Order) => {
    setSelected(order);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error("No orders to export");
      return;
    }
    exportToCSV(
      filtered.map((o) => ({
        ...o,
        item_count: o.items?.reduce((s, i) => s + i.quantity, 0) || 0,
      })),
      [
        { key: "order_number", label: "Order #" },
        { key: "created_at", label: "Date" },
        { key: "customer_name", label: "Customer" },
        { key: "phone", label: "Phone" },
        { key: "payment_method", label: "Payment" },
        { key: "payment_status", label: "Payment Status" },
        { key: "total", label: "Total" },
        { key: "status", label: "Order Status" },
        { key: "item_count", label: "Items" },
      ],
      "orders"
    );
    toast.success(`Exported ${filtered.length} orders`);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setQuickFilter("all");
  };

  const hasFilters =
    !!search ||
    statusFilter !== "all" ||
    paymentFilter !== "all" ||
    quickFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Stat cards (2 columns on mobile, 6 on desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="All"
          value={stats.all}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        {ORDER_STATUSES.map((s) => (
          <StatCard
            key={s.value}
            label={s.label}
            value={stats[s.value] || 0}
            active={statusFilter === s.value}
            onClick={() => setStatusFilter(s.value)}
            dotColor={s.dotColor}
          />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <Input
            placeholder="Search by order #, name, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex gap-2 lg:gap-3">
          <Select
            value={quickFilter}
            onValueChange={(v) => setQuickFilter(v as QuickFilter)}
          >
            <SelectTrigger className="w-full lg:w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-[150px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full lg:w-[130px]">
              <SelectValue placeholder="All payments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payments</SelectItem>
              <SelectItem value="cod">COD</SelectItem>
              <SelectItem value="bkash">bKash</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {hasFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="flex-1 lg:flex-none"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex-1 lg:flex-none"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <p className="text-sm text-ink/60">
        Showing <strong>{filtered.length}</strong> of {orders.length} orders
      </p>

      {/* ─── MOBILE: Cards ─── */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 rounded-xl bg-cream/50 text-ink/50">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-ink/20" />
            <p>
              {orders.length === 0
                ? "No orders yet."
                : "No orders match your filters."}
            </p>
          </div>
        )}

        {filtered.map((o) => {
          const sc = getOrderStatusConfig(o.status);
          const itemCount =
            o.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
          return (
            <button
              key={o.id}
              onClick={() => openOrder(o)}
              className="w-full text-left p-4 rounded-xl border border-black/5 bg-white hover:border-brass/40 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono font-medium text-ink text-sm">
                    {o.order_number}
                  </p>
                  <p className="text-xs text-ink/50 mt-0.5">
                    {format(new Date(o.created_at), "MMM d, h:mm a")}
                  </p>
                </div>
                <Badge variant="outline" className={cn("shrink-0", sc.color)}>
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mr-1.5",
                      sc.dotColor
                    )}
                  />
                  {sc.label}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-ink font-medium">{o.customer_name}</p>
                  <p className="text-ink/50 text-xs">{o.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg text-ink">
                    ৳{Number(o.total).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 justify-end text-xs text-ink/50">
                    <span>
                      {o.payment_method === "bkash" ? "bKash" : "COD"}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {itemCount}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── DESKTOP: Table ─── */}
      <div className="hidden md:block rounded-xl border border-black/5 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-cream/50">
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-16 text-ink/50"
                >
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-ink/20" />
                  {orders.length === 0
                    ? "No orders yet."
                    : "No orders match your filters."}
                </TableCell>
              </TableRow>
            )}

            {filtered.map((o) => {
              const sc = getOrderStatusConfig(o.status);
              const itemCount =
                o.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

              return (
                <TableRow
                  key={o.id}
                  onClick={() => openOrder(o)}
                  className="cursor-pointer hover:bg-cream/40"
                >
                  <TableCell>
                    <p className="font-medium text-ink font-mono text-sm">
                      {o.order_number}
                    </p>
                  </TableCell>

                  <TableCell>
                    <p className="font-medium text-ink">{o.customer_name}</p>
                    <p className="text-xs text-ink/50">{o.phone}</p>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm text-ink/70">
                      <Package className="w-3.5 h-3.5" />
                      {itemCount} item{itemCount === 1 ? "" : "s"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        o.payment_method === "bkash"
                          ? "bg-pink-50 text-pink-700 border-pink-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      )}
                    >
                      {o.payment_method === "bkash" ? "bKash" : "COD"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right font-display text-ink">
                    ৳{Number(o.total).toLocaleString()}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0", sc.color)}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full mr-1.5",
                          sc.dotColor
                        )}
                      />
                      {sc.label}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs text-ink/50">
                    {format(new Date(o.created_at), "MMM d, h:mm a")}
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        openOrder(o);
                      }}
                      className="text-brass hover:text-brass/80"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <OrderDetailDrawer
        order={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  active,
  onClick,
  dotColor,
}: {
  label: string;
  value: number;
  active?: boolean;
  onClick?: () => void;
  dotColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left p-3 rounded-xl border transition-all",
        active
          ? "border-brass bg-brass/5 ring-2 ring-brass/20"
          : "border-black/5 bg-white hover:border-black/10"
      )}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {dotColor && (
          <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
        )}
        <p className="text-xs text-ink/50">{label}</p>
      </div>
      <p className="font-display text-2xl text-ink">{value}</p>
    </button>
  );
}