"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 mb-6">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="font-display text-3xl text-ink mb-3">
        Dashboard error
      </h1>
      <p className="text-ink/60 mb-4">
        Something went wrong loading this admin page.
      </p>
      {error.digest && (
        <p className="text-xs text-ink/40 mb-8 font-mono">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={reset}
          className="bg-brass hover:bg-brass/90 text-ink font-semibold"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Retry
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin">
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}