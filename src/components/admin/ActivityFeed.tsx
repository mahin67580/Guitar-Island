import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Bell, MessageSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  enquiry: {
    icon: MessageSquare,
    bg: "bg-blue-50 text-blue-600",
    href: "/admin/enquiries",
    label: "Enquiry",
  },
  wish: {
    icon: Sparkles,
    bg: "bg-purple-50 text-purple-600",
    href: "/admin/wish-requests",
    label: "Wish",
  },
  message: {
    icon: Bell,
    bg: "bg-amber-50 text-amber-600",
    href: "/admin/messages",
    label: "Message",
  },
} as const;

type Activity = {
  type: "enquiry" | "wish" | "message";
  id: string;
  name: string;
  detail: string;
  created_at: string;
};

export default function ActivityFeed({ items }: { items: Activity[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-ink/50 text-sm">
        No activity yet.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const config = ICON_MAP[item.type];
        const Icon = config.icon;
        return (
          <Link
            key={`${item.type}-${item.id}`}
            href={config.href}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-cream/50 transition-colors group"
          >
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                config.bg
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink leading-snug">
                <strong className="font-medium">{item.name}</strong>
                <span className="text-ink/60"> · {item.detail}</span>
              </p>
              <p className="text-xs text-ink/50 mt-0.5">
                {formatDistanceToNow(new Date(item.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}