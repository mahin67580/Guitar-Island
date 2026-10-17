"use client";


import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
  Images,
  ShoppingBag,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
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
      { href: "/admin/gallery", label: "Gallery", icon: Images },
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

  const [newEnquiries, setNewEnquiries] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    const fetchCount = async () => {
      const { count } = await supabase
        .from("enquiries")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      if (!cancelled) setNewEnquiries(count ?? 0);
    };

    fetchCount();

    const channelName = `sidebar-enquiries-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enquiries" },
        () => fetchCount()
      )
      .subscribe();

    // Polling fallback
    const interval = setInterval(fetchCount, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);


  const [newOrders, setNewOrders] = useState<number>(0);

  useEffect(() => {
    const supabase = createClient();
    const fetchCount = async () => {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      setNewOrders(count ?? 0);
    };
    fetchCount();

    const channelName = `sidebar-orders-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchCount()
      )
      .subscribe();

    const interval = setInterval(fetchCount, 30000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);


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
                      "flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      active
                        ? "bg-brass/15 text-brass font-medium"
                        : "text-cream/70 hover:bg-white/5 hover:text-cream"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{label}</span>
                    </span>
                    {href === "/admin/enquiries" && newEnquiries > 0 && (
                      <span className="bg-retro text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1.5 flex items-center justify-center">
                        {newEnquiries > 99 ? "99+" : newEnquiries}
                      </span>
                    )}

                    {href === "/admin/orders" && newOrders > 0 && (
                      <span className="bg-retro text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1.5 flex items-center justify-center">
                        {newOrders > 99 ? "99+" : newOrders}
                      </span>
                    )}

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