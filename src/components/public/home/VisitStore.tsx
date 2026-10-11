import Link from "next/link";
import { Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VisitStore() {
  return (
    <section className="bg-ink text-cream py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: text */}
        <div>
          <p className="text-brass uppercase tracking-widest text-sm mb-3">
            Visit Our Store
          </p>
          <h2 className="font-display text-4xl md:text-5xl mb-6 leading-tight">
            Come Play Before
            <br />
            You Buy
          </h2>
          <p className="text-cream/70 max-w-lg mb-8 leading-relaxed">
            Nothing beats holding a guitar in your hands. Drop by our shop,
            plug in, and let the instrument speak to you. Our team is here to
            help you find the one.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brass mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Guitar Island Shop</p>
                <p className="text-sm text-cream/60">
                  Your shop address, Dhaka, Bangladesh
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-brass shrink-0" />
              <a
                href="tel:+8801700000000"
                className="hover:text-brass transition-colors"
              >
                +880 1700-000000
              </a>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-brass mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Open Daily</p>
                <p className="text-sm text-cream/60">
                  10:00 AM – 9:00 PM (Fri: 3:00 PM – 9:00 PM)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              size="lg"
              className="bg-brass hover:bg-brass/90 text-ink font-semibold"
            >
              <Link href="/contact">Get Directions</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="border border-cream/30 text-cream hover:bg-cream/10 hover:text-brass bg-transparent"
            >
              <a
                href="https://wa.me/8801700000000"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Us
              </a>
            </Button>
          </div>
        </div>

        {/* Right: map placeholder */}
        <div className="relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden border border-white/10">
          <iframe
            title="Guitar Island location"
            src="https://www.google.com/maps?q=Dhaka,Bangladesh&output=embed"
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}