import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";

import { CartProvider } from "@/hooks/useCart";
import { getStoreSettings } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings();

  return (
    <CartProvider>

      <Navbar settings={settings} />
      <main className="min-h-screen pt-16 md:pt-20">{children}</main>
      <Footer />
      <WhatsAppButton whatsapp={settings.whatsapp} />
    </CartProvider>
  );
}