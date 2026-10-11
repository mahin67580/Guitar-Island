"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Check, Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";

export default function MessagesClient({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Message | null>(null);
  const [, startTransition] = useTransition();

  const toggleRead = async (msg: Message) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("messages")
      .update({ is_read: !msg.is_read })
      .eq("id", msg.id);
    if (error) return toast.error(error.message);
    toast.success(msg.is_read ? "Marked unread" : "Marked read");
    if (selected?.id === msg.id) {
      setSelected({ ...msg, is_read: !msg.is_read });
    }
    startTransition(() => router.refresh());
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Message deleted");
    if (selected?.id === id) setSelected(null);
    startTransition(() => router.refresh());
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4">
      {/* List */}
      <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="text-center py-16 rounded-xl bg-cream/50">
            <Mail className="w-12 h-12 mx-auto mb-3 text-ink/20" />
            <p className="text-ink/60">No messages yet.</p>
          </div>
        )}
        {messages.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m)}
            className={cn(
              "w-full text-left p-4 rounded-xl border transition-colors",
              selected?.id === m.id
                ? "border-brass bg-brass/5"
                : "border-black/5 bg-white hover:border-black/10",
              !m.is_read && "border-l-4 border-l-brass"
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className={cn("font-medium text-ink", !m.is_read && "font-semibold")}>
                {m.name}
              </p>
              {!m.is_read && (
                <span className="w-2 h-2 rounded-full bg-brass shrink-0 mt-1.5" />
              )}
            </div>
            <p className="text-sm text-ink/60 line-clamp-1 mb-1">
              {m.subject || "(No subject)"}
            </p>
            <p className="text-xs text-ink/50 line-clamp-2">{m.message}</p>
            <p className="text-xs text-ink/40 mt-2">
              {format(new Date(m.created_at), "MMM d, h:mm a")}
            </p>
          </button>
        ))}
      </div>

      {/* Detail */}
      <div className="rounded-xl border border-black/5 bg-white p-6 md:sticky md:top-20 md:self-start">
        {!selected ? (
          <div className="text-center py-16">
            <MailOpen className="w-12 h-12 mx-auto mb-3 text-ink/20" />
            <p className="text-ink/60">Select a message to read</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl text-ink">
                  {selected.name}
                </h2>
                <p className="text-xs text-ink/50 mt-1">
                  {format(new Date(selected.created_at), "MMMM d, yyyy · h:mm a")}
                </p>
              </div>
              <Badge variant={selected.is_read ? "secondary" : "default"}>
                {selected.is_read ? "Read" : "Unread"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2 p-4 rounded-lg bg-cream/40 text-sm">
              {selected.phone && (
                <p>
                  <strong className="text-ink/60">Phone:</strong>{" "}
                  {selected.phone}
                </p>
              )}
              {selected.email && (
                <p>
                  <strong className="text-ink/60">Email:</strong>{" "}
                  {selected.email}
                </p>
              )}
              {selected.subject && (
                <p>
                  <strong className="text-ink/60">Subject:</strong>{" "}
                  {selected.subject}
                </p>
              )}
            </div>

            <div className="p-4 rounded-lg border border-black/5">
              <p className="whitespace-pre-line text-ink leading-relaxed">
                {selected.message}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {selected.email && (
                <Button
                  asChild
                  className="bg-brass hover:bg-brass/90 text-ink font-semibold"
                >
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${
                      selected.subject || "Your message"
                    }`}
                  >
                    <Reply className="w-4 h-4 mr-2" />
                    Reply by Email
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => toggleRead(selected)}
              >
                {selected.is_read ? (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Mark Unread
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Mark Read
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleDelete(selected.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}