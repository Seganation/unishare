"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, BookOpen, Calendar, FileText, Sparkles } from "lucide-react";
import { ThemeToggle } from "~/components/theme-toggle";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-card/90 border-border sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 font-bold text-white">
              U
            </div>
            <span className="text-lg font-bold">UNIShare</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 md:flex">
            <NavLink href="/articles" icon={BookOpen}>
              Articles
            </NavLink>
            <NavLink href="/courses" icon={FileText}>
              Courses
            </NavLink>
            <NavLink href="/timetable" icon={Calendar}>
              Timetable
            </NavLink>
            <NavLink href="/ai" icon={Sparkles}>
              AI
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Mobile menu toggle */}
            <button
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="hover:bg-muted/50 inline-flex items-center justify-center rounded-lg p-2 md:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-border bg-card border-t md:hidden">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col gap-2">
              <MobileNavLink href="/articles" icon={BookOpen}>
                Articles
              </MobileNavLink>
              <MobileNavLink href="/courses" icon={FileText}>
                Courses
              </MobileNavLink>
              <MobileNavLink href="/timetable" icon={Calendar}>
                Timetable
              </MobileNavLink>
              <MobileNavLink href="/ai" icon={Sparkles}>
                AI
              </MobileNavLink>
              <div className="mt-2 flex gap-2">
                <Link
                  href="/login"
                  className="border-primary flex-1 rounded-lg border px-4 py-2 text-center font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary flex-1 rounded-lg px-4 py-2 text-center font-medium text-white"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="hover:bg-primary/10 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
}

function MobileNavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="hover:bg-muted/50 flex items-center gap-3 rounded-md px-3 py-2"
    >
      <Icon className="h-4 w-4" />
      <span className="font-medium">{children}</span>
    </Link>
  );
}

export default SiteHeader;
