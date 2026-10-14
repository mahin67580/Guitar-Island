"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Bell, Download, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportToCSV } from "@/lib/admin/csv";

type Row = {
  id: string;
  customer_name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  upcoming: { name: string } | null;
};

export default function NotifyRequestsClient({ requests }: { requests: Row[] }) {
  const [search, setSearch] = useState("");

  const filtered = requests.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.customer_name || "").toLowerCase().includes(q) ||
      (r.phone || "").toLowerCase().includes(q) ||
      (r.upcoming?.name || "").toLowerCase().includes(q)
    );
  });

  const handleExport = () => {
    exportToCSV(
      filtered.map((r) => ({
        date: r.created_at,
        customer: r.customer_name || "",
        phone: r.phone || "",
        email: r.email || "",
        product: r.upcoming?.name || "",
      })),
      [
        { key: "date", label: "Date" },
        { key: "customer", label: "Customer" },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email" },
        { key: "product", label: "Upcoming Product" },
      ],
      "notify-requests"
    );
    toast.success(`Exported ${filtered.length} requests`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Filters ───────────────────────────────────── */}
      <div className="space-y-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <Input
            placeholder="Search by name, phone, or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          variant="outline"
          onClick={handleExport}
          className="w-full sm:w-auto sm:ml-auto flex justify-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* ═══════════════════════════════════════════════════
          MOBILE CARD LIST (< md)
          ═══════════════════════════════════════════════════ */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 px-4 rounded-xl border border-black/5 bg-white text-ink/50">
            <Bell className="w-10 h-10 mx-auto mb-3 text-ink/20" />
            <p className="text-sm">
              {requests.length === 0
                ? "No notify requests yet."
                : "No requests match your search."}
            </p>
          </div>
        )}

        {filtered.map((r) => (
          <div
            key={r.id}
            className="p-3 rounded-xl border border-black/5 bg-white"
          >
            {/* Top row: customer + date */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="font-medium text-ink text-sm truncate flex-1">
                {r.customer_name || "Anonymous"}
              </p>
              <span className="text-[11px] text-ink/50 shrink-0 mt-0.5">
                {format(new Date(r.created_at), "MMM d, yyyy")}
              </span>
            </div>

            {/* Contact */}
            {r.phone && (
              <p className="text-xs text-ink/70 truncate">
                <span className="text-ink/40">Phone:</span> {r.phone}
              </p>
            )}
            {r.email && (
              <p className="text-xs text-ink/50 truncate mt-0.5">
                <span className="text-ink/40">Email:</span> {r.email}
              </p>
            )}

            {/* Product */}
            {r.upcoming?.name && (
              <p className="text-xs text-ink/70 truncate mt-2">
                <span className="text-ink/40">Wants:</span> {r.upcoming.name}
              </p>
            )}
          </div>
        ))}
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
                <TableHead>Upcoming Product</TableHead>
                <TableHead>Requested</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-16 text-ink/50">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-ink/20" />
                    {requests.length === 0
                      ? "No notify requests yet."
                      : "No requests match your search."}
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.customer_name || "Anonymous"}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{r.phone}</div>
                    {r.email && (
                      <div className="text-xs text-ink/50">{r.email}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.upcoming?.name || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-ink/50">
                    {format(new Date(r.created_at), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}