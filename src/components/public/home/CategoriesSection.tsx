import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import SectionHeading from "@/components/public/SectionHeading";
import type { Category } from "@/lib/types";

const FALLBACK_IMAGES: Record<string, string> = {
  "electric-guitars":
    "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&q=80",
  "acoustic-guitars":
    "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=800&q=80",
  "bass-guitars":
    "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&q=80",
};

export default async function CategoriesSection() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .limit(3);

  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-cream/40 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Shop by Category"
          subtitle="Find the instrument that matches your sound."
          center
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(categories as Category[]).map((cat) => {
            const img = cat.image_url || FALLBACK_IMAGES[cat.slug];
            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-black/5 hover:shadow-2xl transition-all"
              >
                {img && (
                  <Image
                    src={img}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-2xl text-cream mb-1">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-cream/70 text-sm line-clamp-1">
                      {cat.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}