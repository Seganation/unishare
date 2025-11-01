import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import Link from "next/link";
import { Book, Calendar, FileText, Settings, User, Edit3 } from "lucide-react";
import { ThemeToggle } from "~/components/theme-toggle";
import { LogoutButton } from "~/components/logout-button";

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
              <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-105">
                <Book className="text-primary-foreground h-6 w-6" />
              </div>
              <span className="text-primary text-xl font-bold">UNIShare</span>
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
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <ThemeToggle />

              <div className="bg-muted hidden items-center gap-3 rounded-lg px-4 py-2 md:flex">
                <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="text-foreground font-semibold">
                    {session.user.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {session.user.email}
                  </p>
                </div>
              </div>

              {/* Settings & Logout */}
              <Link
                href="/settings"
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Link>
              <LogoutButton />
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
          <MobileNavLink href="/articles" icon={FileText}>
            Articles
          </MobileNavLink>
          <MobileNavLink href="/my-articles" icon={Edit3}>
            My Articles
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