"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";
import {
  CalendarDays,
  Download,
  MessageSquare,
  Phone,
  Search,
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
import { Card, CardContent } from "@/components/ui/card";
import EnquiryDetailDrawer from "@/components/admin/EnquiryDetailDrawer";
import { ENQUIRY_STATUSES, getEnquiryStatusConfig } from "@/lib/admin/status";
import { exportToCSV } from "@/lib/admin/csv";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Enquiry, Product } from "@/lib/types";

type EnquiryWithProduct = Enquiry & {
  product?: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price: number;
  } | null;
};

type Props = {
  enquiries: EnquiryWithProduct[];
};

type QuickFilter = "all" | "today" | "week" | "month";

export default function EnquiriesClient({ enquiries }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all");
  const [selected, setSelected] = useState<EnquiryWithProduct | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [, startTransition] = useTransition();

  // Realtime subscription
  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    const channelName = `enquiries-admin-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enquiries" },
        () => {
          if (!cancelled) startTransition(() => router.refresh());
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      if (!cancelled) startTransition(() => router.refresh());
    }, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [router]);

  // Stats
  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      all: enquiries.length,
      new: 0,
      contacted: 0,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
    };
    enquiries.forEach((e) => {
      counts[e.status] = (counts[e.status] || 0) + 1;
    });
    return counts;
  }, [enquiries]);

  // Filter
  const filtered = useMemo(() => {
    return enquiries.filter((e) => {
      if (search) {
        const q = search.toLowerCase();
        const matches =
          e.customer_name.toLowerCase().includes(q) ||
          e.phone.toLowerCase().includes(q) ||
          (e.email || "").toLowerCase().includes(q) ||
          (e.product_name || "").toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (statusFilter !== "all" && e.status !== statusFilter) return false;

      if (quickFilter !== "all") {
        const d = new Date(e.created_at);
        if (quickFilter === "today" && !isToday(d)) return false;
        if (quickFilter === "week" && !isThisWeek(d)) return false;
        if (quickFilter === "month" && !isThisMonth(d)) return false;
      }
      return true;
    });
  }, [enquiries, search, statusFilter, quickFilter]);

  const openEnquiry = (e: EnquiryWithProduct) => {
    setSelected(e);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error("No enquiries to export");
      return;
    }
    exportToCSV(
      filtered,
      [
        { key: "created_at", label: "Date" },
        { key: "customer_name", label: "Customer" },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email" },
        { key: "product_name", label: "Product" },
        { key: "preferred_time", label: "Preferred Time" },
        { key: "preferred_visit_date", label: "Visit Date" },
        { key: "status", label: "Status" },
        { key: "message", label: "Message" },
        { key: "internal_notes", label: "Notes" },
      ],
      "enquiries"
    );
    toast.success(`Exported ${filtered.length} enquiries`);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setQuickFilter("all");
  };

  const hasFilters =
    !!search || statusFilter !== "all" || quickFilter !== "all";

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Stats cards ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <StatCard
          label="All"
          value={stats.all}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        {ENQUIRY_STATUSES.map((s) => (
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

      {/* ── Filters ─────────────────────────────────── */}
      <div className="space-y-3">
        {/* Search — always full width */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <Input
            placeholder="Search enquiries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick filter + status — side by side on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-[160px_180px_1fr_auto] gap-2 sm:gap-3">
          <Select
            value={quickFilter}
            onValueChange={(v) => setQuickFilter(v as QuickFilter)}
          >
            <SelectTrigger className="w-full">
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
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {ENQUIRY_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear — only when filters active, spans on mobile */}
          {hasFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="col-span-2 lg:col-span-1 w-full lg:w-auto"
            >
              <X className="w-4 h-4 mr-2" />
              Clear filters
            </Button>
          )}

          {/* Export */}
          <Button
            variant="outline"
            onClick={handleExport}
            className={cn(
              "w-full lg:w-auto",
              hasFilters ? "col-span-2 lg:col-span-1" : "col-span-2"
            )}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* ── Results count ───────────────────────────── */}
      <p className="text-xs sm:text-sm text-ink/60">
        Showing <strong>{filtered.length}</strong> of {enquiries.length}{" "}
        enquiries
      </p>

      {/* ═══════════════════════════════════════════════════
          MOBILE CARD LIST (< md)
          ═══════════════════════════════════════════════════ */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 px-4 rounded-xl border border-black/5 bg-white text-ink/50">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 text-ink/20" />
            <p className="text-sm">
              {enquiries.length === 0
                ? "No enquiries yet. They'll appear here when customers submit them."
                : "No enquiries match your filters."}
            </p>
          </div>
        )}

        {filtered.map((e) => {
          const sc = getEnquiryStatusConfig(e.status as any);
          return (
            <button
              key={e.id}
              onClick={() => openEnquiry(e)}
              className="w-full text-left p-3 rounded-xl border border-black/5 bg-white hover:bg-cream/40 active:bg-cream/60 transition-colors"
            >
              {/* Top row: name + status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink text-sm truncate">
                    {e.customer_name}
                  </p>
                  {e.email && (
                    <p className="text-xs text-ink/50 truncate mt-0.5">
                      {e.email}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn("shrink-0 text-[10px] px-1.5 py-0", sc.color)}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mr-1",
                      sc.dotColor
                    )}
                  />
                  {sc.label}
                </Badge>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-1.5 text-xs text-ink/70 mb-1.5">
                <Phone className="w-3 h-3 text-ink/40 shrink-0" />
                <span className="truncate">{e.phone}</span>
              </div>

              {/* Product */}
              {e.product_name && (
                <p className="text-xs text-ink/70 truncate mb-1.5">
                  <span className="text-ink/40">Product:</span>{" "}
                  {e.product_name}
                </p>
              )}

              {/* Meta row: visit date + received */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink/50">
                {e.preferred_visit_date && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    Visit:{" "}
                    {format(new Date(e.preferred_visit_date), "MMM d, yyyy")}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {format(new Date(e.created_at), "MMM d, h:mm a")}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════
          DESKTOP TABLE (md+)
          ═══════════════════════════════════════════════════ */}
      <div className="hidden md:block rounded-xl border border-black/5 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-cream/50">
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Visit Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-16 text-ink/50"
                  >
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-ink/20" />
                    {enquiries.length === 0
                      ? "No enquiries yet. They'll appear here when customers submit them."
                      : "No enquiries match your filters."}
                  </TableCell>
                </TableRow>
              )}

              {filtered.map((e) => {
                const sc = getEnquiryStatusConfig(e.status as any);
                return (
                  <TableRow
                    key={e.id}
                    onClick={() => openEnquiry(e)}
                    className="cursor-pointer hover:bg-cream/40"
                  >
                    <TableCell>
                      <p className="font-medium text-ink">
                        {e.customer_name}
                      </p>
                      {e.email && (
                        <p className="text-xs text-ink/50 truncate max-w-[200px]">
                          {e.email}
                        </p>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-ink">
                        <Phone className="w-3.5 h-3.5 text-ink/40" />
                        {e.phone}
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className="text-sm text-ink line-clamp-1 max-w-[200px]">
                        {e.product_name || "—"}
                      </p>
                    </TableCell>

                    <TableCell>
                      <p className="text-sm text-ink/70">
                        {e.preferred_visit_date
                          ? format(
                              new Date(e.preferred_visit_date),
                              "MMM d, yyyy"
                            )
                          : "—"}
                      </p>
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

                    <TableCell>
                      <div className="text-xs text-ink/50 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {format(new Date(e.created_at), "MMM d, h:mm a")}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          openEnquiry(e);
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
      </div>

      {/* Drawer */}
      <EnquiryDetailDrawer
        enquiry={selected}
        product={selected?.product}
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
        "text-left p-2.5 sm:p-3 rounded-xl border transition-all",
        active
          ? "border-brass bg-brass/5 ring-2 ring-brass/20"
          : "border-black/5 bg-white hover:border-black/10"
      )}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {dotColor && (
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />
        )}
        <p className="text-[11px] sm:text-xs text-ink/50 truncate">{label}</p>
      </div>
      <p className="font-display text-xl sm:text-2xl text-ink">{value}</p>
    </button>
  );
}