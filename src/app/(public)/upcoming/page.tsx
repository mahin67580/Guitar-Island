import Image from "next/image";
import { CalendarClock, ImageIcon, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import NotifyMeDialog from "@/components/public/upcoming/NotifyMeDialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { UpcomingProduct } from "@/lib/types";

export const metadata = {
  title: "Upcoming Arrivals — Guitar Island",
  description:
    "New guitars and gear arriving soon. Get notified when they land in-store.",
};

export default async function UpcomingPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("upcoming_products")
    .select("*")
    .eq("is_published", true)
    .order("expected_date", { ascending: true });

  const list = (items as UpcomingProduct[]) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-15">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 text-brass text-sm mb-3">
          <Sparkles className="w-4 h-4" />
          <span className="uppercase tracking-widest">Coming Soon</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-3">
          Upcoming Arrivals
        </h1>
        <p className="text-ink/60 max-w-2xl mx-auto">
          New guitars and gear on the way to our shop. Leave your details and
          we&apos;ll let you know when they arrive.
        </p>
      </div>

      {/* Empty state */}
      {list.length === 0 && (
        <div className="text-center py-24 rounded-2xl bg-cream/50">
          <CalendarClock className="w-16 h-16 text-ink/20 mx-auto mb-4" />
          <h3 className="font-display text-2xl text-ink mb-2">
            No upcoming arrivals right now
          </h3>
          <p className="text-ink/60 max-w-md mx-auto">
            Check back soon — we&apos;re always looking for new instruments to
            bring in.
          </p>
        </div>
      )}

      {/* Grid */}
      {list.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-black/5 flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-cream/50">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-ink/20">
                    <ImageIcon className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-brass hover:bg-brass text-ink font-semibold">
                    Coming Soon
                  </Badge>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-display text-xl text-ink mb-2">
                  {item.name}
                </h3>

                {item.expected_date && (
                  <p className="text-xs text-ink/50 flex items-center gap-1.5 mb-3">
                    <CalendarClock className="w-3.5 h-3.5" />
                    Expected {format(new Date(item.expected_date), "MMMM yyyy")}
                  </p>
                )}

                {item.description && (
                  <p className="text-sm text-ink/60 mb-4 line-clamp-3 flex-1">
                    {item.description}
                  </p>
                )}

                <div className="mt-auto pt-3">
                  <NotifyMeDialog
                    upcomingProductId={item.id}
                    productName={item.name}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}