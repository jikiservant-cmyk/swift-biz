import { AdminUsersPage } from "@/components/admin/AdminUsersPage";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminUsersPage />
    </AdminLayout>
  );
}
