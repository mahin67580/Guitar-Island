import Link from "next/link";
import { ArrowRight, Guitar, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStoreSettings } from "@/lib/settings";
import FeaturedProducts from "@/components/public/home/FeaturedProducts";
import CategoriesSection from "@/components/public/home/CategoriesSection";
import WhyGuitarIsland from "@/components/public/home/WhyGuitarIsland";
import LatestBlogPosts from "@/components/public/home/LatestBlogPosts";
import UpcomingPreview from "@/components/public/home/UpcomingPreview";
import VisitStore from "@/components/public/home/VisitStore";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export default async function HomePage() {
  const settings = await getStoreSettings();
  const supabase = await createClient();
const { data: categoriesData } = await supabase
  .from("categories")
  .select("*")
  .order("sort_order", { ascending: true });
const categories: Category[] = categoriesData ?? [];
  return (
    <>
      {/* HERO */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-ink via-wood to-ink">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/50 to-ink/90" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-brass/10 border border-brass/30 text-brass px-4 py-2 rounded-full text-sm mb-6">
            <Guitar className="w-4 h-4" />
            <span>Handpicked instruments since day one</span>
          </div>

                    <h1 className="font-display text-5xl md:text-7xl text-cream leading-tight mb-6">
            {settings.hero_headline}
            <span className="block text-brass">{settings.store_name}</span>
          </h1>

          <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto mb-10">
            {settings.hero_subheadline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-brass hover:bg-brass/90 text-ink font-semibold text-base px-8 h-12"
            >
              <Link href="/shop">
                Browse Guitars
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="border border-cream/30 text-cream hover:bg-cream/10 hover:text-brass hover:border-brass text-base px-8 h-12 bg-transparent"
            >
              <Link href="/contact">
                <MapPin className="w-5 h-5 mr-2" />
                Visit Our Store
              </Link>
            </Button>
          </div>

                    <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-cream/70 text-sm">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brass" />
              {settings.address}
            </span>
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brass" />
              {settings.phone}
            </span>
          </div>
        </div>
      </section>

      {/* SECTIONS */}
      <FeaturedProducts />
      <CategoriesSection categories={categories || []} />
      <WhyGuitarIsland />
      <LatestBlogPosts />
      <UpcomingPreview />
      <VisitStore />
    </>
  );
}