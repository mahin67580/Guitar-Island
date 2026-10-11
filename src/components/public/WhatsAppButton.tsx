"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const phone = "8801700000000"; // replace with real number, no + or spaces
  const message = encodeURIComponent(
    "Hi Guitar Island! I'm interested in a guitar from your website."
  );
  const href = `https://wa.me/${phone}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={cn(
        "fixed bottom-6 right-6 z-40 flex items-center justify-center",
        "h-14 w-14 rounded-full bg-[#25D366] text-white shadow-xl",
        "hover:scale-110 hover:shadow-2xl transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <MessageCircle className="w-7 h-7" strokeWidth={2.2} />
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-40 animate-ping" />
    </a>
  );
}