import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/public/ProductCard";
import ShopFilters from "@/components/public/shop/ShopFilters";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category, Product } from "@/lib/types";

type SearchParams = Promise<{
  category?: string;
  q?: string;
  sort?: string;
  inStock?: string;
}>;

async function ShopContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();

  // Fetch categories for the sidebar
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  // Build the products query
  let query = supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("status", "active");

  if (params.category) {
    const cat = (categories as Category[] | null)?.find(
      (c) => c.slug === params.category
    );
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (params.q) {
    const term = `%${params.q}%`;
    query = query.or(`name.ilike.${term},brand.ilike.${term}`);
  }

  if (params.inStock === "1") {
    query = query.gt("quantity", 0);
  }

  switch (params.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "name-asc":
      query = query.order("name", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: products, error } = await query;

  if (error) {
    console.error("Shop query error:", error);
  }

  const list = (products as Product[]) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10   mt-15">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-2">
          Shop All Products
        </h1>
        <p className="text-ink/60">
          {list.length} {list.length === 1 ? "Product" : "Products"}{" "}
          available
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ShopFilters categories={(categories as Category[]) || []} />
        </div>

        {/* Grid */}
        <div>
          {list.length === 0 ? (
            <div className="text-center py-24 rounded-2xl bg-cream/50">
              <p className="font-display text-2xl text-ink mb-2">
                No guitars found
              </p>
              <p className="text-ink/60">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShopSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Skeleton className="h-12 w-64 mb-4" />
      <Skeleton className="h-4 w-40 mb-10" />
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <Skeleton className="h-96 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopContent searchParams={searchParams} />
    </Suspense>
  );
}