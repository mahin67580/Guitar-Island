import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cream">
      <div className="max-w-md text-center">
        <p className="font-display text-8xl text-brass mb-4">404</p>
        <h1 className="font-display text-3xl text-ink mb-3">
          This page has walked off stage
        </h1>
        <p className="text-ink/60 mb-8">
          We couldn't find what you were looking for. Try browsing the shop
          instead.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            className="bg-brass hover:bg-brass/90 text-ink font-semibold"
          >
            <Link href="/shop">
              <Search className="w-4 h-4 mr-2" />
              Browse Guitars
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}