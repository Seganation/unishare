import { redirect } from "next/navigation";

/**
 * Admin dashboard redirect
 * Redirects to the approvals page as the main admin function
 */
export default function AdminPage() {
  redirect("/admin/approvals");
}
