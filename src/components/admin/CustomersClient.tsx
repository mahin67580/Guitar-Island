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
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <Input
            placeholder="Search by name, phone, or email..."
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
  );
}