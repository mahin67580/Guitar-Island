"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ImageIcon,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";

const DELIVERY_FEE = 100; // default — will be configurable later

export default function CartPage() {
  const router = useRouter();
  const { items, ready, subtotal, removeItem, updateQuantity, clearCart } =
    useCart();

  // Don't render until we've loaded from localStorage (prevents hydration mismatch)
  if (!ready) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-ink/50">Loading your cart...</p>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingCart className="w-16 h-16 text-ink/20 mx-auto mb-6" />
        <h1 className="font-display text-3xl text-ink mb-3">
          Your cart is empty
        </h1>
        <p className="text-ink/60 mb-8 max-w-sm mx-auto">
          Add a guitar or accessory to get started.
        </p>
        <Button asChild className="bg-brass hover:bg-brass/90 text-ink font-semibold">
          <Link href="/shop">Browse the Shop</Link>
        </Button>
      </div>
    );
  }

  const total = subtotal + DELIVERY_FEE;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display text-3xl md:text-4xl text-ink mb-2">
        Your Cart
      </h1>
      <p className="text-ink/60 mb-8">
        {items.length} item{items.length === 1 ? "" : "s"} ready for checkout
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Items list */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 p-4 rounded-xl border border-black/5 bg-white"
            >
              {/* Image */}
              <Link
                href={`/product/${item.slug}`}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-cream/50 border border-black/5 shrink-0"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink/20">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.slug}`}
                  className="font-medium text-ink line-clamp-2 hover:text-brass transition-colors"
                >
                  {item.name}
                </Link>
                {item.brand && (
                  <p className="text-xs text-ink/50 mt-0.5">{item.brand}</p>
                )}
                <p className="font-display text-lg text-ink mt-1">
                  ৳{item.unitPrice.toLocaleString()}
                </p>

                {/* Quantity controls */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-black/10 rounded-md overflow-hidden">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="px-2 py-1.5 hover:bg-cream/60 transition-colors disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium min-w-[32px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.maxQuantity}
                      className="px-2 py-1.5 hover:bg-cream/60 transition-colors disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      removeItem(item.productId);
                      toast.success("Item removed from cart");
                    }}
                    className="text-xs text-ink/50 hover:text-red-600 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>

              {/* Line total */}
              <div className="text-right shrink-0">
                <p className="text-xs text-ink/50">Total</p>
                <p className="font-display text-lg text-ink">
                  ৳{(item.unitPrice * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => {
                if (confirm("Clear your entire cart?")) {
                  clearCart();
                  toast.success("Cart cleared");
                }
              }}
              className="text-sm text-ink/50 hover:text-red-600 transition-colors"
            >
              Clear cart
            </button>
            <Link
              href="/shop"
              className="text-sm text-brass hover:text-ink transition-colors"
            >
              ← Continue shopping
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="p-6 rounded-2xl border border-black/5 bg-white">
            <h2 className="font-display text-xl text-ink mb-4">
              Order Summary
            </h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink/60">Subtotal</span>
                <span className="text-ink">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">Delivery</span>
                <span className="text-ink">
                  ৳{DELIVERY_FEE.toLocaleString()}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-baseline">
              <span className="font-medium text-ink">Total</span>
              <span className="font-display text-2xl text-ink">
                ৳{total.toLocaleString()}
              </span>
            </div>

            <Button
              onClick={() => router.push("/checkout")}
              size="lg"
              className="w-full mt-6 bg-brass hover:bg-brass/90 text-ink font-semibold"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <p className="text-xs text-ink/50 text-center mt-4">
              Cash on Delivery &amp; bKash accepted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}