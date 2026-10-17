import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImageIcon, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import EnquiryDialog from "@/components/public/EnquiryDialog";
import WishlistButton from "@/components/public/WishlistButton";
import ProductCard from "@/components/public/ProductCard";
import SectionHeading from "@/components/public/SectionHeading";
import type { Product } from "@/lib/types";
import ProductGallery from "@/components/public/ProductGallery";
import AddToCartButton from "@/components/public/cart/AddToCartButton";
import BuyNowButton from "@/components/public/cart/BuyNowButton";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(id, name, slug)")
    .eq("slug", slug)
    .single();

  if (!product) notFound();

  const p = product as Product;
  const price = Number(p.price);
  const discountPrice = p.discount_price ? Number(p.discount_price) : null;
  const hasDiscount = discountPrice !== null && discountPrice < price;
  const isSoldOut = p.quantity <= 0 || p.status === "sold_out";
  const mainImage = p.images?.[0];

  // Related products (same category, exclude self)
  const { data: related } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .eq("category_id", p.category_id || "")
    .neq("id", p.id)
    .limit(3);

  const { getStoreSettings } = await import("@/lib/settings");
  const settings = await getStoreSettings();
  const whatsappMessage = encodeURIComponent(
    `Hi ${settings.store_name}! I'm interested in the ${p.name} (৳${price.toLocaleString()}). Is it available?`
  );
  const whatsappHref = `https://wa.me/${settings.whatsapp}?text=${whatsappMessage}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-15">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-1 text-sm text-ink/60 hover:text-brass transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to shop
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-20">
        {/* Image gallery */}
        <ProductGallery
          images={p.images || []}
          alt={p.name}
          isSoldOut={isSoldOut}
        />

        {/* Info */}
        <div>
          {p.brand && (
            <p className="text-sm uppercase tracking-wide text-ink/50 mb-1">
              {p.brand}
            </p>
          )}
          <h1 className="font-display text-3xl md:text-4xl text-ink mb-4">
            {p.name}
          </h1>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            {p.condition === "Used" && <Badge variant="secondary">Used</Badge>}
            {p.category && (
              <Badge variant="outline">{p.category.name}</Badge>
            )}
            {!isSoldOut && p.quantity <= p.low_stock_threshold && (
              <Badge className="bg-retro hover:bg-retro">
                Only {p.quantity} left
              </Badge>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-4xl text-ink">
              ৳{(hasDiscount ? discountPrice! : price).toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-lg text-ink/40 line-through">
                ৳{price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Short description */}
          {p.short_description && (
            <p className="text-ink/70 mb-6 leading-relaxed">
              {p.short_description}
            </p>
          )}

          {/* Stock */}
          <p className="text-sm text-ink/60 mb-6">
            {isSoldOut
              ? "Currently sold out — send an enquiry and we'll let you know when it's back."
              : `${p.quantity} in stock · Ready for you to try in-store`}
          </p>

          {/* CTAs */}
          <div className="space-y-3 mb-8">
            {/* Primary CTAs — cart & buy now */}
            {!isSoldOut && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AddToCartButton
                  productId={p.id}
                  name={p.name}
                  slug={p.slug}
                  brand={p.brand ?? null}
                  image={p.images?.[0] ?? null}
                  unitPrice={hasDiscount ? discountPrice! : price}
                  maxQuantity={p.quantity}
                />
                <BuyNowButton
                  productId={p.id}
                  name={p.name}
                  slug={p.slug}
                  brand={p.brand ?? null}
                  image={p.images?.[0] ?? null}
                  unitPrice={hasDiscount ? discountPrice! : price}
                  maxQuantity={p.quantity}
                />
              </div>
            )}

            {/* Secondary CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <WishlistButton productId={p.id} productName={p.name} />
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <Share2 className="w-5 h-5 mr-2" />
                  Ask on WhatsApp
                </a>
              </Button>
            </div>

            {/* Enquire — moved below, more subtle */}
            {isSoldOut && (
              <div className="pt-2">
                <p className="text-sm text-ink/60 mb-3">
                  This guitar is currently sold out. Send us an enquiry and we'll let
                  you know when it&apos;s back.
                </p>
                <EnquiryDialog productId={p.id} productName={p.name} />
              </div>
            )}
          </div>

          <Separator className="my-8" />

          {/* Full description */}
          {p.description && (
            <div className="mb-8">
              <h2 className="font-display text-xl text-ink mb-3">
                Description
              </h2>
              <p className="text-ink/70 leading-relaxed whitespace-pre-line">
                {p.description}
              </p>
            </div>
          )}

          {/* Specs */}
          {p.specs && Object.keys(p.specs).length > 0 && (
            <div>
              <h2 className="font-display text-xl text-ink mb-3">
                Specifications
              </h2>
              <div className="rounded-lg border border-black/5 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(p.specs).map(([key, value], i) => (
                      <tr
                        key={key}
                        className={i % 2 === 0 ? "bg-cream/40" : "bg-white"}
                      >
                        <td className="py-3 px-4 font-medium text-ink/70 capitalize w-1/3">
                          {key.replace(/_/g, " ")}
                        </td>
                        <td className="py-3 px-4 text-ink">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related && related.length > 0 && (
        <section>
          <SectionHeading
            title="You Might Also Like"
            viewAllHref="/shop"
            viewAllLabel="Browse all"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(related as Product[]).map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}