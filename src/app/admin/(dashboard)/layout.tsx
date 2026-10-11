import { requireAdmin } from "@/lib/auth/helpers";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <AdminShell
      email={user.email}
      fullName={user.profile?.full_name ?? null}
    >
      {children}
    </AdminShell>
  );
}