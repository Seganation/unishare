import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

/**
 * Admin layout - ensures only ADMIN users can access admin routes
 * Checks authentication on the server side before rendering
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  // Redirect if not an admin
  if (session.user.role !== "ADMIN") {
    redirect("/courses");
  }

  return <>{children}</>;
}

// Disable caching for admin pages to ensure fresh auth checks
export const dynamic = "force-dynamic";
export const revalidate = 0;
