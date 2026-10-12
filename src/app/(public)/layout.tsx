import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import WhatsAppButton from "@/components/public/WhatsAppButton";
import { getStoreSettings } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings();

  return (
    <>
      <Navbar settings={settings} />
      <main className="min-h-screen ">{children}</main>
      <Footer />
      <WhatsAppButton whatsapp={settings.whatsapp} />
    </>
  );
}