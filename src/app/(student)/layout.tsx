import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import Link from "next/link";
import { Book, Calendar, FileText, User, Edit3, Sparkles } from "lucide-react";
import { ThemeToggle } from "~/components/theme-toggle";
import { UserMenuDropdown } from "~/components/user-menu-dropdown";
import { RandomLogo } from "~/components/random-logo";
import { NotificationBell } from "~/components/notification-bell";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect if not authenticated or not approved
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "PENDING") {
    redirect("/waiting-approval");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin/approvals");
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Top Navigation */}
      <nav className="border-border bg-card/80 sticky top-0 z-40 border-b backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/courses" className="group flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center transition-transform group-hover:scale-105">
                <RandomLogo />
              </div>
              <span className="font-unishare text-primary text-xl font-bold">
                UNIShare
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden items-center gap-1 md:flex">
              <NavLink href="/courses" icon={Book}>
                Courses
              </NavLink>
              <NavLink href="/timetable" icon={Calendar}>
                Timetable
              </NavLink>
              <NavLink href="/articles" icon={FileText}>
                Articles
              </NavLink>
              <NavLink href="/my-articles" icon={Edit3}>
                My Articles
              </NavLink>
              <NavLink href="/ai" icon={Sparkles}>
                AI Assistant
              </NavLink>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <NotificationBell />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Dropdown */}
              <UserMenuDropdown session={session} />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="border-border bg-card fixed right-0 bottom-0 left-0 z-40 border-t md:hidden">
        <div className="grid grid-cols-5 gap-1 p-2">
          <MobileNavLink href="/courses" icon={Book}>
            Courses
          </MobileNavLink>
          <MobileNavLink href="/timetable" icon={Calendar}>
            Timetable
          </MobileNavLink>
          <MobileNavLink href="/ai" icon={Sparkles}>
            AI
          </MobileNavLink>
          <MobileNavLink href="/my-articles" icon={Edit3}>
            Articles
          </MobileNavLink>
          <MobileNavLink href="/settings" icon={User}>
            Profile
          </MobileNavLink>
        </div>
      </div>

      {/* Main Content */}
      <main className="pb-20 md:pb-8">{children}</main>
    </div>
  );
}

// Nav Link Component
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
      className="text-muted-foreground hover:bg-primary/10 hover:text-primary flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors"
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </Link>
  );
}

// Mobile Nav Link Component
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
      className="text-muted-foreground hover:bg-primary/10 hover:text-primary flex flex-col items-center gap-1 rounded-lg py-2 transition-colors"
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{children}</span>
    </Link>
  );
}
