import { Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SavedItems from "@/components/public/wishlist/SavedItems";
import WishRequestForm from "@/components/public/wishlist/WishRequestForm";

export const metadata = {
  title: "Wishlist — Guitar Island",
  description:
    "Save guitars you love or request a custom instrument not in our catalogue.",
};

export default function WishlistPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-brass text-sm mb-2">
          <Heart className="w-4 h-4" />
          <span className="uppercase tracking-widest">Your Wishlist</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink mb-2">
          Guitars You Love
        </h1>
        <p className="text-ink/60 max-w-2xl">
          Save guitars from our collection, or tell us about the one you're
          dreaming of — we'll help you find it.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="saved" className="w-full">
        <TabsList className="mb-8 h-auto p-1 bg-cream/60 inline-flex">
          <TabsTrigger
            value="saved"
            className="px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-sm"
          >
            Saved Items
          </TabsTrigger>
          <TabsTrigger
            value="request"
            className="px-5 py-2.5 data-[state=active]:bg-white data-[state=active]:text-ink data-[state=active]:shadow-sm"
          >
            Request a Custom Guitar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="mt-0">
          <SavedItems />
        </TabsContent>

        <TabsContent value="request" className="mt-0">
          <WishRequestForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}