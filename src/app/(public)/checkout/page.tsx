import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CheckoutForm from "@/components/public/checkout/CheckoutForm";

export const metadata = {
  title: "Checkout — Guitar Island",
  description: "Complete your order",
};

export default function CheckoutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-brass transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to cart
      </Link>

      <h1 className="font-display text-3xl md:text-4xl text-ink mb-2">
        Checkout
      </h1>
      <p className="text-ink/60 mb-8">
        Complete your details below to place your order
      </p>

      <CheckoutForm />
    </div>
  );
}