"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

type Props = {
  categories: Category[];
};

export default function ShopFilters({ categories }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const activeCategory = searchParams.get("category") || "";
  const inStockOnly = searchParams.get("inStock") === "1";
  const sort = searchParams.get("sort") || "newest";

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set("q", search);
      else params.delete("q");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    setSearch("");
    router.push(pathname, { scroll: false });
  };

  const hasFilters =
    !!activeCategory || !!search || inStockOnly || sort !== "newest";

  return (
    <aside className="space-y-6">
      {/* Search */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guitars..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Category</Label>
        <div className="space-y-1">
          <button
            onClick={() => updateParam("category", null)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
              !activeCategory
                ? "bg-brass/10 text-brass font-medium"
                : "hover:bg-cream/60 text-ink/70"
            )}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam("category", cat.slug)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                activeCategory === cat.slug
                  ? "bg-brass/10 text-brass font-medium"
                  : "hover:bg-cream/60 text-ink/70"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Sort by</Label>
        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: Low to high</option>
          <option value="price-desc">Price: High to low</option>
          <option value="name-asc">Name: A to Z</option>
        </select>
      </div>

      {/* In stock only */}
      <div className="flex items-center justify-between">
        <Label htmlFor="inStock" className="text-sm font-medium cursor-pointer">
          In stock only
        </Label>
        <Switch
          id="inStock"
          checked={inStockOnly}
          onCheckedChange={(checked) =>
            updateParam("inStock", checked ? "1" : null)
          }
        />
      </div>

      {/* Clear */}
      {hasFilters && (
        <Button
          variant="ghost"
          onClick={clearAll}
          className="w-full text-ink/60 hover:text-ink"
        >
          <X className="w-4 h-4 mr-2" />
          Clear filters
        </Button>
      )}
    </aside>
  );
}