import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import ProductsTable from "@/components/admin/ProductsTable";
import type { Category, Product } from "@/lib/types";

export const metadata = { title: "Products — Admin" };

export default async function AdminProductsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(id, name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink">Products</h1>
          <p className="text-ink/60 text-sm">
            {products?.length ?? 0} product
            {(products?.length ?? 0) === 1 ? "" : "s"} in catalogue
          </p>
        </div>
        <Button
          asChild
          className="bg-brass hover:bg-brass/90 text-ink font-semibold"
        >
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Table */}
      <ProductsTable
        products={(products as Product[]) || []}
        categories={(categories as Category[]) || []}
      />
    </div>
  );
}