import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import Link from "next/link";
import { Book, Calendar, FileText, LogOut, Settings, User } from "lucide-react";

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
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/courses" className="group flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 transition-transform group-hover:scale-105">
                <Book className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
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
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-3 rounded-lg bg-gray-50 px-4 py-2 md:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-semibold text-white">
                  {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500">{session.user.email}</p>
                </div>
              </div>

              {/* Settings & Logout */}
              <Link
                href="/settings"
                className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-gray-200 bg-white md:hidden">
        <div className="grid grid-cols-4 gap-1 p-2">
          <MobileNavLink href="/courses" icon={Book}>
            Courses
          </MobileNavLink>
          <MobileNavLink href="/timetable" icon={Calendar}>
            Timetable
          </MobileNavLink>
          <MobileNavLink href="/articles" icon={FileText}>
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
      className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-gray-600 transition-colors hover:bg-purple-50 hover:text-purple-600"
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
      className="flex flex-col items-center gap-1 rounded-lg py-2 text-gray-600 transition-colors hover:bg-purple-50 hover:text-purple-600"
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{children}</span>
    </Link>
  );
}
