"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Settings, LogOut, ChevronDown } from "lucide-react";
import type { Session } from "next-auth";
import { AVATAR_COLORS } from "~/lib/constants";

interface UserMenuDropdownProps {
  session: Session;
}

export function UserMenuDropdown({ session }: UserMenuDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get avatar color based on user's avatarIndex (default to 0 if not set)
  const avatarColor =
    AVATAR_COLORS[session.user?.avatarIndex ?? 0] ?? AVATAR_COLORS[0]!;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({
        callbackUrl: "/login",
        redirect: true,
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
      window.location.href = "/login";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-muted hover:bg-muted/80 flex items-center gap-2 rounded-lg px-3 py-2 transition-colors md:px-4 md:py-2"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div
          className={`${avatarColor.bg} flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white`}
        >
          {session.user?.name?.charAt(0).toUpperCase()}
        </div>
        <span className="text-foreground hidden text-sm font-semibold sm:inline">
          {session.user?.name}
        </span>
        <ChevronDown
          className={`text-muted-foreground h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="bg-card border-border absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border shadow-lg">
          {/* User Info */}
          <div className="bg-muted/50 border-border border-b px-4 py-3">
            <p className="text-foreground text-sm font-semibold">
              {session.user?.name}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              {session.user?.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Settings Button */}
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="text-foreground hover:bg-muted/50 flex items-center gap-3 px-4 py-2 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Settings</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="text-foreground hover:bg-muted/50 flex w-full items-center gap-3 px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">
                {isLoading ? "Logging out..." : "Logout"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
