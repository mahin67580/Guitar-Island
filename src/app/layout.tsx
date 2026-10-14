import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Guitar Island — Handpicked Guitars, Amps & Accessories",
    template: "%s — Guitar Island",
  },
  description:
    "Browse our collection of handpicked guitars, amps, and accessories. Visit our shop to try before you buy.",
  keywords: [
    "guitars",
    "electric guitars",
    "acoustic guitars",
    "bass guitars",
    "guitar shop",
    "Guitar Island",
  ],
  openGraph: {
    title: "Guitar Island — Handpicked Guitars, Amps & Accessories",
    description:
      "Browse our collection of handpicked guitars, amps, and accessories.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guitar Island",
    description:
      "Browse our collection of handpicked guitars, amps, and accessories.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseOrigin = supabaseUrl
    ? new URL(supabaseUrl).origin
    : "";

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {supabaseOrigin && (
          <>
            <link rel="preconnect" href={supabaseOrigin} />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        )}
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster richColors position="top-center" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MusicStore",
              name: "Guitar Island",
              description:
                "Handpicked guitars, amps, and accessories. Visit our shop to try before you buy.",
              image: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/og-image.png`,
              url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
              priceRange: "৳৳",
            }),
          }}
        />
      </body>
    </html>
  );
}