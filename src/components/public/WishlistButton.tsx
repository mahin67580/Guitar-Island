"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  window.dispatchEvent(new Event("gi_wishlist_changed"));
}

type Props = {
  productId: string;
  productName: string;
  variant?: "default" | "outline";
};

export default function WishlistButton({
  productId,
  productName,
  variant = "outline",
}: Props) {
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    setInWishlist(readWishlist().includes(productId));
  }, [productId]);

  const toggle = () => {
    const current = readWishlist();
    const isIn = current.includes(productId);
    const next = isIn
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    writeWishlist(next);
    setInWishlist(!isIn);
    if (isIn) {
      toast.info(`Removed "${productName}" from wishlist`);
    } else {
      toast.success(`Added "${productName}" to wishlist`);
    }
  };

  return (
    <Button
      variant={variant}
      size="lg"
      onClick={toggle}
      className={cn(
        "w-full sm:w-auto",
        inWishlist && "border-retro text-retro hover:bg-retro/5"
      )}
    >
      <Heart className={cn("w-5 h-5 mr-2", inWishlist && "fill-current")} />
      {inWishlist ? "In Wishlist" : "Add to Wishlist"}
    </Button>
  );
}