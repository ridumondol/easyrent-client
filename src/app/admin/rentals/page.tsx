import { Suspense } from "react";
import AdminRentals from "@/components/admin/AdminRentals";

export default function AdminRentalsPage() {
  return (
    <Suspense fallback={null}>
      <AdminRentals />
    </Suspense>
  );
}
