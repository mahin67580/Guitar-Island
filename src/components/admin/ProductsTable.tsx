"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Copy,
  Edit,
  Eye,
  ImageIcon,
  MoreHorizontal,
  Package,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  deleteProduct,
  deleteProducts,
  duplicateProduct,
  toggleFeatured,
  toggleProductStatus,
} from "@/lib/admin/products";
import type { Category, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  products: Product[];
  categories: Category[];
};

export default function ProductsTable({ products, categories }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = (p.brand || "").toLowerCase().includes(q);
        const matchSku = (p.sku || "").toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchSku) return false;
      }
      if (categoryFilter !== "all" && p.category_id !== categoryFilter)
        return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const allSelected =
    filtered.length > 0 && filtered.every((p) => selected.has(p.id));

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected);
      filtered.forEach((p) => next.delete(p.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      filtered.forEach((p) => next.add(p.id));
      setSelected(next);
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(null);
    const res = await deleteProduct(id);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Product deleted");
    setSelected((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });
    startTransition(() => router.refresh());
  };

  const handleBulkDelete = async () => {
    setBulkDeleteOpen(false);
    const ids = Array.from(selected);
    const res = await deleteProducts(ids);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(`${ids.length} products deleted`);
    setSelected(new Set());
    startTransition(() => router.refresh());
  };

  const handleDuplicate = async (id: string) => {
    const res = await duplicateProduct(id);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Product duplicated as draft");
    startTransition(() => router.refresh());
  };

  const handleStatusChange = async (
    id: string,
    status: "active" | "draft" | "sold_out"
  ) => {
    const res = await toggleProductStatus(id, status);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success("Status updated");
    startTransition(() => router.refresh());
  };

  const handleFeaturedToggle = async (id: string, isFeatured: boolean) => {
    const res = await toggleFeatured(id, isFeatured);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    toast.success(isFeatured ? "Added to featured" : "Removed from featured");
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <Input
            placeholder="Search products by name, brand, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sold_out">Sold Out</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-brass/10 border border-brass/30 rounded-lg px-4 py-3">
          <p className="text-sm text-ink">
            <strong>{selected.size}</strong> product
            {selected.size === 1 ? "" : "s"} selected
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
            >
              Clear
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-cream/50">
              <TableHead className="w-[40px]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="cursor-pointer accent-brass"
                />
              </TableHead>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-16 text-ink/50"
                >
                  <Package className="w-12 h-12 mx-auto mb-3 text-ink/20" />
                  {products.length === 0
                    ? "No products yet. Click 'Add Product' to create your first one."
                    : "No products match your filters."}
                </TableCell>
              </TableRow>
            )}

            {filtered.map((p) => {
              const isSelected = selected.has(p.id);
              const price = Number(p.price);
              const discount = p.discount_price
                ? Number(p.discount_price)
                : null;
              const hasDiscount = discount !== null && discount < price;
              const isLowStock =
                p.quantity > 0 && p.quantity <= p.low_stock_threshold;

              return (
                <TableRow
                  key={p.id}
                  className={cn(isSelected && "bg-brass/5")}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(p.id)}
                      className="cursor-pointer accent-brass"
                    />
                  </TableCell>

                  <TableCell>
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-cream/50 border border-black/5">
                      {p.images?.[0] ? (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-ink/20">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="font-medium text-ink hover:text-brass transition-colors"
                          >
                            {p.name}
                          </Link>
                          {p.is_featured && (
                            <Star className="w-3.5 h-3.5 fill-brass text-brass" />
                          )}
                        </div>
                        {p.brand && (
                          <p className="text-xs text-ink/50">{p.brand}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm text-ink/70">
                    {p.category?.name || "—"}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="font-display">
                      ৳{(hasDiscount ? discount! : price).toLocaleString()}
                    </div>
                    {hasDiscount && (
                      <div className="text-xs text-ink/40 line-through">
                        ৳{price.toLocaleString()}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        p.quantity === 0
                          ? "text-red-600"
                          : isLowStock
                          ? "text-amber-600"
                          : "text-ink"
                      )}
                    >
                      {p.quantity}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        p.status === "active"
                          ? "secondary"
                          : p.status === "draft"
                          ? "outline"
                          : "destructive"
                      }
                      className="capitalize"
                    >
                      {p.status === "sold_out" ? "Sold Out" : p.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/products/${p.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/product/${p.slug}`}
                            target="_blank"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View on site
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleFeaturedToggle(p.id, !p.is_featured)
                          }
                        >
                          <Star
                            className={cn(
                              "w-4 h-4 mr-2",
                              p.is_featured && "fill-brass text-brass"
                            )}
                          />
                          {p.is_featured
                            ? "Remove from featured"
                            : "Add to featured"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(p.id)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => handleStatusChange(p.id, "active")}
                          disabled={p.status === "active"}
                        >
                          Set Active
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(p.id, "draft")}
                          disabled={p.status === "draft"}
                        >
                          Set Draft
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(p.id, "sold_out")}
                          disabled={p.status === "sold_out"}
                        >
                          Set Sold Out
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => setDeleteId(p.id)}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Single delete confirm */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the product and its data. Customers
              won't be able to see it anymore. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete confirm */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selected.size} products?
            </AlertDialogTitle>
            <AlertDialogDescription>
              All selected products will be permanently removed. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}