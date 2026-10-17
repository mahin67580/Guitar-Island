"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Guitar, Heart, Menu, Phone, X, PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { StoreSettings } from "@/lib/settings";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/upcoming", label: "Upcoming" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type Props = { settings: StoreSettings };

export default function Navbar({ settings }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { itemCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem("gi_wishlist");
        const arr = raw ? JSON.parse(raw) : [];
        setWishlistCount(Array.isArray(arr) ? arr.length : 0);
      } catch {
        setWishlistCount(0);
      }
    };
    read();
    window.addEventListener("storage", read);
    window.addEventListener("gi_wishlist_changed", read as EventListener);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("gi_wishlist_changed", read as EventListener);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const whatsappHref = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
    "Hi! I'm interested in a guitar from your website."
  )}`;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-ink/95 backdrop-blur-md border-b border-white/10 shadow-lg"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt={settings.store_name}
              className="w-10 h-10 object-contain group-hover:rotate-12 transition-transform"
            />
            <span className="font-display text-xl md:text-2xl text-cream tracking-wide">
              {settings.store_name}

            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    active
                      ? "text-brass"
                      : "text-cream/90 hover:text-brass hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-sm text-cream/90 hover:text-brass transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{settings.phone}</span>
            </a>

            <Link
              href="/wishlist"
              className="relative p-2 text-cream/90 hover:text-brass transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-retro text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Track Order */}
            <Link
              href="/track/latest"
              className="p-2 text-cream/90 hover:text-brass transition-colors hidden md:block"
              title="Track your order"
            >
              <PackageSearch className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-cream/90 hover:text-brass transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brass text-ink text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            <Button
              asChild
              size="sm"
              className="hidden md:inline-flex bg-brass hover:bg-brass/90 text-ink font-semibold"
            >
              <Link href="/contact">Visit Store</Link>
            </Button>

            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 text-cream"
              aria-label="Menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 bg-ink/98 backdrop-blur-md border-t border-white/10",
          open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col p-4 gap-1">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-3 rounded-md text-base font-medium transition-colors",
                  active
                    ? "text-brass bg-white/5"
                    : "text-cream/90 hover:text-brass hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/wishlist"
            className="px-4 py-3 rounded-md text-base font-medium text-cream/90 hover:text-brass hover:bg-white/5 flex items-center gap-2"
          >
            <Heart className="w-4 h-4" />
            Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
          </Link>

          <Link
            href="/track/latest"
            className="px-4 py-3 rounded-md text-base font-medium text-cream/90 hover:text-brass hover:bg-white/5 flex items-center gap-2"
          >
            <PackageSearch className="w-4 h-4" />
            Track Order
          </Link>

          <Link
            href="/cart"
            className="px-4 py-3 rounded-md text-base font-medium text-cream/90 hover:text-brass hover:bg-white/5 flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Cart {itemCount > 0 && `(${itemCount})`}
          </Link>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-md text-base font-medium text-cream/90 hover:text-brass hover:bg-white/5 flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Chat on WhatsApp
          </a>
          <Button
            asChild
            className="mt-2 bg-brass hover:bg-brass/90 text-ink font-semibold"
          >
            <Link href="/contact">Visit Store</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}