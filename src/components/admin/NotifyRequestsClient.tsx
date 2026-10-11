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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
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
  );
}