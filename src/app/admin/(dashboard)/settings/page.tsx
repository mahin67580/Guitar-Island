import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "@/components/admin/SettingsForm";

export const metadata = { title: "Settings — Admin" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  const settings = (data?.data as Record<string, any>) || {};

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Store Settings</h1>
        <p className="text-ink/60 text-sm">
          Info shown across the site — contact, hours, socials.
        </p>
      </div>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}