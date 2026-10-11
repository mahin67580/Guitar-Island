import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Returns the current user + their profile, or null if not logged in.
 */
export async function getCurrentUser(): Promise<{
  userId: string;
  email: string;
  profile: Profile | null;
  isAdmin: boolean;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    email: user.email ?? "",
    profile: (profile as Profile) || null,
    isAdmin: profile?.role === "admin",
  };
}

/**
 * Requires an admin user. Redirects to /admin/login if not logged in,
 * or to / if logged in but not an admin.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!user.isAdmin) redirect("/");
  return user;
}