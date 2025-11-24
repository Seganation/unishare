"use client";

import Link from "next/link";
import { LayoutDashboard, LogIn } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useSession } from "~/hooks/use-session";

export function ArticleNav() {
  const { data: session, isLoading } = useSession();

  if (isLoading) {
    return null; // or a loading skeleton
  }

  return (
    <div className="fixed right-4 top-4 z-50">
      {session?.user ? (
        <Link href="/courses">
          <Button
            variant="secondary"
            className="shadow-lg backdrop-blur-sm"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      ) : (
        <Link href="/login">
          <Button
            variant="secondary"
            className="shadow-lg backdrop-blur-sm"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        </Link>
      )}
    </div>
  );
}
