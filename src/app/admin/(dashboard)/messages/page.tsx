import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import MessagesClient from "@/components/admin/MessagesClient";
import type { Message } from "@/lib/types";

export const metadata = { title: "Messages — Admin" };

export default async function AdminMessagesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">Messages</h1>
        <p className="text-ink/60 text-sm">
          Contact form submissions from the public site.
        </p>
      </div>
      <MessagesClient messages={(data as Message[]) || []} />
    </div>
  );
}