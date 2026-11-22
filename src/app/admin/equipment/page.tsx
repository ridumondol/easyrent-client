import { Suspense } from "react";
import AdminEquipment from "@/components/admin/AdminEquipment";

export default function AdminEquipmentPage() {
  return (
    <Suspense fallback={null}>
      <AdminEquipment />
    </Suspense>
  );
}
