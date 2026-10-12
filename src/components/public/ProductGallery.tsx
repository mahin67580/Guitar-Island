"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  alt: string;
  isSoldOut?: boolean;
};

export default function ProductGallery({
  images,
  alt,
  isSoldOut = false,
}: Props) {
  const [current, setCurrent] = useState(0);
  const [errored, setErrored] = useState<Set<number>>(new Set());
  const total = images.length;

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      const next = (index + total) % total;
      setCurrent(next);
    },
    [total]
  );

  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);
  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  // Touch swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const delta = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 50) {
      if (delta > 0) goPrev();
      else goNext();
    }
    setTouchStart(null);
  };

  // No images at all
  if (total === 0) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-cream/50 border border-black/5 flex items-center justify-center text-ink/20">
        <ImageIcon className="w-20 h-20" />
        {isSoldOut && (
          <div className="absolute top-4 left-4">
            <Badge variant="destructive">Sold Out</Badge>
          </div>
        )}
      </div>
    );
  }

  const currentImage = images[current];
  const currentErrored = errored.has(current);

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-cream/50 border border-black/5 select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {currentErrored ? (
          <div className="absolute inset-0 flex items-center justify-center text-ink/20">
            <ImageIcon className="w-20 h-20" />
          </div>
        ) : (
          <Image
            key={currentImage}
            src={currentImage}
            alt={`${alt} — image ${current + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority={current === 0}
            onError={() =>
              setErrored((prev) => new Set(prev).add(current))
            }
          />
        )}

        {isSoldOut && (
          <div className="absolute top-4 left-4 z-10">
            <Badge variant="destructive">Sold Out</Badge>
          </div>
        )}

        {/* Navigation arrows (only if more than 1 image) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 z-10",
                "flex items-center justify-center w-11 h-11 rounded-full",
                "bg-white/90 backdrop-blur-sm text-ink shadow-lg border border-black/5",
                "hover:bg-brass hover:text-ink transition-colors"
              )}
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 z-10",
                "flex items-center justify-center w-11 h-11 rounded-full",
                "bg-white/90 backdrop-blur-sm text-ink shadow-lg border border-black/5",
                "hover:bg-brass hover:text-ink transition-colors"
              )}
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </>
        )}

        {/* Counter badge */}
        {total > 1 && (
          <div className="absolute bottom-3 right-3 z-10 bg-ink/70 backdrop-blur-sm text-cream text-xs font-medium px-3 py-1.5 rounded-full">
            {current + 1} / {total}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {images.map((img, i) => {
            const isActive = i === current;
            const isErrored = errored.has(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                  isActive
                    ? "border-brass ring-2 ring-brass/30"
                    : "border-black/5 hover:border-brass/50 opacity-70 hover:opacity-100"
                )}
              >
                {isErrored ? (
                  <div className="w-full h-full flex items-center justify-center bg-cream/50 text-ink/20">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                ) : (
                  <Image
                    src={img}
                    alt={`${alt} thumbnail ${i + 1}`}
                    fill
                    sizes="150px"
                    className="object-cover"
                    onError={() =>
                      setErrored((prev) => new Set(prev).add(i))
                    }
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}