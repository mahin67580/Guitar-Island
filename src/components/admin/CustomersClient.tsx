"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Download, MessageCircle, Phone, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportToCSV } from "@/lib/admin/csv";

type Customer = {
  name: string;
  phone: string;
  email: string | null;
  enquiry_count: number;
  wish_count: number;
  last_activity: string;
};

export default function CustomersClient({
  customers,
}: {
  customers: Customer[];
}) {
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  const handleExport = () => {
    exportToCSV(
      filtered,
      [
        { key: "name", label: "Name" },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email" },
        { key: "enquiry_count", label: "Enquiries" },
        { key: "wish_count", label: "Wish Requests" },
        { key: "last_activity", label: "Last Activity" },
      ],
      "customers"
    );
    toast.success(`Exported ${filtered.length} customers`);
  };

  return (
    <div className="space-y-4">
      {/* ── Filters ───────────────────────────────────── */}
      <div className="space-y-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <Input
            placeholder="Search by name, phone, or email..."
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
            <Users className="w-10 h-10 mx-auto mb-3 text-ink/20" />
            <p className="text-sm">
              {customers.length === 0
                ? "No customers yet."
                : "No customers match your search."}
            </p>
          </div>
        )}

        {filtered.map((c) => (
          <div
            key={c.phone}
            className="p-3 rounded-xl border border-black/5 bg-white"
          >
            {/* Top row: name + last activity */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="font-medium text-ink text-sm truncate flex-1">
                {c.name}
              </p>
              <span className="text-[11px] text-ink/50 shrink-0 mt-0.5">
                {format(new Date(c.last_activity), "MMM d, yyyy")}
              </span>
            </div>

            {/* Contact */}
            <p className="text-xs text-ink/70 truncate">
              <span className="text-ink/40">Phone:</span> {c.phone}
            </p>
            {c.email && (
              <p className="text-xs text-ink/50 truncate mt-0.5">
                <span className="text-ink/40">Email:</span> {c.email}
              </p>
            )}

            {/* Counts */}
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <Badge
                variant={c.enquiry_count > 0 ? "default" : "outline"}
                className="text-[11px]"
              >
                {c.enquiry_count} enquiry
                {c.enquiry_count === 1 ? "" : "s"}
              </Badge>
              <Badge
                variant={c.wish_count > 0 ? "secondary" : "outline"}
                className="text-[11px]"
              >
                {c.wish_count} wish{c.wish_count === 1 ? "" : "es"}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex-1 h-9"
              >
                <a href={`tel:${c.phone}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="flex-1 h-9"
              >
                <a
                  href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </a>
              </Button>
            </div>
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
                <TableHead className="text-center">Enquiries</TableHead>
                <TableHead className="text-center">Wishes</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-ink/50">
                    <Users className="w-12 h-12 mx-auto mb-3 text-ink/20" />
                    {customers.length === 0
                      ? "No customers yet."
                      : "No customers match your search."}
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((c) => (
                <TableRow key={c.phone}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <p className="text-sm">{c.phone}</p>
                    {c.email && (
                      <p className="text-xs text-ink/50">{c.email}</p>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={c.enquiry_count > 0 ? "default" : "outline"}>
                      {c.enquiry_count}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={c.wish_count > 0 ? "secondary" : "outline"}>
                      {c.wish_count}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-ink/50">
                    {format(new Date(c.last_activity), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" title="Call">
                        <a href={`tel:${c.phone}`}>
                          <Phone className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button asChild variant="ghost" size="icon" title="WhatsApp">
                        <a
                          href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
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