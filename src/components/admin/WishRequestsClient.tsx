"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Copy,
  Download,
  Loader2,
  MessageCircle,
  Package,
  Phone,
  Save,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { exportToCSV } from "@/lib/admin/csv";
import {
  deleteWish,
  updateWishNotes,
  updateWishStatus,
  type WishStatus,
} from "@/lib/admin/wish-actions";
import { cn } from "@/lib/utils";
import type { WishRequest } from "@/lib/types";

const WISH_STATUSES: { value: WishStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "sourcing", label: "Sourcing", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "available", label: "Available", color: "bg-green-50 text-green-700 border-green-200" },
  { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-600 border-gray-200" },
];

export default function WishRequestsClient({
  wishes,
}: {
  wishes: WishRequest[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<WishRequest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = wishes.filter((w) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !w.customer_name.toLowerCase().includes(q) &&
        !w.phone.toLowerCase().includes(q) &&
        !w.product_name.toLowerCase().includes(q) &&
        !(w.brand || "").toLowerCase().includes(q)
      )
        return false;
    }
    if (statusFilter !== "all" && w.status !== statusFilter) return false;
    return true;
  });

  const handleExport = () => {
    exportToCSV(
      filtered,
      [
        { key: "created_at", label: "Date" },
        { key: "customer_name", label: "Customer" },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email" },
        { key: "product_name", label: "Wanted" },
        { key: "brand", label: "Brand" },
        { key: "budget", label: "Budget" },
        { key: "status", label: "Status" },
        { key: "notes", label: "Notes" },
      ],
      "wish-requests"
    );
    toast.success(`Exported ${filtered.length} wish requests`);
  };

  const openDrawer = (w: WishRequest) => {
    setSelected(w);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── Filters ───────────────────────────────────── */}
      <div className="space-y-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <Input
            placeholder="Search wishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-[180px_1fr_auto] gap-2 sm:gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {WISH_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={handleExport}
            className="w-full col-span-1 lg:col-span-1 lg:justify-self-end lg:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          MOBILE CARD LIST (< md)
          ═══════════════════════════════════════════════════ */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 px-4 rounded-xl border border-black/5 bg-white text-ink/50">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-ink/20" />
            <p className="text-sm">
              {wishes.length === 0
                ? "No wish requests yet."
                : "No requests match your filters."}
            </p>
          </div>
        )}

        {filtered.map((w) => {
          const sc = WISH_STATUSES.find((s) => s.value === w.status);
          return (
            <button
              key={w.id}
              onClick={() => openDrawer(w)}
              className="w-full text-left p-3 rounded-xl border border-black/5 bg-white hover:bg-cream/40 active:bg-cream/60 transition-colors"
            >
              {/* Top row: name + status badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink text-sm truncate">
                    {w.customer_name}
                  </p>
                  <p className="text-xs text-ink/50 truncate mt-0.5">
                    {w.phone}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn("shrink-0 text-[10px] px-1.5 py-0", sc?.color)}
                >
                  {sc?.label}
                </Badge>
              </div>

              {/* Product */}
              <p className="text-xs text-ink/70 truncate">
                <span className="text-ink/40">Wanted:</span>{" "}
                {w.product_name}
              </p>
              {w.brand && (
                <p className="text-xs text-ink/50 truncate mt-0.5">
                  {w.brand}
                </p>
              )}

              {/* Meta row: budget + date */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink/50 mt-2">
                {w.budget && (
                  <span>
                    <span className="text-ink/40">Budget:</span> {w.budget}
                  </span>
                )}
                <span>{format(new Date(w.created_at), "MMM d, yyyy")}</span>
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
                <TableHead>Wanted</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-ink/50">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-ink/20" />
                    {wishes.length === 0
                      ? "No wish requests yet."
                      : "No requests match your filters."}
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((w) => {
                const sc = WISH_STATUSES.find((s) => s.value === w.status);
                return (
                  <TableRow
                    key={w.id}
                    className="cursor-pointer hover:bg-cream/40"
                    onClick={() => openDrawer(w)}
                  >
                    <TableCell>
                      <p className="font-medium">{w.customer_name}</p>
                      <p className="text-xs text-ink/50">{w.phone}</p>
                    </TableCell>
                    <TableCell>
                      <p className="line-clamp-1">{w.product_name}</p>
                      {w.brand && (
                        <p className="text-xs text-ink/50">{w.brand}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-ink/70">
                      {w.budget || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={sc?.color}>
                        {sc?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-ink/50">
                      {format(new Date(w.created_at), "MMM d")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-brass"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDrawer(w);
                        }}
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

      <WishDetailDrawer
        wish={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onDelete={(id) => setDeleteId(id)}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this wish request?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto mt-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteId) return;
                const res = await deleteWish(deleteId);
                setDeleteId(null);
                if (res.error) return toast.error(res.error);
                toast.success("Deleted");
                startTransition(() => router.refresh());
              }}
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function WishDetailDrawer({
  wish,
  open,
  onClose,
  onDelete,
}: {
  wish: WishRequest | null;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  // Sync notes when wish changes
  useState(() => {
    if (wish) setNotes(wish.internal_notes || "");
  });

  if (!wish) return null;

  const sc = WISH_STATUSES.find((s) => s.value === wish.status);
  const cleanPhone = wish.phone.replace(/[^\d]/g, "");
  const waMessage = encodeURIComponent(
    `Hi ${wish.customer_name}! Guitar Island here. About your request for ${wish.product_name}...`
  );

  const handleStatus = async (status: WishStatus) => {
    const res = await updateWishStatus(wish.id, status);
    if (res.error) return toast.error(res.error);
    toast.success(`Marked as ${status}`);
    startTransition(() => router.refresh());
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    const res = await updateWishNotes(wish.id, notes);
    setSaving(false);
    if (res.error) return toast.error(res.error);
    toast.success("Notes saved");
    startTransition(() => router.refresh());
  };

  const handleConvertToProduct = () => {
    const params = new URLSearchParams({
      prefill_name: wish.product_name,
      prefill_brand: wish.brand || "",
      prefill_notes: wish.notes || "",
    });
    router.push(`/admin/products/new?${params.toString()}`);
    toast.info("Prefilled product form — complete the details and save.");
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl p-0 overflow-y-auto">
        <SheetHeader className="sticky top-0 bg-white border-b border-black/5 px-4 sm:px-6 py-4 z-10">
          <div className="flex items-start gap-3">
            {/* ← Back button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Back to wishes"
              className="shrink-0 -ml-2 h-9 w-9 mt-0.5"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <SheetTitle className="font-display text-xl sm:text-2xl text-left truncate">
                  {wish.customer_name}
                </SheetTitle>
                <p className="text-xs text-ink/50 mt-1">
                  {format(new Date(wish.created_at), "MMM d, yyyy · h:mm a")}
                </p>
              </div>
              <Badge variant="outline" className={cn("shrink-0", sc?.color)}>
                {sc?.label}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Button asChild size="lg" className="bg-brass hover:bg-brass/90 text-ink font-semibold h-12">
              <a href={`tel:${wish.phone}`}>
                <Phone className="w-5 h-5 mr-2" />
                Call
              </a>
            </Button>
            <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#1da851] text-white font-semibold h-12">
              <a href={`https://wa.me/${cleanPhone}?text=${waMessage}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </a>
            </Button>
          </div>

          {/* Request details */}
          <div className="p-4 rounded-xl bg-cream/40 border border-black/5 space-y-3">
            <div>
              <p className="text-xs text-ink/50">Looking for</p>
              <p className="font-medium">{wish.product_name}</p>
            </div>
            {wish.brand && (
              <div>
                <p className="text-xs text-ink/50">Brand</p>
                <p className="text-sm">{wish.brand}</p>
              </div>
            )}
            {wish.budget && (
              <div>
                <p className="text-xs text-ink/50">Budget</p>
                <p className="text-sm">{wish.budget}</p>
              </div>
            )}
            {wish.email && (
              <div>
                <p className="text-xs text-ink/50">Email</p>
                <a
                  href={`mailto:${wish.email}`}
                  className="text-sm text-brass hover:underline break-all"
                >
                  {wish.email}
                </a>
              </div>
            )}
            {wish.notes && (
              <div>
                <p className="text-xs text-ink/50 mb-1">Customer Notes</p>
                <p className="text-sm whitespace-pre-line bg-white p-3 rounded-lg border border-black/5">
                  {wish.notes}
                </p>
              </div>
            )}
          </div>

          {/* Convert to product */}
          <div className="p-4 rounded-xl bg-brass/5 border border-brass/20">
            <div className="flex items-start gap-3 mb-3">
              <Package className="w-5 h-5 text-brass shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-ink">Convert to Product</p>
                <p className="text-xs text-ink/60 mt-1">
                  Create a draft product prefilled with this request's details.
                </p>
              </div>
            </div>
            <Button
              onClick={handleConvertToProduct}
              className="w-full bg-brass hover:bg-brass/90 text-ink font-semibold"
            >
              <Copy className="w-4 h-4 mr-2" />
              Create Product from Wish
            </Button>
          </div>

          {/* Status */}
          <div>
            <Label className="text-xs uppercase tracking-widest text-ink/50 mb-2 block">
              Status
            </Label>
            <Select
              value={wish.status}
              onValueChange={(v) => handleStatus(v as WishStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WISH_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs uppercase tracking-widest text-ink/50 mb-2 block">
              Internal Notes
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Your private notes about this customer..."
              className="mb-3"
            />
            <Button
              onClick={handleSaveNotes}
              disabled={saving}
              className="w-full bg-brass hover:bg-brass/90 text-ink font-semibold"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Notes
            </Button>
          </div>

          {/* Delete */}
          <Button
            variant="ghost"
            onClick={() => onDelete(wish.id)}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Wish Request
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}