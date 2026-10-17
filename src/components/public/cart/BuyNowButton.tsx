"use client";

import { useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

type Props = {
  productId: string;
  name: string;
  slug: string;
  brand: string | null;
  image: string | null;
  unitPrice: number;
  maxQuantity: number;
  disabled?: boolean;
};

export default function BuyNowButton({
  productId,
  name,
  slug,
  brand,
  image,
  unitPrice,
  maxQuantity,
  disabled = false,
}: Props) {
  const router = useRouter();
  const { clearCart, addItem } = useCart();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (maxQuantity <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    setLoading(true);

    // Buy Now replaces the cart with just this product
    clearCart();
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

    router.push("/checkout");
  };

  return (
    <Button
      type="button"
      size="lg"
      onClick={handleClick}
      disabled={disabled || maxQuantity <= 0 || loading}
      className="w-full font-semibold bg-ink hover:bg-ink/90 text-cream"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <Zap className="w-5 h-5 mr-2" />
          Buy Now
        </>
      )}
    </Button>
  );
}