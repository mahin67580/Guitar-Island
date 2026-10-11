import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-32 text-center">
      <p className="text-brass uppercase tracking-widest text-sm mb-4">
        404 — Product Not Found
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-ink mb-4">
        This guitar has walked off stage
      </h1>
      <p className="text-ink/60 mb-8">
        The product you're looking for may have been sold, removed, or renamed.
      </p>
      <Button asChild size="lg" className="bg-brass hover:bg-brass/90 text-ink">
        <Link href="/shop">Back to Shop</Link>
      </Button>
    </div>
  );
}