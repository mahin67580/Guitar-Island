"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { Search, X, Loader2 } from "lucide-react";
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
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCategory = searchParams.get("category") || "";
  const inStockOnly = searchParams.get("inStock") === "1";
  const sort = searchParams.get("sort") || "newest";

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set("q", search);
      else params.delete("q");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const clearAll = () => {
    setSearch("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const hasFilters =
    !!activeCategory || !!search || inStockOnly || sort !== "newest";

  const activeCategoryName =
    categories.find((c) => c.slug === activeCategory)?.name || "All Categories";

  return (
    <>
      {/* ═══ LOADING OVERLAY — appears during navigation ═══ */}
      {isPending && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-ink text-cream px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </div>
      )}

      {/* ═══ MOBILE: Collapsible filter drawer ═══ */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-lg border bg-white transition-colors",
            isPending && "opacity-60 pointer-events-none",
            mobileOpen ? "border-brass" : "border-black/10"
          )}
        >
          <span className="font-medium text-sm">
            {mobileOpen ? "Filters" : `Filters · ${activeCategoryName}`}
          </span>
          <span className="text-xs text-ink/50">
            {mobileOpen ? "Close" : "Tap to open"}
          </span>
        </button>

        {mobileOpen && (
          <div className="mt-3 space-y-6 p-4 rounded-lg border border-black/10 bg-white animate-in fade-in slide-in-from-top-2">
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

            {/* Category dropdown (native select for mobile) */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Category</Label>
              <select
                value={activeCategory}
                onChange={(e) =>
                  updateParam("category", e.target.value || null)
                }
                className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Sort by</Label>
              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="newest">Newest first</option>
                <option value="price-asc">Price: Low to high</option>
                <option value="price-desc">Price: High to low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>

            {/* In stock */}
            <div className="flex items-center justify-between">
              <Label
                htmlFor="inStock-mobile"
                className="text-sm font-medium cursor-pointer"
              >
                In stock only
              </Label>
              <Switch
                id="inStock-mobile"
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
          </div>
        )}
      </div>

      {/* ═══ DESKTOP: Sidebar (unchanged layout, just added isPending disable) ═══ */}
      <aside
        className={cn(
          "hidden lg:block space-y-6",
          isPending && "opacity-60 pointer-events-none transition-opacity"
        )}
      >
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
          <Label
            htmlFor="inStock"
            className="text-sm font-medium cursor-pointer"
          >
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
    </>
  );
}