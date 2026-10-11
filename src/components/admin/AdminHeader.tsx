"use client";

import { useState } from "react";
import { LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type Props = {
  email: string;
  fullName?: string | null;
  onOpenSidebar?: () => void;
};

export default function AdminHeader({
  email,
  fullName,
  onOpenSidebar,
}: Props) {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutAction();
  };

  const initials = (fullName || email)
    .split(/[\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onOpenSidebar}
        className="lg:hidden p-2 -ml-2 text-ink"
        aria-label="Open sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:block" />

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 h-10 px-2 hover:bg-cream"
          >
            <div className="w-8 h-8 rounded-full bg-brass/20 text-brass flex items-center justify-center text-xs font-bold">
              {initials || <User className="w-4 h-4" />}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-tight">
                {fullName || "Admin"}
              </p>
              <p className="text-[10px] text-ink/50 leading-tight">{email}</p>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs">
            Signed in as
            <p className="font-normal text-ink/70 truncate">{email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={loggingOut}
            className={cn(
              "text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            )}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {loggingOut ? "Signing out..." : "Sign Out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}