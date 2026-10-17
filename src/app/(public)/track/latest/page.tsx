"use client";

import { useEffect, useState } from "react"; // <-- Added useState here
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PackageSearch, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrackLatestOrderPage() {
  const router = useRouter();

  // Use a short state timer to avoid flashing the "no order" screen
  // if the redirect is about to happen.
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Check if the browser has saved an order number
    const lastOrder = localStorage.getItem("gi_last_order");

    if (lastOrder) {
      // If found, instantly redirect to the order status page
      router.replace(`/order/${lastOrder}`);
    } else {
      // If not found, we stop the redirect loading state so the empty UI shows
      setIsRedirecting(false);
    }
  }, [router]);

  if (isRedirecting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brass mb-4" />
        <p className="text-ink/60">Looking for your recent order...</p>
      </div>
    );
  }

  // ── No Order Found State ──
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-cream/50 text-ink/30 mb-6">
          <PackageSearch className="w-10 h-10" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-ink mb-3">
          No recent order found
        </h1>
        <p className="text-ink/60 mb-8">
          We couldn&apos;t find any previous orders placed on this device. If
          you placed an order, you can track it using your Order ID.
        </p>
        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="bg-brass hover:bg-brass/90 text-ink font-semibold">
            <Link href="/track">Track via Order ID</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/shop">
              <Package className="w-4 h-4 mr-2" />
              Browse Shop
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}