"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import SectionHeading from "@/components/public/SectionHeading";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

const FALLBACK_IMAGES: Record<string, string> = {
  "electric-guitars":
    "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&q=80",
  "acoustic-guitars":
    "https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?w=800&q=80",
  "bass-guitars":
    "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800&q=80",
};

type Props = {
  categories: Category[];
};

export default function CategoriesSection({ categories }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    const timeout = setTimeout(updateArrows, 500);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
      clearTimeout(timeout);
    };
  }, [categories]);

  const scrollBy = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-cream/40 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Shop by Category"
          subtitle="Find the instrument that matches your sound."
          center
        />

        {/* Slider wrapper — extra px so arrows sit OUTSIDE the cards */}
        <div className="relative mt-4">
          {/* Left arrow — OUTSIDE cards, on the far left */}
          {canScrollLeft && (
            <button
              onClick={() => scrollBy("left")}
              aria-label="Scroll left"
              className={cn(
                "hidden md:flex absolute -left-5 lg:-left-15 top-[42%] -translate-y-1/2 z-20",
                "items-center justify-center w-12 h-12 rounded-full",
                "bg-ink text-cream shadow-xl border border-white/10",
                "hover:bg-brass hover:text-ink transition-colors"
              )}
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
            </button>
          )}

          {/* Right arrow — OUTSIDE cards, on the far right */}
          {canScrollRight && (
            <button
              onClick={() => scrollBy("right")}
              aria-label="Scroll right"
              className={cn(
                "hidden md:flex absolute -right-9 lg:-right-15 top-[42%] -translate-y-1/2 z-20",
                "items-center justify-center w-12 h-12 rounded-full",
                "bg-ink text-cream shadow-xl border border-white/10",
                "hover:bg-brass hover:text-ink transition-colors"
              )}
            >
              <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
            </button>
          )}

          {/* Scrollable track */}
          <div
            ref={scrollRef}
            className={cn(
              "flex gap-5 overflow-x-auto scroll-smooth pb-2",
              "snap-x snap-mandatory",
              "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            )}
          >
            {categories.map((cat) => {
              const img = cat.image_url || FALLBACK_IMAGES[cat.slug];
              return (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className={cn(
                    "group relative shrink-0 snap-start",
                    "w-[280px] sm:w-[320px] aspect-[4/3]",
                    "rounded-2xl overflow-hidden border border-black/5",
                    "hover:shadow-2xl transition-all"
                  )}
                >
                  {img ? (
                    <Image
                      src={img}
                      alt={cat.name}
                      fill
                      sizes="320px"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-cream/50 text-ink/20">
                      <ImageIcon className="w-16 h-16" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-display text-2xl text-cream mb-1 line-clamp-2">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-cream/70 text-sm line-clamp-1">
                        {cat.description}
                      </p>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-brass text-ink flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}