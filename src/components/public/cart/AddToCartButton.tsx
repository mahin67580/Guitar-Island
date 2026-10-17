"use client";

import { useState } from "react";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

type Props = {
  productId: string;
  name: string;
  slug: string;
  brand: string | null;
  image: string | null;
  unitPrice: number;
  maxQuantity: number;
  disabled?: boolean;
  className?: string;
};

export default function AddToCartButton({
  productId,
  name,
  slug,
  brand,
  image,
  unitPrice,
  maxQuantity,
  disabled = false,
  className,
}: Props) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleClick = () => {
    if (maxQuantity <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    addItem(
      {
        productId,
        name,
        slug,
        brand,
        image,
        unitPrice,
        maxQuantity,
      },
      1
    );

    setJustAdded(true);
    toast.success(`${name} added to cart`);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <Button
      type="button"
      size="lg"
      onClick={handleClick}
      disabled={disabled || maxQuantity <= 0}
      className={cn(
        "w-full sm:w-auto font-semibold",
        justAdded
          ? "bg-green-600 hover:bg-green-600 text-white"
          : "bg-brass hover:bg-brass/90 text-ink",
        className
      )}
    >
      {justAdded ? (
        <>
          <Check className="w-5 h-5 mr-2" />
          Added!
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  );
}