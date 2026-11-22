import { Suspense } from "react";
import AdminUsers from "@/components/admin/AdminUsers";

export default function AdminUsersPage() {
  return (
    <Suspense fallback={null}>
      <AdminUsers />
    </Suspense>
  );
}
