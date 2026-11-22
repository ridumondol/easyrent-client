import { Suspense } from "react";
import AdminProfile from "@/components/admin/AdminProfile";

export default function AdminProfilePage() {
  return (
    <Suspense fallback={null}>
      <AdminProfile />
    </Suspense>
  );
}
