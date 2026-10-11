"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";

const WISHLIST_KEY = "gi_wishlist";

function readWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(ids: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  // Notify Navbar + other listeners
  window.dispatchEvent(new Event("gi_wishlist_changed"));
}

type Props = {
  product: Product;
  className?: string;
};

export default function ProductCard({ product, className }: Props) {
  const [inWishlist, setInWishlist] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setInWishlist(readWishlist().includes(product.id));
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const current = readWishlist();
    const next = current.includes(product.id)
      ? current.filter((id) => id !== product.id)
      : [...current, product.id];
    writeWishlist(next);
    setInWishlist(next.includes(product.id));
  };

  const imageUrl = product.images?.[0];
  const price = Number(product.price);
  const discountPrice = product.discount_price
    ? Number(product.discount_price)
    : null;
  const isSoldOut = product.quantity <= 0 || product.status === "sold_out";
  const hasDiscount = discountPrice !== null && discountPrice < price;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group block bg-white rounded-2xl overflow-hidden border border-black/5 hover:border-brass/50 hover:shadow-2xl transition-all duration-300",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square bg-cream/50 overflow-hidden">
        {imageUrl && !imgError ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink/20">
            <ImageIcon className="w-16 h-16" />
          </div>
        )}

        {/* Status badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isSoldOut && <Badge variant="destructive">Sold Out</Badge>}
          {!isSoldOut && hasDiscount && (
            <Badge className="bg-retro hover:bg-retro">Sale</Badge>
          )}
          {product.condition === "Used" && (
            <Badge variant="secondary">Used</Badge>
          )}
        </div>

        {/* Wishlist heart */}
        <button
          onClick={toggleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all",
            inWishlist
              ? "bg-retro text-white"
              : "bg-white/80 text-ink/70 hover:bg-white hover:text-retro"
          )}
        >
          <Heart
            className={cn("w-4 h-4", inWishlist && "fill-current")}
          />
        </button>
      </div>

      {/* Info */}
      <div className="p-5">
        {product.brand && (
          <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">
            {product.brand}
          </p>
        )}
        <h3 className="font-medium text-ink line-clamp-2 group-hover:text-brass transition-colors">
          {product.name}
        </h3>

        <div className="mt-3 flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl text-ink">
              ৳{(hasDiscount ? discountPrice! : price).toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-ink/40 line-through">
                ৳{price.toLocaleString()}
              </span>
            )}
          </div>
          {!isSoldOut && (
            <span className="text-xs text-ink/50">
              {product.quantity} in stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}