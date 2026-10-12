"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";
import SectionHeading from "@/components/public/SectionHeading";
import { cn } from "@/lib/utils";

type GalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
};

type Props = {
  images: GalleryImage[];
};

const AUTOPLAY_MS = 3200;
const VISIBLE_SIDE = 2; // how many cards to show on each side

export default function HomeGallery({ images }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [errored, setErrored] = useState<Set<number>>(new Set());
  const timerRef = useRef<number | null>(null);
  const total = images.length;

  // Autoplay
  useEffect(() => {
    if (paused || total <= 1) return;
    timerRef.current = window.setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [paused, total]);

  // Keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + total) % total);
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % total);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  // Nothing to show
  if (total === 0) return null;

  const goTo = (index: number) => setCurrent((index + total) % total);

  // Compute relative position offset (shortest path around the circle)
  const offsetFor = (index: number) => {
    let diff = index - current;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  return (
    <section className="bg-cream/40 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="From Our Gallery"
          subtitle="Customers, events, and moments from Guitar Island."
         
         
          center
        />
      </div>

      {/* Coverflow carousel — full width, no container constraint */}
      <div
        className="relative h-[300px] sm:h-[380px] md:h-[440px] mt-10"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {images.map((img, i) => {
            const offset = offsetFor(i);
            const absOffset = Math.abs(offset);
            const isCenter = offset === 0;
            const isHidden = absOffset > VISIBLE_SIDE;

            // Layout math for coverflow
            const translateX = offset * 55; // % of card width
            const translateZ = -absOffset * 220; // px back
            const rotateY = offset * -32; // deg tilt
            const scale = isCenter ? 1 : 0.82 - absOffset * 0.06;
            const opacity = isHidden ? 0 : isCenter ? 1 : 0.85 - absOffset * 0.18;
            const zIndex = 100 - absOffset;

            return (
              <button
                key={img.id}
                type="button"
                onClick={() => (isCenter ? null : goTo(i))}
                aria-label={isCenter ? "Featured" : "View this photo"}
                className={cn(
                  "absolute w-[220px] sm:w-[280px] md:w-[340px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-black/5 transition-all duration-700 ease-out",
                  isCenter ? "cursor-default" : "cursor-pointer",
                  isHidden && "pointer-events-none"
                )}
                style={{
                  transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  zIndex,
                  transformStyle: "preserve-3d",
                }}
              >
                {errored.has(i) ? (
                  <div className="w-full h-full flex items-center justify-center bg-cream/50 text-ink/20">
                    <ImageIcon className="w-16 h-16" />
                  </div>
                ) : (
                  <Image
                    src={img.image_url}
                    alt={img.caption || `Gallery image ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 280px, 340px"
                    className={cn(
                      "object-cover transition-all duration-700",
                      !isCenter && "brightness-[0.6] saturate-[0.8]"
                    )}
                    priority={absOffset <= 1}
                    onError={() =>
                      setErrored((prev) => new Set(prev).add(i))
                    }
                  />
                )}

                {/* Caption on center card */}
                {isCenter && img.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-5 pt-12">
                    <p className="text-cream text-sm line-clamp-2 text-left">
                      {img.caption}
                    </p>
                  </div>
                )}

                {/* Subtle overlay on side cards */}
                {!isCenter && (
                  <div className="absolute inset-0 bg-ink/20" />
                )}
              </button>
            );
          })}
        </div>

        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-cream/40 to-transparent z-50" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-cream/40 to-transparent z-50" />
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10 flex-wrap px-4">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to photo ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all",
                i === current
                  ? "w-8 bg-brass"
                  : "w-2 bg-ink/20 hover:bg-ink/40"
              )}
            />
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="text-center mt-10">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-brass hover:text-ink font-medium transition-colors group"
        >
          Explore full gallery
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}