"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Heart, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/public/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";

export default function SavedItems() {
  const { ids, ready, clear } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProducts = useCallback(async () => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("id", ids);

    if (error) {
      console.error("Wishlist fetch error:", error);
      setProducts([]);
    } else {
      // Preserve the order of the wishlist ids
      const ordered =
        (data as Product[])?.sort(
          (a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)
        ) || [];
      setProducts(ordered);
    }
    setLoading(false);
  }, [ids, supabase]);

  useEffect(() => {
    if (ready) fetchProducts();
  }, [ready, fetchProducts]);

  const handleClear = () => {
    if (!confirm("Clear all items from your wishlist?")) return;
    clear();
    toast.success("Wishlist cleared");
  };

  if (!ready || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-brass" />
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <div className="text-center py-24 rounded-2xl bg-cream/50">
        <Heart className="w-16 h-16 text-ink/20 mx-auto mb-4" />
        <h3 className="font-display text-2xl text-ink mb-2">
          Your wishlist is empty
        </h3>
        <p className="text-ink/60 mb-6 max-w-md mx-auto">
          Save guitars you love by clicking the heart icon on any product. Come
          back anytime.
        </p>
        <Button asChild className="bg-brass hover:bg-brass/90 text-ink">
          <Link href="/shop">Browse Guitars</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <p className="text-ink/60 text-sm">
          {products.length} {products.length === 1 ? "item" : "items"} saved
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-ink/60 hover:text-red-600 self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear all
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}