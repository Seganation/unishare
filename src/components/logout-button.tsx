"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Sign out and redirect to login page
      await signOut({
        callbackUrl: "/login",
        redirect: true,
      });
      // After signout, force a hard reload to clear any cached data
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoading(false);
      // Fallback: force redirect even if signout fails
      window.location.href = "/login";
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="group flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      title="Sign out"
    >
      <LogOut
        className={`h-4 w-4 transition-transform ${
          isLoading ? "animate-spin" : "group-hover:translate-x-1"
        }`}
      />
      <span className="hidden lg:inline">
        {isLoading ? "Logging out..." : "Logout"}
      </span>
    </button>
  );
}
