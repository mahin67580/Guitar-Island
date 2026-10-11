import Link from "next/link";
import { Guitar, Mail, MapPin, Phone } from "lucide-react";
import { getStoreSettings } from "@/lib/settings";

const QUICK_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/upcoming", label: "Upcoming" },
  { href: "/blog", label: "Blog" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const CATEGORIES = [
  { href: "/shop?category=electric-guitars", label: "Electric Guitars" },
  { href: "/shop?category=acoustic-guitars", label: "Acoustic Guitars" },
  { href: "/shop?category=bass-guitars", label: "Bass Guitars" },
  { href: "/shop", label: "Accessories" },
];

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default async function Footer() {
  const settings = await getStoreSettings();

  return (
    <footer className="bg-ink text-cream/80 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Guitar className="w-7 h-7 text-brass" />
              <span className="font-display text-2xl text-cream">
                {settings.store_name}
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Your trusted destination for handpicked guitars, amps, and
              accessories. Come play before you buy.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {settings.facebook && (
                <a
                  href={settings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/5 hover:bg-brass hover:text-ink transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/5 hover:bg-brass hover:text-ink transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display text-lg text-cream mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brass transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display text-lg text-cream mb-4">
              Categories
            </h3>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-brass transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg text-cream mb-4">Visit Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-brass shrink-0" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brass shrink-0" />
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-brass transition-colors">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brass shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-brass transition-colors">
                  {settings.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} {settings.store_name}. All rights reserved.</p>
          <p className="text-cream/50">Built with love for musicians 🎸</p>
        </div>
      </div>
    </footer>
  );
}