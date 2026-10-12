import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/public/ProductCard";
import SectionHeading from "@/components/public/SectionHeading";
import type { Product } from "@/lib/types";

export default async function FeaturedProducts() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6);

  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <SectionHeading
        title="Featured Products"
        subtitle="Handpicked instruments we're proud to put in your hands."
        viewAllHref="/shop"
        viewAllLabel="Browse all guitars"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(products as Product[]).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}