import Image from "next/image";
import { CalendarClock, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SectionHeading from "@/components/public/SectionHeading";
import { format } from "date-fns";

export default async function UpcomingPreview() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("upcoming_products")
    .select("*")
    .eq("is_published", true)
    .order("expected_date", { ascending: true })
    .limit(3);

  if (!items || items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <SectionHeading
        title="Coming Soon"
        subtitle="New arrivals on the way to our shop."
        viewAllHref="/upcoming"
        viewAllLabel="See all upcoming"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl overflow-hidden border border-black/5"
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
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
              <span className="absolute top-3 left-3 bg-brass text-ink text-xs font-semibold px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-medium text-ink mb-2">{item.name}</h3>
              {item.expected_date && (
                <p className="text-xs text-ink/50 flex items-center gap-1.5 mb-2">
                  <CalendarClock className="w-3.5 h-3.5" />
                  Expected {format(new Date(item.expected_date), "MMM yyyy")}
                </p>
              )}
              {item.description && (
                <p className="text-sm text-ink/60 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}