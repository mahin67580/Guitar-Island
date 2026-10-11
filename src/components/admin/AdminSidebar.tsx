"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Guitar,
  LayoutDashboard,
  Package,
  FolderTree,
  MessageSquare,
  Sparkles,
  CalendarClock,
  Bell,
  Newspaper,
  Users,
  Mail,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: FolderTree },
      { href: "/admin/upcoming", label: "Upcoming", icon: CalendarClock },
    ],
  },
  {
    label: "Customers",
    items: [
      { href: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
      { href: "/admin/wish-requests", label: "Wish Requests", icon: Sparkles },
      { href: "/admin/notify-requests", label: "Notify Requests", icon: Bell },
      { href: "/admin/messages", label: "Messages", icon: Mail },
      { href: "/admin/customers", label: "All Customers", icon: Users },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/blog", label: "Blog Posts", icon: Newspaper },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

type Props = {
  onNavigate?: () => void;
};

export default function AdminSidebar({ onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-ink text-cream h-full flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-2 group"
        >
          <Guitar className="w-6 h-6 text-brass group-hover:rotate-12 transition-transform" />
          <div>
            <p className="font-display text-lg leading-tight">Guitar Island</p>
            <p className="text-[10px] text-cream/40 uppercase tracking-widest">
              Admin Panel
            </p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-cream/40 px-3 mb-2">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const { href, label, icon: Icon } = item;
                const active =
                  href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      active
                        ? "bg-brass/15 text-brass font-medium"
                        : "text-cream/70 hover:bg-white/5 hover:text-cream"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 text-xs text-cream/40 hover:text-brass transition-colors"
        >
          ← Back to shop
        </Link>
      </div>
    </aside>
  );
}