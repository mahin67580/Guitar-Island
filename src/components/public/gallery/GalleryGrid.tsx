"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/lib/types";

type Props = {
  images: GalleryImage[];
  albumName: string;
};

export default function GalleryGrid({ images, albumName }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [errored, setErrored] = useState<Set<number>>(new Set());
  const total = images.length;

  const open = (i: number) => setLightboxIndex(i);
  const close = () => setLightboxIndex(null);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + total) % total));
  }, [total]);

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % total));
  }, [total]);

  // Keyboard nav + Escape
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", onKey);

    // Prevent body scroll while lightbox is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex, goPrev, goNext]);

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {images.map((image, i) => {
          const isErrored = errored.has(i);
          return (
            <button
              key={image.id}
              type="button"
              onClick={() => open(i)}
              className={cn(
                "group relative aspect-square rounded-xl overflow-hidden border border-black/5 bg-cream/50",
                "hover:shadow-xl transition-all cursor-zoom-in"
              )}
            >
              {isErrored ? (
                <div className="w-full h-full flex items-center justify-center text-ink/20">
                  <ImageIcon className="w-8 h-8" />
                </div>
              ) : (
                <Image
                  src={image.image_url}
                  alt={image.caption || `${albumName} photo ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={() =>
                    setErrored((prev) => new Set(prev).add(i))
                  }
                />
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors flex items-end justify-start p-3 opacity-0 group-hover:opacity-100">
                {image.caption && (
                  <p className="text-cream text-xs text-left line-clamp-2">
                    {image.caption}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200"
          onClick={close}
        >
          {/* Close button */}
          <button
            onClick={close}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-10 text-white text-sm bg-black/40 px-3 py-1.5 rounded-full">
            {lightboxIndex + 1} / {total}
          </div>

          {/* Prev */}
          {total > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              aria-label="Previous image"
              className="absolute left-3 md:left-8 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {!errored.has(lightboxIndex) ? (
              <Image
                src={images[lightboxIndex].image_url}
                alt={
                  images[lightboxIndex].caption ||
                  `${albumName} photo ${lightboxIndex + 1}`
                }
                fill
                sizes="90vw"
                className="object-contain"
                priority
                onError={() =>
                  setErrored((prev) => new Set(prev).add(lightboxIndex))
                }
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30">
                <ImageIcon className="w-24 h-24" />
              </div>
            )}
          </div>

          {/* Next */}
          {total > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              aria-label="Next image"
              className="absolute right-3 md:right-8 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Caption */}
          {images[lightboxIndex].caption && (
            <div className="absolute bottom-6 left-0 right-0 z-10 text-center px-4">
              <p className="text-white/90 text-sm md:text-base bg-black/40 inline-block px-4 py-2 rounded-full max-w-2xl">
                {images[lightboxIndex].caption}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}