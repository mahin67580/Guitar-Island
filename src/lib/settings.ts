import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type StoreSettings = {
  store_name: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  hours: string;
  facebook: string;
  instagram: string;
  google_maps_query: string;
  hero_headline: string;
  hero_subheadline: string;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  store_name: "Guitar Island",
  address: "Dhaka, Bangladesh",
  phone: "+880 1700-000000",
  whatsapp: "8801700000000",
  email: "hello@guitarisland.com",
  hours: "Sat – Thu: 10:00 AM – 9:00 PM\nFriday: 3:00 PM – 9:00 PM",
  facebook: "https://www.facebook.com/GUITAR.ISLAND",
  instagram: "",
  google_maps_query: "Dhaka,Bangladesh",
  hero_headline: "Find Your Sound at",
  hero_subheadline:
    "Browse our collection, come play in-store, and walk out with the guitar you were meant to play.",
};

/**
 * Fetch store settings from Supabase. Falls back to defaults if anything is
 * missing. Cached per-request so it's only fetched once per render.
 */
export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("data")
    .eq("id", 1)
    .single();

  const stored = (data?.data as Partial<StoreSettings>) || {};

  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    // Ensure whatsapp is digits only
    whatsapp: (stored.whatsapp || DEFAULT_SETTINGS.whatsapp).replace(
      /\D/g,
      ""
    ),
  };
});